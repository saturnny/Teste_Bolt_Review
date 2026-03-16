from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello from Vercel!"}

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Vercel handler
handler = app
