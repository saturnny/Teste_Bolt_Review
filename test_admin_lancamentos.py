"""
Test admin lancamentos function
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

print("Testing get_lancamentos_admin...")

try:
    from app.crud import get_lancamentos_admin, get_users
    from app.models import Lancamento
    
    print("Step 1: Get users...")
    usuarios = get_users(db)
    print(f"Found {len(usuarios)} users")
    
    print("Step 2: Test get_lancamentos_admin...")
    lancamentos = get_lancamentos_admin(db)
    print(f"Found {len(lancamentos)} lancamentos")
    
    print("Step 3: Test direct query...")
    direct_query = db.query(Lancamento).all()
    print(f"Direct query found {len(direct_query)} lancamentos")
    
    print("Step 4: Test with filters...")
    lancamentos_filtered = get_lancamentos_admin(db, user_id=1)
    print(f"Filtered lancamentos: {len(lancamentos_filtered)}")
    
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    print(traceback.format_exc())
finally:
    db.close()
