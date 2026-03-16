from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime

class UserBase(BaseModel):
    nome: str
    email: EmailStr
    gestao: Optional[str] = None
    area: Optional[str] = None
    equipe: Optional[str] = None
    especialidade: Optional[str] = None
    tipo_usuario: str = "Usuário"

class UserCreate(UserBase):
    senha: str

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    gestao: Optional[str] = None
    area: Optional[str] = None
    equipe: Optional[str] = None
    especialidade: Optional[str] = None
    tipo_usuario: Optional[str] = None
    ativo: Optional[bool] = None

class User(UserBase):
    id: int
    ativo: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CategoriaBase(BaseModel):
    nome: str

class CategoriaCreate(CategoriaBase):
    pass

class Categoria(CategoriaBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AtividadeBase(BaseModel):
    nome: str
    categoria_id: int

class AtividadeCreate(AtividadeBase):
    pass

class AtividadeUpdate(BaseModel):
    nome: Optional[str] = None
    categoria_id: Optional[int] = None

class Atividade(AtividadeBase):
    id: int
    created_at: datetime
    categoria: Categoria

    class Config:
        from_attributes = True

class LancamentoBase(BaseModel):
    data: date
    hora_inicio: time
    hora_fim: time
    atividade_id: int
    observacao: Optional[str] = None

class LancamentoCreate(LancamentoBase):
    pass

class LancamentoUpdate(BaseModel):
    data: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    atividade_id: Optional[int] = None
    observacao: Optional[str] = None

class Lancamento(LancamentoBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: datetime
    usuario: User
    atividade: Atividade
    duracao_horas: float

    class Config:
        from_attributes = True

class LancamentoAdmin(BaseModel):
    id: int
    usuario: str
    data: date
    hora_inicio: time
    hora_fim: time
    atividade: str
    duracao_horas: float

    class Config:
        from_attributes = True
