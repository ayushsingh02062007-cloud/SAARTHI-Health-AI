from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.safety.safety_engine import detect_safety_signals
from app.services.report_service import process_report
from app.services.triage_note import generate_triage_note


router = APIRouter(
    prefix="/triage",
    tags=["Triage"]
)


class TriageRequest(BaseModel):
    patient_id: str
    symptoms: str
    duration: str


class TriageWithReportRequest(BaseModel):
    patient_id: str
    symptoms: str
    duration: str
    report_file: str


def get_missing_information(
    symptoms: str,
    duration: str
) -> list:

    missing_information = []

    if not symptoms:
        missing_information.append(
            "Current symptoms"
        )

    if not duration:
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


@router.post("/analyze")
def analyze_triage(data: TriageRequest):

    safety_result = detect_safety_signals(
        data.symptoms
    )

    urgency_signal = safety_result[
        "urgency_signal"
    ]

    matched_signals = safety_result[
        "matched_signals"
    ]

    missing_information = get_missing_information(
        data.symptoms,
        data.duration
    )

    follow_up_questions = get_follow_up_questions()

    if urgency_signal:
        message = (
            "Predefined safety signal detected. "
            "Qualified healthcare professional "
            "review required."
        )
    else:
        message = (
            "No predefined safety signal detected. "
            "Qualified healthcare professional "
            "review is still required."
        )

    return {
        "status": "success",

        "patient_id": data.patient_id,

        "triage": {
            "reported_symptoms": data.symptoms,
            "symptom_duration": data.duration,
            "urgency_signal": urgency_signal,
            "matched_safety_signals": matched_signals,
            "message": message,
            "missing_information": missing_information,
            "suggested_follow_up_questions": (
                follow_up_questions
            )
        },

        "safety": {
            "review_required": safety_result[
                "review_required"
            ]
        },

        "disclaimer": (
            "This is a triage-support prototype "
            "and does not provide medical diagnosis "
            "or treatment."
        )
    }


@router.post("/analyze-with-report")
def analyze_triage_with_report(
    data: TriageWithReportRequest
):

    report_path = Path(data.report_file)

    if not report_path.exists():
        return {
            "status": "error",
            "message": "Report file not found",
            "report_file": data.report_file
        }

    report_result = process_report(
        str(report_path)
    )

    safety_result = detect_safety_signals(
        data.symptoms
    )

    urgency_signal = safety_result[
        "urgency_signal"
    ]

    missing_information = get_missing_information(
        data.symptoms,
        data.duration
    )

    follow_up_questions = get_follow_up_questions()

    triage_note = generate_triage_note(
        patient_id=data.patient_id,
        symptoms=data.symptoms,
        duration=data.duration,
        report_summary=report_result["summary"],
        urgency_signal=urgency_signal,
        missing_information=missing_information,
        follow_up_questions=follow_up_questions
    )

    return {
        "status": "success",

        "patient_id": data.patient_id,

        "patient_information": {
            "symptoms": data.symptoms,
            "duration": data.duration
        },

        "report": {
            "filename": report_result["filename"],
            "lab_values": report_result["lab_values"],
            "summary": report_result["summary"]
        },

        "triage": {
            "urgency_signal": urgency_signal,
            "matched_safety_signals": (
                safety_result["matched_signals"]
            ),
            "missing_information": (
                missing_information
            ),
            "suggested_follow_up_questions": (
                follow_up_questions
            )
        },

        "safety": {
            "review_required": (
                safety_result["review_required"]
            )
        },

        "triage_note": triage_note,

        "disclaimer": (
            "This is a triage-support prototype. "
            "It does not provide medical diagnosis "
            "or treatment. Final assessment must be "
            "performed by a qualified healthcare "
            "professional."
        )
    }