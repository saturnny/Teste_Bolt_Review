"""
Create test users - Admin and regular user
"""
import os
import ssl
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from passlib.context import CryptContext

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
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from app.models import User

# Create Admin user
admin_email = "adm@teste.com"
admin_user = db.query(User).filter(User.email == admin_email).first()
if not admin_user:
    admin_user = User(
        nome="Administrador Teste",
        email=admin_email,
        senha=pwd_context.hash("adm123"),
        tipo_usuario="Administrador",
        ativo=True
    )
    db.add(admin_user)
    print(f"Created ADMIN: {admin_email} / senha: adm123")
else:
    print(f"ADMIN already exists: {admin_email} / senha: adm123")

# Create regular user
user_email = "user@teste.com"
regular_user = db.query(User).filter(User.email == user_email).first()
if not regular_user:
    regular_user = User(
        nome="Usuario Teste",
        email=user_email,
        senha=pwd_context.hash("user123"),
        tipo_usuario="Usuario",
        ativo=True
    )
    db.add(regular_user)
    print(f"Created USER: {user_email} / senha: user123")
else:
    print(f"USER already exists: {user_email} / senha: user123")

db.commit()
db.close()

print("\n=== CREDENCIAIS ===")
print("ADMIN: adm@teste.com / adm123")
print("USER:  user@teste.com / user123")
