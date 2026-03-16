import os
from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from .database import get_db
from .models import User
from .schemas import UserLogin, Token, UserCreate, CategoriaCreate, AtividadeCreate, AtividadeUpdate, LancamentoCreate, LancamentoUpdate, UserUpdate
from .crud import (
    get_user_by_email, create_user, get_users, update_user,
    get_categorias, create_categoria, delete_categoria,
    get_atividades, get_atividade, create_atividade, update_atividade, delete_atividade,
    get_lancamentos, get_lancamento, create_lancamento, update_lancamento, delete_lancamento, get_lancamentos_admin
)
from .auth import (
    authenticate_user, create_access_token, get_current_user, get_current_active_user, 
    require_admin, ACCESS_TOKEN_EXPIRE_MINUTES, verify_password, get_password_hash
)

app = FastAPI(title="Time Tracking System", description="Sistema de controle de ponto e atividades", docs_url=None, redoc_url=None)

# Debug endpoints for Vercel troubleshooting
@app.get("/debug/env")
async def debug_environment():
    """Check environment variables"""
    import sys
    database_url = os.environ.get("DATABASE_URL")
    return {
        "python_version": sys.version,
        "database_url_exists": bool(database_url),
        "database_url_length": len(database_url) if database_url else 0,
        "database_url_preview": database_url[:50] + "..." if database_url else None,
    }

@app.get("/debug/db-test")
async def debug_database():
    """Test database connection"""
    try:
        import ssl
        from sqlalchemy import create_engine, text
        from sqlalchemy.pool import NullPool
        
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            return {"error": "DATABASE_URL not found"}
        
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        engine = create_engine(
            database_url,
            connect_args={"ssl_context": ssl_context},
            poolclass=NullPool,
        )
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            test_result = result.scalar()
        
        return {
            "status": "success",
            "test_query": test_result,
            "message": "Database connection working"
        }
        
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }

# Exception middleware for debugging
from fastapi import Request as FastAPIRequest
from fastapi.responses import Response as FastAPIResponse
import traceback

@app.middleware("http")
async def log_exceptions_middleware(request: FastAPIRequest, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        print(f"MIDDLEWARE EXCEPTION on {request.url}: {e}")
        traceback.print_exc()
        raise

# Get the absolute path to the project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=os.path.join(project_root, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(project_root, "templates"))

@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login_new.html", {"request": request})

@app.get("/api", response_class=HTMLResponse)
async def api_info():
    return {"message": "Time Tracking System API", "version": "1.0.0"}

@app.post("/token", response_class=HTMLResponse)
async def login_for_access_token(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: ============================================", flush=True)
    print(f"DEBUG: Login attempt for: {username}", flush=True)
    print(f"DEBUG: Password length: {len(password)}", flush=True)
    print(f"DEBUG: DB session: {db}", flush=True)
    try:
        from .crud import get_user_by_email
        user_check = get_user_by_email(db, email=username)
        print(f"DEBUG: User lookup result: {user_check}", flush=True)
        if user_check:
            print(f"DEBUG: User found: {user_check.email}, ativo: {user_check.ativo}", flush=True)
        
        user = authenticate_user(db, username, password)
        print(f"DEBUG: authenticate_user returned: {user}", flush=True)
        login_error = "Usuário ou senha incorretos"
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"DEBUG: Exception during auth: {e}", flush=True)
        print(error_details, flush=True)
        login_error = f"Erro técnico: {str(e)}"
        user = False
    print(f"DEBUG: ============================================", flush=True)

    if not user:
        return templates.TemplateResponse("login_new.html", {
            "request": request,
            "error": login_error
        })
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    response = RedirectResponse(url="/dashboard", status_code=status.HTTP_303_SEE_OTHER)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=1800,
        expires=1800,
    )
    return response

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    atividades = get_atividades(db)
    lancamentos = get_lancamentos(db, user_id=current_user.id, limit=10)
    return templates.TemplateResponse("dashboard_improved.html", {
        "request": request,
        "user": current_user,
        "lancamentos": lancamentos,
        "atividades": atividades
    })

@app.get("/lancamentos", response_class=HTMLResponse)
async def meus_lancamentos(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    atividades = get_atividades(db)
    lancamentos = get_lancamentos(db, user_id=current_user.id)
    
    def can_edit_lancamento(data_lancamento):
        hoje = datetime.now().date()
        ontem = hoje - timedelta(days=1)
        return data_lancamento >= ontem
    
    return templates.TemplateResponse("lancamentos.html", {
        "request": request,
        "user": current_user,
        "lancamentos": lancamentos,
        "atividades": atividades,
        "can_edit_lancamento": can_edit_lancamento
    })

@app.get("/api/lancamento/{lancamento_id}", response_class=JSONResponse)
async def get_lancamento_api(lancamento_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    lancamento = get_lancamento(db, lancamento_id=lancamento_id, user_id=current_user.id)
    if not lancamento:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    
    return {
        "id": lancamento.id,
        "data": lancamento.data.strftime('%Y-%m-%d'),
        "hora_inicio": lancamento.hora_inicio.strftime('%H:%M'),
        "hora_fim": lancamento.hora_fim.strftime('%H:%M'),
        "atividade_id": lancamento.atividade_id,
        "observacao": lancamento.observacao
    }

@app.get("/novo-lancamento", response_class=HTMLResponse)
async def novo_lancamento_page(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    atividades = get_atividades(db)
    lancamentos = get_lancamentos(db, user_id=current_user.id, limit=5)
    return templates.TemplateResponse("novo_lancamento_bootstrap.html", {
        "request": request,
        "user": current_user,
        "atividades": atividades,
        "lancamentos": lancamentos
    })

@app.post("/novo-lancamento", response_class=HTMLResponse)
async def criar_lancamento(
    request: Request,
    data: str = Form(...),
    hora_inicio: str = Form(...),
    hora_fim: str = Form(...),
    atividade_id: int = Form(...),
    observacao: Optional[str] = Form(None),
    return_url: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    from datetime import datetime
    
    lancamento_data = LancamentoCreate(
        data=datetime.strptime(data, "%Y-%m-%d").date(),
        hora_inicio=datetime.strptime(hora_inicio, "%H:%M").time(),
        hora_fim=datetime.strptime(hora_fim, "%H:%M").time(),
        atividade_id=atividade_id,
        observacao=observacao
    )
    
    create_lancamento(db, lancamento=lancamento_data, user_id=current_user.id)
    
    redirect_url = return_url if return_url else "/lancamentos"
    return RedirectResponse(url=redirect_url, status_code=status.HTTP_303_SEE_OTHER)

@app.get("/editar-lancamento/{lancamento_id}", response_class=HTMLResponse)
async def editar_lancamento_page(
    lancamento_id: int,
    request: Request, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    lancamento = get_lancamento(db, lancamento_id=lancamento_id)
    if not lancamento or lancamento.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    
    atividades = get_atividades(db)
    return templates.TemplateResponse("editar_lancamento_bootstrap.html", {
        "request": request,
        "user": current_user,
        "lancamento": lancamento,
        "atividades": atividades
    })

@app.post("/editar-lancamento/{lancamento_id}", response_class=HTMLResponse)
async def atualizar_lancamento(
    request: Request,
    lancamento_id: int,
    data: str = Form(...),
    hora_inicio: str = Form(...),
    hora_fim: str = Form(...),
    atividade_id: int = Form(...),
    observacao: Optional[str] = Form(None),
    return_url: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    from datetime import datetime
    
    lancamento = get_lancamento(db, lancamento_id=lancamento_id)
    if not lancamento or lancamento.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    
    lancamento_data = LancamentoUpdate(
        data=datetime.strptime(data, "%Y-%m-%d").date(),
        hora_inicio=datetime.strptime(hora_inicio, "%H:%M").time(),
        hora_fim=datetime.strptime(hora_fim, "%H:%M").time(),
        atividade_id=atividade_id,
        observacao=observacao
    )
    
    update_lancamento(db, lancamento_id=lancamento_id, lancamento=lancamento_data)
    
    redirect_url = return_url if return_url else "/lancamentos"
    return RedirectResponse(url=redirect_url, status_code=status.HTTP_303_SEE_OTHER)

@app.post("/excluir-lancamento/{lancamento_id}", response_class=HTMLResponse)
async def excluir_lancamento_route(
    lancamento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    lancamento = get_lancamento(db, lancamento_id=lancamento_id)
    if not lancamento or lancamento.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    
    delete_lancamento(db, lancamento_id=lancamento_id)
    return RedirectResponse(url="/lancamentos", status_code=status.HTTP_303_SEE_OTHER)

# Admin routes
@app.get("/admin/lancamentos", response_class=HTMLResponse)
async def admin_lancamentos(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    user_id: Optional[int] = None,
    data: Optional[str] = None
):
    lancamentos = get_lancamentos_admin(db, user_id=user_id, data=data)
    usuarios = get_users(db)
    return templates.TemplateResponse("admin/lancamentos.html", {
        "request": request,
        "user": current_user,
        "lancamentos": lancamentos,
        "usuarios": usuarios,
        "filtro_user_id": user_id,
        "filtro_data": data
    })

@app.post("/logout")
async def logout():
    response = RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
    response.delete_cookie("access_token")
    return response

@app.get("/perfil", response_class=HTMLResponse)
async def perfil_page(request: Request, current_user: User = Depends(get_current_active_user)):
    return templates.TemplateResponse("perfil_view.html", {
        "request": request,
        "user": current_user
    })

@app.post("/perfil", response_class=HTMLResponse)
async def atualizar_perfil(
    request: Request,
    senha_atual: str = Form(...),
    nova_senha: str = Form(...),
    confirmar_senha: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not verify_password(senha_atual, current_user.senha):
        return templates.TemplateResponse("perfil_view.html", {
            "request": request,
            "user": current_user,
            "error": "Senha atual incorreta"
        })
    
    if nova_senha != confirmar_senha:
        return templates.TemplateResponse("perfil_view.html", {
            "request": request,
            "user": current_user,
            "error": "A nova senha e a confirmação não coincidem"
        })
    
    if len(nova_senha) < 6:
        return templates.TemplateResponse("perfil_view.html", {
            "request": request,
            "user": current_user,
            "error": "A nova senha deve ter pelo menos 6 caracteres"
        })
    
    hashed_password = get_password_hash(nova_senha)
    # Update DB User details bypass since Pydantic Update is mostly string fields, we just use raw SQLAlchemy
    current_user.senha = hashed_password
    db.commit()
    
    return templates.TemplateResponse("perfil_view.html", {
        "request": request,
        "user": current_user,
        "message": "Senha alterada com sucesso!"
    })

@app.post("/alterar-senha", response_class=HTMLResponse)
async def alterar_senha(
    request: Request,
    senha_atual: str = Form(...),
    nova_senha: str = Form(...),
    confirmar_senha: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if nova_senha != confirmar_senha or not verify_password(senha_atual, current_user.senha):
        return RedirectResponse(url="/perfil", status_code=status.HTTP_303_SEE_OTHER)
    
    current_user.senha = get_password_hash(nova_senha)
    db.commit()
    
    return RedirectResponse(url="/perfil", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/admin/usuarios", response_class=HTMLResponse)
async def admin_usuarios(request: Request, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    usuarios = get_users(db)
    return templates.TemplateResponse("admin/usuarios_bootstrap.html", {
        "request": request,
        "user": current_user,
        "usuarios": usuarios
    })

@app.post("/admin/usuarios", response_class=HTMLResponse)
async def criar_usuario_admin(
    request: Request,
    nome: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    tipo_usuario: str = Form(...),
    gestao: Optional[str] = Form(None),
    area: Optional[str] = Form(None),
    equipe: Optional[str] = Form(None),
    especialidade: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Verificar se email já existe
    existing_user = get_user_by_email(db, email=email)
    if existing_user:
        usuarios = get_users(db)
        return templates.TemplateResponse("admin/usuarios_bootstrap.html", {
            "request": request,
            "user": current_user,
            "usuarios": usuarios,
            "error": "Email já cadastrado no sistema"
        })
    
    # Criar novo usuário
    user_data = UserCreate(
        nome=nome,
        email=email,
        senha=senha,
        tipo_usuario=tipo_usuario,
        gestao=gestao,
        area=area,
        equipe=equipe,
        especialidade=especialidade
    )
    
    create_user(db, user=user_data)
    return RedirectResponse(url="/admin/usuarios", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/admin/atividades", response_class=HTMLResponse)
async def admin_atividades(request: Request, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    atividades = get_atividades(db)
    categorias = get_categorias(db)
    return templates.TemplateResponse("admin/atividades.html", {
        "request": request,
        "user": current_user,
        "atividades": atividades,
        "categorias": categorias
    })

@app.post("/admin/atividades", response_class=HTMLResponse)
async def criar_atividade_route(
    request: Request,
    nome: str = Form(...),
    categoria_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    atividade_data = AtividadeCreate(nome=nome, categoria_id=categoria_id)
    create_atividade(db, atividade=atividade_data)
    return RedirectResponse(url="/admin/atividades", status_code=status.HTTP_303_SEE_OTHER)

@app.post("/admin/atividades/{atividade_id}/editar", response_class=HTMLResponse)
async def editar_atividade_route(
    request: Request,
    atividade_id: int,
    nome: str = Form(...),
    categoria_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    atividade_data = AtividadeUpdate(nome=nome, categoria_id=categoria_id)
    update_atividade(db, atividade_id=atividade_id, atividade=atividade_data)
    return RedirectResponse(url="/admin/atividades", status_code=status.HTTP_303_SEE_OTHER)

@app.post("/admin/atividades/{atividade_id}/excluir", response_class=HTMLResponse)
async def excluir_atividade_route(
    atividade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    delete_atividade(db, atividade_id=atividade_id)
    return RedirectResponse(url="/admin/atividades", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/admin/categorias", response_class=HTMLResponse)
async def admin_categorias(request: Request, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    categorias = get_categorias(db)
    return templates.TemplateResponse("admin/categorias.html", {
        "request": request,
        "user": current_user,
        "categorias": categorias
    })

@app.post("/admin/categorias", response_class=HTMLResponse)
async def criar_categoria_route(
    request: Request,
    nome: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    categoria_data = CategoriaCreate(nome=nome)
    create_categoria(db, categoria=categoria_data)
    return RedirectResponse(url="/admin/categorias", status_code=status.HTTP_303_SEE_OTHER)

@app.post("/admin/categorias/{categoria_id}/excluir", response_class=HTMLResponse)
async def excluir_categoria_route(
    categoria_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    delete_categoria(db, categoria_id=categoria_id)
    return RedirectResponse(url="/admin/categorias", status_code=status.HTTP_303_SEE_OTHER)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
