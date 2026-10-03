def generate_triage_note(
    patient_id: str,
    symptoms: str,
    duration: str,
    report_summary: str,
    urgency_signal: bool,
    missing_information: list,
    follow_up_questions: list
) -> dict:
    """
    Generate a structured reviewer-facing triage note.

    Prototype only — not for medical diagnosis or treatment.
    """

    return {
        "patient_id": patient_id,

        "reported_symptoms": symptoms,

        "symptom_duration": duration,

        "report_summary": report_summary,

        "urgency_signal": (
            "Signal detected"
            if urgency_signal
            else "No predefined signal detected"
        ),

        "missing_information": missing_information,

        "suggested_follow_up_questions": follow_up_questions,

        "human_review": "Required",

        "note": (
            "This note organizes reported patient information "
            "for review by a qualified healthcare professional. "
            "It does not provide diagnosis or treatment."
        )
    }