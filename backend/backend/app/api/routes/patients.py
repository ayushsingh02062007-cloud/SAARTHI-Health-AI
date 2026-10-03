from fastapi import APIRouter
from pydantic import BaseModel
from app.ai.model.medical_model import analyze_patient_information

from app.data_loader import load_demo_patient
from app.ai.extraction.extractor import extract_patient_information
from app.ai.speech.speech_service import create_speech_request
from app.ai.translation.translator import (
    get_supported_languages,
    translate_text
)

router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)


class PatientIntake(BaseModel):
    patient_id: str
    age: int
    gender: str
    language: str
    symptoms: str


class PatientTextExtraction(BaseModel):
    text: str


class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str


class SpeechRequest(BaseModel):
    language: str
    audio_filename: str | None = None


@router.post("/intake")
def patient_intake(data: PatientIntake):
    return {
        "status": "success",
        "message": "Patient information received",
        "patient": {
            "patient_id": data.patient_id,
            "age": data.age,
            "gender": data.gender,
            "language": data.language,
            "symptoms": data.symptoms
        }
    }


@router.post("/extract")
def extract_patient_data(data: PatientTextExtraction):
    extracted_information = extract_patient_information(
        data.text
    )

    return {
        "status": "success",
        "message": "Patient information extracted successfully",
        "extracted_information": extracted_information,
        "disclaimer": (
            "This extraction is for healthcare triage support "
            "and does not provide medical diagnosis or treatment."
        )
    }


@router.post("/translate")
def translate_patient_text(data: TranslationRequest):
    result = translate_text(
        text=data.text,
        source_language=data.source_language,
        target_language=data.target_language
    )

    return {
        **result,
        "disclaimer": (
            "Translation is provided as a communication-support "
            "feature. Final clinical interpretation requires "
            "qualified healthcare professional review."
        )
    }


@router.get("/languages")
def supported_languages():
    return {
        "status": "success",
        "languages": get_supported_languages()
    }


@router.post("/speech")
def speech_request(data: SpeechRequest):
    result = create_speech_request(
        language=data.language,
        audio_filename=data.audio_filename
    )

    return {
        **result,
        "disclaimer": (
            "Speech processing is a prototype communication "
            "support feature and does not provide diagnosis "
            "or treatment."
        )
    }

# ==========================================
# AI Patient Information Analysis
# ==========================================

@router.post("/ai-analysis")
def ai_patient_analysis(
    data: PatientTextExtraction
):

    result = analyze_patient_information(
        data.text
    )

    return result
@router.get("/demo")
def get_demo_patient():
    return load_demo_patient()