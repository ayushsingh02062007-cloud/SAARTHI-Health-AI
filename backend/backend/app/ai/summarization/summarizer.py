def generate_patient_summary(
    patient_id: str,
    age: int | None,
    gender: str | None,
    symptoms: str,
    duration: str | None,
    report_summary: str | None = None
) -> str:
    """
    Generate a concise reviewer-facing patient summary.

    Prototype only — does not provide medical diagnosis
    or treatment recommendations.
    """

    parts = []

    if patient_id:
        parts.append(f"Patient ID: {patient_id}")

    if age is not None:
        parts.append(f"Age: {age}")

    if gender:
        parts.append(f"Gender: {gender}")

    if symptoms:
        parts.append(f"Reported symptoms: {symptoms}")

    if duration:
        parts.append(f"Duration: {duration}")

    if report_summary:
        parts.append(f"Report observations: {report_summary}")

    if not parts:
        return "No patient information available for summarization."

    return " | ".join(parts)