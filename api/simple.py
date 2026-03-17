"""
Vercel Serverless Function - Class-based Handler
Compatible with Vercel's BaseHTTPRequestHandler expectation
"""
import json
import sys
import os
from http.server import BaseHTTPRequestHandler
from io import BytesIO

# Load environment variables from .env if exists
try:
    from dotenv import load_dotenv
    # Try to load .env from project root
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(project_root, '.env'))
    load_dotenv(os.path.join(project_root, '.env.vercel'))
except ImportError:
    # dotenv not available, continue without it
    pass

class handler(BaseHTTPRequestHandler):
    """Vercel-compatible handler class"""
    
    def do_GET(self):
        """Handle GET requests"""
        try:
            # Parse path
            path = self.path
            
            # Debug information
            debug_info = {
                "request_type": "BaseHTTPRequestHandler",
                "path": path,
                "method": "GET",
                "python_version": sys.version,
                "env_vars": {
                    "database_url_exists": bool(os.environ.get("DATABASE_URL")),
                    "secret_key_exists": bool(os.environ.get("SECRET_KEY")),
                    "python_path": sys.path[:3]
                }
            }
            
            # Route handling
            if path == "/" or path == "/api":
                response_data = {
                    "message": "Time Tracking API is running",
                    "status": "healthy",
                    "method": "GET",
                    "path": path,
                    "debug": debug_info
                }
                
            elif path == "/api/health":
                response_data = {
                    "status": "ok",
                    "service": "time-tracking",
                    "environment": "vercel",
                    "debug": debug_info
                }
                
            elif path == "/api/test":
                response_data = {
                    "test": "success",
                    "message": "Vercel serverless function working",
                    "method": "GET",
                    "path": path,
                    "debug": debug_info
                }
                
            elif path == "/api/env":
                # Test environment variables
                response_data = {
                    "environment_test": "ok",
                    "database_url": os.environ.get("DATABASE_URL", "NOT_FOUND"),
                    "database_url_length": len(os.environ.get("DATABASE_URL", "")),
                    "secret_key": os.environ.get("SECRET_KEY", "NOT_FOUND"),
                    "debug": debug_info
                }
                
            else:
                response_data = {
                    "error": "Not Found",
                    "message": f"Path {path} not found",
                    "available_paths": ["/", "/api", "/api/health", "/api/test", "/api/env"],
                    "debug": debug_info
                }
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data, indent=2).encode())
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
            # Error handling
            error_data = {
                "error": "Internal Server Error",
                "message": str(e),
                "type": type(e).__name__,
                "python_version": sys.version
            }
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_data, indent=2).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        # Read content length
        content_length = int(self.headers.get('Content-Length', 0))
        
        # Read POST data
        post_data = self.rfile.read(content_length)
        
        # For now, just echo back the POST data
        response_data = {
            "message": "POST request received",
            "method": "POST",
            "path": self.path,
            "content_length": content_length,
            "post_data": post_data.decode('utf-8', errors='ignore') if post_data else ""
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data, indent=2).encode())
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

# Alternative approach: Function wrapper
def handler_function(event, context):
    """Alternative function-based handler for Vercel"""
    try:
        # Extract request info from event
        method = event.get('method', 'GET')
        path = event.get('path', '/')
        
        # Create mock request object
        class MockRequest:
            def __init__(self, method, path):
                self.method = method
                self.path = path
        
        # Create handler instance
        handler_instance = handler(MockRequest(method, path), BytesIO(), None)
        
        # Call appropriate method
        if method == 'GET':
            handler_instance.do_GET()
        elif method == 'POST':
            handler_instance.do_POST()
        elif method == 'OPTIONS':
            handler_instance.do_OPTIONS()
        else:
            handler_instance.send_response(405)
            handler_instance.end_headers()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': '{"message": "Request processed"}'
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }

# Export both approaches
__all__ = ["handler", "handler_function"]
