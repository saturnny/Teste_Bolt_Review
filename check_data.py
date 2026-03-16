"""
Check categories and test admin functions
"""
import os
import ssl
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

engine = create_engine(
    os.environ.get("DATABASE_URL"),
    connect_args={"ssl_context": ssl_context},
    poolclass=NullPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

from app.models import Categoria, Atividade

print("=== CATEGORIAS ===")
categorias = db.query(Categoria).all()
for c in categorias:
    print(f"ID: {c.id}, Nome: {c.nome}")

print("\n=== ATIVIDADES ===")
atividades = db.query(Atividade).all()
for a in atividades:
    print(f"ID: {a.id}, Nome: {a.nome}, Categoria ID: {a.categoria_id}")

db.close()
