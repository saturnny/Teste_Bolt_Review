from sqlalchemy.orm import Session
from datetime import datetime, date
from . import models, schemas
from .auth import get_password_hash

# Users
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.senha)
    db_user = models.User(
        nome=user.nome,
        email=user.email,
        senha=hashed_password,
        gestao=user.gestao,
        area=user.area,
        equipe=user.equipe,
        especialidade=user.especialidade,
        tipo_usuario=user.tipo_usuario
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

# Categorias
def get_categorias(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Categoria).offset(skip).limit(limit).all()

def get_categoria(db: Session, categoria_id: int):
    return db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()

def create_categoria(db: Session, categoria: schemas.CategoriaCreate):
    db_categoria = models.Categoria(nome=categoria.nome)
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def update_categoria(db: Session, categoria_id: int, nome: str):
    db_categoria = get_categoria(db, categoria_id)
    if db_categoria:
        db_categoria.nome = nome
        db.commit()
        db.refresh(db_categoria)
    return db_categoria

def delete_categoria(db: Session, categoria_id: int):
    db_categoria = get_categoria(db, categoria_id)
    if db_categoria:
        db.delete(db_categoria)
        db.commit()
    return db_categoria

# Atividades
def get_atividades(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Atividade).offset(skip).limit(limit).all()

def get_atividade(db: Session, atividade_id: int):
    return db.query(models.Atividade).filter(models.Atividade.id == atividade_id).first()

def create_atividade(db: Session, atividade: schemas.AtividadeCreate):
    db_atividade = models.Atividade(
        nome=atividade.nome,
        categoria_id=atividade.categoria_id
    )
    db.add(db_atividade)
    db.commit()
    db.refresh(db_atividade)
    return db_atividade

def update_atividade(db: Session, atividade_id: int, atividade: schemas.AtividadeUpdate):
    db_atividade = get_atividade(db, atividade_id)
    if not db_atividade:
        return None
        
    update_data = atividade.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_atividade, key, value)
        
    db.commit()
    db.refresh(db_atividade)
    return db_atividade

def delete_atividade(db: Session, atividade_id: int):
    db_atividade = get_atividade(db, atividade_id)
    if db_atividade:
        db.delete(db_atividade)
        db.commit()
    return db_atividade

# Lancamentos
def _calcular_duracao(data, hora_inicio, hora_fim):
    if not hora_inicio or not hora_fim or not data:
        return 0.0
    inicio = datetime.combine(data, hora_inicio)
    fim = datetime.combine(data, hora_fim)
    return round((fim - inicio).total_seconds() / 3600, 2)

def get_lancamentos(db: Session, user_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Lancamento)
    if user_id:
        query = query.filter(models.Lancamento.usuario_id == user_id)
    return query.order_by(models.Lancamento.data.desc(), models.Lancamento.hora_inicio.desc()).offset(skip).limit(limit).all()

def get_lancamento(db: Session, lancamento_id: int, user_id: int = None):
    query = db.query(models.Lancamento).filter(models.Lancamento.id == lancamento_id)
    if user_id is not None:
        query = query.filter(models.Lancamento.usuario_id == user_id)
    return query.first()

def create_lancamento(db: Session, lancamento: schemas.LancamentoCreate, user_id: int):
    duracao = _calcular_duracao(lancamento.data, lancamento.hora_inicio, lancamento.hora_fim)
    
    db_lancamento = models.Lancamento(
        usuario_id=user_id,
        data=lancamento.data,
        hora_inicio=lancamento.hora_inicio,
        hora_fim=lancamento.hora_fim,
        duracao_horas=duracao,
        atividade_id=lancamento.atividade_id,
        observacao=lancamento.observacao
    )
    db.add(db_lancamento)
    db.commit()
    db.refresh(db_lancamento)
    return db_lancamento

def update_lancamento(db: Session, lancamento_id: int, lancamento: schemas.LancamentoUpdate):
    db_lancamento = get_lancamento(db, lancamento_id)
    if not db_lancamento:
        return None
        
    update_data = lancamento.model_dump(exclude_unset=True)
    
    # Se mudar hora, recalcular duracao
    if 'hora_inicio' in update_data or 'hora_fim' in update_data or 'data' in update_data:
        h_in = update_data.get('hora_inicio', db_lancamento.hora_inicio)
        h_fi = update_data.get('hora_fim', db_lancamento.hora_fim)
        d_at = update_data.get('data', db_lancamento.data)
        update_data['duracao_horas'] = _calcular_duracao(d_at, h_in, h_fi)
        
    for key, value in update_data.items():
        setattr(db_lancamento, key, value)
        
    db.commit()
    db.refresh(db_lancamento)
    return db_lancamento

def delete_lancamento(db: Session, lancamento_id: int):
    db_lancamento = get_lancamento(db, lancamento_id)
    if db_lancamento:
        db.delete(db_lancamento)
        db.commit()
    return db_lancamento

def get_lancamentos_admin(db: Session, user_id: int = None, data: str = None):
    query = db.query(models.Lancamento)
    if user_id:
        query = query.filter(models.Lancamento.usuario_id == user_id)
    if data:
        try:
            data_obj = datetime.strptime(data, "%Y-%m-%d").date()
            query = query.filter(models.Lancamento.data == data_obj)
        except ValueError:
            pass
            
    return query.order_by(models.Lancamento.data.desc(), models.Lancamento.hora_inicio.desc()).all()
