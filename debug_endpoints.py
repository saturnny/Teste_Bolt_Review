"""
Debug endpoint for Vercel testing
Add this to your main.py or create a separate debug.py file
"""

from fastapi import APIRouter
import os
import sys
import traceback
import ssl
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

debug_router = APIRouter(prefix="/debug", tags=["debug"])

@debug_router.get("/env")
async def debug_environment():
    """Check environment variables and imports"""
    return {
        "python_version": sys.version,
        "database_url_exists": bool(os.environ.get("DATABASE_URL")),
        "database_url_length": len(os.environ.get("DATABASE_URL", "")),
        "database_url_preview": os.environ.get("DATABASE_URL", "")[:50] + "..." if os.environ.get("DATABASE_URL") else None,
    }

@debug_router.get("/db-test")
async def debug_database():
    """Test database connection"""
    try:
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            return {"error": "DATABASE_URL not found"}
        
        # Create SSL context
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Create engine
        engine = create_engine(
            database_url,
            connect_args={"ssl_context": ssl_context},
            poolclass=NullPool,
        )
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            test_result = result.scalar()
        
        return {
            "status": "success",
            "test_query": test_result,
            "message": "Database connection working"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc()
        }

@debug_router.get("/imports")
async def debug_imports():
    """Check if all required modules can be imported"""
    imports_status = {}
    
    modules = {
        "sqlalchemy": "sqlalchemy",
        "pg8000": "pg8000", 
        "fastapi": "fastapi",
        "pydantic": "pydantic",
        "passlib": "passlib",
        "jose": "jose",
        "jinja2": "jinja2"
    }
    
    for name, module in modules.items():
        try:
            __import__(module)
            imports_status[name] = "ok"
        except ImportError as e:
            imports_status[name] = f"error: {e}"
    
    return imports_status
