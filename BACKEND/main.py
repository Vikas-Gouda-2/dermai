from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analysis, recommendations, users, reports
from services.firebase_service import init_firebase
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase
init_firebase()

app = FastAPI(
    title="DermAI API",
    description="AI-Powered Skin Analysis Backend",
    version="1.0.0"
)

# CORS — allow requests from the React frontend
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://localhost:8000",
    "https://dermai.vercel.app",
    "https://dermai-production.vercel.app",
]

# Add any additional origins from environment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(recommendations.router, prefix="/api", tags=["Recommendations"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "DermAI API", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "message": "DermAI API is running 🚀",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
