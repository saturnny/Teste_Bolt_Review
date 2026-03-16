"""
Test script to simulate the exact web login flow
"""
import os
import sys
import ssl
from dotenv import load_dotenv

load_dotenv()

# Test database connection like the web app does
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

print("Step 1: Creating engine with NullPool like web app...")
engine = create_engine(
    os.environ.get("DATABASE_URL"),
    connect_args={"ssl_context": ssl_context},
    poolclass=NullPool,
)

print("Step 2: Creating session...")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

print("Step 3: Getting DB session...")
db = next(get_db())

print("Step 4: Importing auth functions...")
from app.crud import get_user_by_email
from app.auth import verify_password

print("Step 5: Querying user admin@admin.com...")
user = get_user_by_email(db, email="admin@admin.com")

if not user:
    print("FAIL: User not found!")
    db.close()
    sys.exit(1)

print(f"OK: User found - {user.email}, senha hash: {user.senha[:30]}...")

print("Step 6: Verifying password 'admin'...")
result = verify_password("admin", user.senha)
print(f"{'OK' if result else 'FAIL'}: Password match: {result}")

db.close()

if result:
    print("\n=== WEB AUTH SIMULATION SUCCESS ===")
else:
    print("\n=== WEB AUTH SIMULATION FAILED ===")
    print("Password hash may be wrong - running fix...")
    
    # Fix the password
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    db = next(get_db())
    user = get_user_by_email(db, email="admin@admin.com")
    new_hash = pwd_context.hash("admin")
    user.senha = new_hash
    db.commit()
    print(f"Fixed! New hash: {new_hash[:30]}...")
    db.close()
