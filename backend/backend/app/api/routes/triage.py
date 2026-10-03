from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.extraction.extractor import extract_patient_information
from app.ai.safety.safety_engine import detect_safety_signals
from app.services.report_service import process_report
from app.services.triage_note import generate_triage_note


router = APIRouter(
    prefix="/triage",
    tags=["Triage"]
)


# ==========================================
# Request Models
# ==========================================

class TriageRequest(BaseModel):
    patient_id: str
    symptoms: str
    duration: str


class TriageWithReportRequest(BaseModel):
    patient_id: str
    symptoms: str
    duration: str
    report_file: str


class TriageFromTextRequest(BaseModel):
    text: str


# ==========================================
# Helper Functions
# ==========================================

def get_missing_information(
    symptoms: str,
    duration: str
) -> list:

    missing_information = []

    if not symptoms or not symptoms.strip():
        missing_information.append(
            "Current symptoms"
        )

    if not duration or not duration.strip():
        missing_information.append(
            "Symptom duration"
        )

    return missing_information


def get_follow_up_questions() -> list:

    return [
        "Symptoms kab se hain?",
        "Symptoms badh rahe hain ya kam ho rahe hain?",
        "Kya koi existing medical condition hai?",
        "Kya koi medicine currently li ja rahi hai?"
    ]


def get_triage_message(
    urgency_signal: bool
) -> str:

    if urgency_signal:
        return (
            "Predefined safety signal detected. "
            "Qualified healthcare professional "
            "review required."
        )

    return (
        "No predefined safety signal detected. "
        "Qualified healthcare professional "
        "review is still required."
    )


# ==========================================
# Basic Triage
# ==========================================

@router.post("/analyze")
def analyze_triage(
    data: TriageRequest
):

    safety_result = detect_safety_signals(
        data.symptoms
    )

    urgency_signal = (
        safety_result["urgency_signal"]
    )

    matched_signals = (
        safety_result["matched_signals"]
    )

    missing_information = (
        get_missing_information(
            data.symptoms,
            data.duration
        )
    )

    follow_up_questions = (
        get_follow_up_questions()
    )

    message = get_triage_message(
        urgency_signal
    )

    return {

        "status": "success",

        "patient_id": data.patient_id,

        "triage": {

            "reported_symptoms":
                data.symptoms,

            "symptom_duration":
                data.duration,

            "urgency_signal":
                urgency_signal,

            "matched_safety_signals":
                matched_signals,

            "message":
                message,

            "missing_information":
                missing_information,

            "suggested_follow_up_questions":
                follow_up_questions
        },

        "safety": {

            "review_required":
                safety_result[
                    "review_required"
                ]
        },

        "disclaimer": (
            "This is a triage-support "
            "prototype and does not provide "
            "medical diagnosis or treatment."
        )
    }


# ==========================================
# Triage + Medical Report
# ==========================================

@router.post("/analyze-with-report")
def analyze_triage_with_report(
    data: TriageWithReportRequest
):

    # --------------------------------------
    # Validate report path
    # --------------------------------------

    report_path = Path(
        data.report_file
    )

    if not report_path.exists():

        return {

            "status": "error",

            "message":
                "Report file not found.",

            "report_file":
                data.report_file
        }


    # --------------------------------------
    # Process report
    # --------------------------------------

    try:

        report_result = process_report(
            str(report_path)
        )

    except Exception as error:

        return {

            "status": "error",

            "message":
                "Unable to process medical report.",

            "error":
                str(error)
        }


    # --------------------------------------
    # Safety analysis
    # --------------------------------------

    safety_result = detect_safety_signals(
        data.symptoms
    )

    urgency_signal = (
        safety_result["urgency_signal"]
    )


    # --------------------------------------
    # Missing information
    # --------------------------------------

    missing_information = (
        get_missing_information(
            data.symptoms,
            data.duration
        )
    )


    # --------------------------------------
    # Follow-up questions
    # --------------------------------------

    follow_up_questions = (
        get_follow_up_questions()
    )


    # --------------------------------------
    # Triage note
    # --------------------------------------

    triage_note = generate_triage_note(

        patient_id=data.patient_id,

        symptoms=data.symptoms,

        duration=data.duration,

        report_summary=
            report_result["summary"],

        urgency_signal=
            urgency_signal,

        missing_information=
            missing_information,

        follow_up_questions=
            follow_up_questions
    )


    # --------------------------------------
    # Final combined response
    # --------------------------------------

    return {

        "status": "success",

        "patient_id":
            data.patient_id,


        "patient_information": {

            "symptoms":
                data.symptoms,

            "duration":
                data.duration
        },


        "report": {

            "filename":
                report_result["filename"],

            "file_path":
                str(report_path),

            "lab_values":
                report_result["lab_values"],

            "summary":
                report_result["summary"],

            "extracted_text":
                report_result[
                    "extracted_text"
                ]
        },


        "triage": {

            "urgency_signal":
                urgency_signal,

            "matched_safety_signals":
                safety_result[
                    "matched_signals"
                ],

            "message":
                get_triage_message(
                    urgency_signal
                ),

            "missing_information":
                missing_information,

            "suggested_follow_up_questions":
                follow_up_questions
        },


        "safety": {

            "review_required":
                safety_result[
                    "review_required"
                ]
        },


        "triage_note":
            triage_note,


        "disclaimer": (
            "This is a triage-support "
            "prototype. It organizes "
            "reported information and "
            "highlights predefined safety "
            "signals. It does not provide "
            "medical diagnosis or treatment. "
            "Final assessment must be "
            "performed by a qualified "
            "healthcare professional."
        )
    }


# ==========================================
# Triage From Patient Text
# ==========================================

@router.post("/analyze-from-text")
def analyze_triage_from_text(
    data: TriageFromTextRequest
):

    if not data.text or not data.text.strip():

        return {

            "status": "error",

            "message":
                "No patient text was provided."
        }


    # --------------------------------------
    # Extract patient information
    # --------------------------------------

    extracted = (
        extract_patient_information(
            data.text
        )
    )


    patient_id = (
        extracted.get("patient_id")
    )


    extracted_symptoms = (
        extracted.get("symptoms", [])
    )


    duration = (
        extracted.get("duration")
    )


    symptoms = ", ".join(
        extracted_symptoms
    )


    # If keyword extraction doesn't
    # detect symptoms, preserve the
    # original text for review.

    if not symptoms:

        symptoms = data.text


    # --------------------------------------
    # Safety analysis
    # --------------------------------------

    safety_result = (
        detect_safety_signals(
            data.text
        )
    )


    urgency_signal = (
        safety_result["urgency_signal"]
    )


    matched_signals = (
        safety_result["matched_signals"]
    )


    # --------------------------------------
    # Missing information
    # --------------------------------------

    missing_information = (
        get_missing_information(
            symptoms,
            duration
        )
    )


    # --------------------------------------
    # Follow-up questions
    # --------------------------------------

    follow_up_questions = (
        get_follow_up_questions()
    )


    # --------------------------------------
    # Message
    # --------------------------------------

    message = get_triage_message(
        urgency_signal
    )


    # --------------------------------------
    # Final response
    # --------------------------------------

    return {

        "status": "success",

        "patient_id":
            patient_id,


        "extracted_patient_information":
            extracted,


        "triage": {

            "reported_symptoms":
                symptoms,

            "symptom_duration":
                duration,

            "urgency_signal":
                urgency_signal,

            "matched_safety_signals":
                matched_signals,

            "message":
                message,

            "missing_information":
                missing_information,

            "suggested_follow_up_questions":
                follow_up_questions
        },


        "safety": {

            "review_required":
                safety_result[
                    "review_required"
                ]
        },


        "disclaimer": (
            "This is a triage-support "
            "prototype. It organizes "
            "reported information and "
            "highlights predefined safety "
            "signals. It does not provide "
            "medical diagnosis or treatment. "
            "Final assessment must be "
            "performed by a qualified "
            "healthcare professional."
        )
    }