"""
Vercel-compatible FastAPI application
Standard Vercel Serverless Function format
"""
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Create FastAPI instance
app = FastAPI(title="Time Tracking API", version="1.0.0")

# Basic endpoints
@app.get("/")
async def root():
    return {"message": "Time Tracking API is running", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "time-tracking", "environment": "vercel"}

@app.get("/api/test")
async def test_endpoint():
    return {"test": "success", "message": "Serverless function working"}

# Vercel serverless function handler
# This is the standard format Vercel expects
def handler(request):
    """
    Vercel serverless function handler
    Converts Vercel's request format to FastAPI
    """
    try:
        # Convert Vercel request to FastAPI format
        scope = {
            "type": "http",
            "method": request.get("method", "GET"),
            "path": request.get("path", "/"),
            "query_string": request.get("query", "").encode(),
            "headers": request.get("headers", {}),
            "body": request.get("body", ""),
        }
        
        # Create ASGI callable
        async def receive():
            return {"type": "http.request", "body": request.get("body", "").encode()}
        
        # Call FastAPI app
        async def send(message):
            if message["type"] == "http.response.start":
                return {
                    "statusCode": message["status"],
                    "headers": dict(message.get("headers", [])),
                    "body": ""
                }
            elif message["type"] == "http.response.body":
                return {
                    "statusCode": 200,
                    "headers": {"content-type": "application/json"},
                    "body": message.get("body", b"").decode()
                }
        
        # Run the ASGI app
        import asyncio
        return asyncio.run(app(scope, receive, send))
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"content-type": "application/json"},
            "body": json.dumps({"error": str(e), "message": "Internal server error"})
        }

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
