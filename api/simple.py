"""
Vercel Serverless Function - Definitive Version
Maximum compatibility with Vercel platform
"""
import json
import sys

def handler(request):
    """
    Vercel serverless function handler
    Compatible with all Vercel request formats
    """
    try:
        # Debug information
        debug_info = {
            "request_type": type(request).__name__,
            "request_keys": list(request.keys()) if isinstance(request, dict) else "not_dict",
            "python_version": sys.version
        }
        
        # Handle different request formats
        if isinstance(request, dict):
            method = request.get("method", "GET")
            path = request.get("path", "/")
            query = request.get("query", "")
            body = request.get("body", "")
        else:
            # Fallback for other request types
            method = "GET"
            path = "/"
            query = ""
            body = ""
        
        # Route handling
        if path == "/" or path == "/api":
            response_data = {
                "message": "Time Tracking API is running",
                "status": "healthy",
                "method": method,
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
                "method": method,
                "path": path,
                "debug": debug_info
            }
            
        else:
            response_data = {
                "error": "Not Found",
                "message": f"Path {path} not found",
                "available_paths": ["/", "/api", "/api/health", "/api/test"],
                "debug": debug_info
            }
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(response_data, indent=2)
            }
        
        # Success response
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps(response_data, indent=2)
        }
        
    except Exception as e:
        # Comprehensive error handling
        error_data = {
            "error": "Internal Server Error",
            "message": str(e),
            "type": type(e).__name__,
            "python_version": sys.version,
            "request_info": str(type(request)) if not isinstance(request, dict) else "dict_request"
        }
        
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(error_data, indent=2)
        }

# Export for Vercel
# Vercel looks for this function by default
__all__ = ["handler"]
