"""
Debug script for Vercel environment
"""
import os
import sys
import traceback

print("=== VERCEL ENVIRONMENT DEBUG ===")
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path[:3]}")

# Check environment variables
print(f"\n=== ENVIRONMENT VARIABLES ===")
database_url = os.environ.get("DATABASE_URL")
print(f"DATABASE_URL exists: {bool(database_url)}")
if database_url:
    print(f"DATABASE_URL length: {len(database_url)}")
    print(f"DATABASE_URL starts with: {database_url[:20]}...")
    print(f"DATABASE_URL ends with: ...{database_url[-20:]}")

# Check imports
print(f"\n=== IMPORT TESTS ===")
try:
    import sqlalchemy
    print(f"SQLAlchemy: {sqlalchemy.__version__}")
except ImportError as e:
    print(f"SQLAlchemy import failed: {e}")

try:
    import pg8000
    print(f"pg8000: {pg8000.__version__}")
except ImportError as e:
    print(f"pg8000 import failed: {e}")

try:
    import fastapi
    print(f"FastAPI: {fastapi.__version__}")
except ImportError as e:
    print(f"FastAPI import failed: {e}")

# Test database connection
print(f"\n=== DATABASE CONNECTION TEST ===")
try:
    import ssl
    from sqlalchemy import create_engine, text
    
    if not database_url:
        raise ValueError("DATABASE_URL not found")
    
    # Create SSL context
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    # Create engine with NullPool for serverless
    from sqlalchemy.pool import NullPool
    engine = create_engine(
        database_url,
        connect_args={"ssl_context": ssl_context},
        poolclass=NullPool,
    )
    print("Engine created successfully")
    
    # Test connection with timeout
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"Database test query result: {result.scalar()}")
    
    print("Database connection: SUCCESS")
    
except Exception as e:
    print(f"Database connection failed: {e}")
    print(f"Error type: {type(e).__name__}")
    print("Full traceback:")
    print(traceback.format_exc())

print("=== END DEBUG ===")
