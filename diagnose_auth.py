"""
Full auth chain test - simulates exactly what the FastAPI /token route does.
"""
import os, ssl
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

engine = create_engine(
    os.environ.get("DATABASE_URL"),
    connect_args={"ssl_context": ssl_context},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("Step 1: Opening DB session...")
db = SessionLocal()

print("Step 2: Querying user by email...")
from app.models import User
user = db.query(User).filter(User.email == "admin@admin.com").first()

if not user:
    print("FAIL: User not found in DB!")
    db.close()
    exit(1)

print(f"OK: User found - {user.email}, tipo: {user.tipo_usuario}, ativo: {user.ativo}")

print("Step 3: Verifying password...")
result = pwd_context.verify("admin", user.senha)
print(f"{'OK' if result else 'FAIL'}: Password match: {result}")

if result:
    print("\n=== AUTH CHAIN WORKS PERFECTLY ===")
    print("The issue is in the Uvicorn/FastAPI DB session, NOT in auth logic.")
    print("Likely cause: connection pool issue with pg8000 + async Uvicorn workers.")
    print("Solution: Use NullPool or check for async DB driver.")
else:
    print("\n=== PASS HASH MISMATCH - FIXING NOW ===")
    new_hash = pwd_context.hash("admin")
    user.senha = new_hash
    db.commit()
    print(f"Fixed! New hash: {new_hash[:30]}...")

db.close()
