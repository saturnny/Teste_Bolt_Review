from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time, Date, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha = Column(String, nullable=False)
    gestao = Column(String)
    area = Column(String)
    equipe = Column(String)
    especialidade = Column(String)
    tipo_usuario = Column(String, default="Usuário")  # Admin or Usuário
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lancamentos = relationship("Lancamento", back_populates="usuario")

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    atividades = relationship("Atividade", back_populates="categoria")

class Atividade(Base):
    __tablename__ = "atividades"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    categoria = relationship("Categoria", back_populates="atividades")
    lancamentos = relationship("Lancamento", back_populates="atividade")

class Lancamento(Base):
    __tablename__ = "lancamentos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"))
    data = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    atividade_id = Column(Integer, ForeignKey("atividades.id"))
    observacao = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("User", back_populates="lancamentos")
    atividade = relationship("Atividade", back_populates="lancamentos")

    duracao_horas = Column(Float, nullable=True)
