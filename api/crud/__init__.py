from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.database import engine, Base
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(   # ← MUST be global (no indentation)
    title="AI Wars Hackathon Backend API",
    description="Backend API for AI Wars Hackathon Project",
    version="1.0.0"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Wars Hackathon Backend API is running 🚀"}
