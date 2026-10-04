from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.patients import router as patient_router
from app.api.routes.triage import router as triage_router
from app.api.routes.reports import router as reports_router
from app.api.routes.reviewer import router as reviewer_router


app = FastAPI(
    title="SAARTHI Health AI",
    description="AI-assisted healthcare triage support system",
    version="1.0.0"
)


# ==========================================
# CORS Configuration
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://saarthi-health-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# API Routers
# ==========================================

app.include_router(
    patient_router
)

app.include_router(
    triage_router
)

app.include_router(
    reports_router
)

app.include_router(
    reviewer_router
)


# ==========================================
# Root Endpoint
# ==========================================

@app.get("/")
def root():

    return {
        "message": "SAARTHI Health AI Backend is running",
        "status": "success",
        "purpose": "Healthcare Triage Support"
    }


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }