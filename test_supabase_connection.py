"""
Test connection to Supabase using the same DATABASE_URL
"""
import os
import ssl
from dotenv import load_dotenv
load_dotenv()

print("Testing Supabase connection...")
print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")

try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import NullPool
    
    # Create SSL context like the app
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    # Create engine like the app
    engine = create_engine(
        os.environ.get("DATABASE_URL"),
        connect_args={"ssl_context": ssl_context},
        poolclass=NullPool,
    )
    
    print("OK: Engine created successfully")
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"OK: Database connection test: {result.scalar()}")
    
    # Test user query
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    from app.models import User
    users = db.query(User).all()
    print(f"OK: Found {len(users)} users in database:")
    
    for user in users:
        print(f"   - {user.email} ({user.tipo_usuario}) - Active: {user.ativo}")
    
    db.close()
    print("OK: All tests passed!")
    
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    print("Full traceback:")
    print(traceback.format_exc())
