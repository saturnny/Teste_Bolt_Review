from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

# Ler DATABASE_URL do .env (Se não existir, erro proposital pois Vercel vai abortar)
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("A variável de ambiente DATABASE_URL não foi encontrada. Configure-a com a Connection String do Supabase.")

# Criar contexto SSL para pg8000
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# NullPool: cada request abre e fecha sua própria conexão sem cache
# Isso evita conflitos com workers async do Uvicorn e o Transaction Pooler do Supabase
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"ssl_context": ssl_context},
    poolclass=NullPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

