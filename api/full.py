"""
Vercel Serverless Function - Full App Version
Complete Time Tracking System with database integration
"""
import json
import sys
import os
from http.server import BaseHTTPRequestHandler
from io import BytesIO

# Load environment variables
try:
    from dotenv import load_dotenv
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(project_root, '.env'))
    load_dotenv(os.path.join(project_root, '.env.vercel'))
except ImportError:
    pass

# Add project root to Python path
sys.path.insert(0, project_root)

class handler(BaseHTTPRequestHandler):
    """Complete Time Tracking API handler"""
    
    def do_GET(self):
        """Handle GET requests"""
        try:
            path = self.path
            headers = dict(self.headers)
            
            # Route handling
            if path == "/" or path == "/api":
                response_data = {
                    "message": "Time Tracking API is running",
                    "status": "healthy",
                    "version": "2.0.0",
                    "endpoints": [
                        "/",
                        "/api/health",
                        "/api/env",
                        "/api/users",
                        "/api/login"
                    ]
                }
                
            elif path == "/api/health":
                response_data = {
                    "status": "ok",
                    "service": "time-tracking",
                    "environment": "vercel",
                    "database_connected": bool(os.environ.get("DATABASE_URL"))
                }
                
            elif path == "/api/env":
                response_data = {
                    "database_url": os.environ.get("DATABASE_URL", "NOT_FOUND"),
                    "database_url_length": len(os.environ.get("DATABASE_URL", "")),
                    "secret_key": os.environ.get("SECRET_KEY", "NOT_FOUND"),
                    "python_version": sys.version
                }
                
            elif path == "/api/users":
                # Test database connection
                try:
                    from app.database import get_db
                    from app.crud import get_users
                    
                    db = next(get_db())
                    users = get_users(db)
                    db.close()
                    
                    response_data = {
                        "users_count": len(users),
                        "users": [{"id": u.id, "email": u.email, "nome": u.nome} for u in users[:5]]
                    }
                    
                except Exception as e:
                    response_data = {
                        "error": "Database connection failed",
                        "message": str(e)
                    }
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(response_data).encode())
                    return
            
            else:
                response_data = {
                    "error": "Not Found",
                    "message": f"Path {path} not found",
                    "available_paths": ["/", "/api/health", "/api/env", "/api/users"]
                }
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
                return
            
            # Success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            error_data = {
                "error": "Internal Server Error",
                "message": str(e),
                "type": type(e).__name__
            }
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            path = self.path
            
            if path == "/api/login":
                # Parse login data
                try:
                    login_data = json.loads(post_data.decode('utf-8'))
                    email = login_data.get('email')
                    password = login_data.get('password')
                    
                    # Test authentication
                    from app.database import get_db
                    from app.auth import authenticate_user
                    from app.schemas import Token
                    from datetime import timedelta
                    
                    db = next(get_db())
                    user = authenticate_user(db, email, password)
                    db.close()
                    
                    if user:
                        response_data = {
                            "success": True,
                            "message": "Login successful",
                            "user": {
                                "id": user.id,
                                "email": user.email,
                                "nome": user.nome,
                                "tipo_usuario": user.tipo_usuario
                            }
                        }
                    else:
                        response_data = {
                            "success": False,
                            "message": "Invalid credentials"
                        }
                        
                except Exception as e:
                    response_data = {
                        "success": False,
                        "message": f"Login error: {str(e)}"
                    }
            
            else:
                response_data = {
                    "error": "Not Found",
                    "message": f"POST path {path} not found"
                }
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
                return
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            error_data = {
                "error": "Internal Server Error",
                "message": str(e),
                "type": type(e).__name__
            }
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data).encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

# Export for Vercel
__all__ = ["handler"]
