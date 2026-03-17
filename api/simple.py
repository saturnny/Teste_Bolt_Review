"""
Pure Python Vercel Serverless Function
No FastAPI dependency - maximum compatibility
"""
import json

def handler(request):
    """
    Pure Python handler for Vercel
    Maximum compatibility, minimum dependencies
    """
    try:
        method = request.get("method", "GET")
        path = request.get("path", "/")
        
        if path == "/" or path == "/api":
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "message": "Time Tracking API is running",
                    "status": "healthy",
                    "method": method,
                    "path": path
                })
            }
        
        elif path == "/api/health":
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "status": "ok",
                    "service": "time-tracking",
                    "environment": "vercel"
                })
            }
        
        elif path == "/api/test":
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "test": "success",
                    "message": "Pure Python serverless function working",
                    "request_keys": list(request.keys())
                })
            }
        
        else:
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": "Not Found",
                    "message": f"Path {path} not found",
                    "available_paths": ["/", "/api", "/api/health", "/api/test"]
                })
            }
            
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": "Internal Server Error",
                "message": str(e),
                "type": type(e).__name__
            })
        }
