def generate_report_summary(lab_values: dict) -> str:
    """
    Generate a simple reviewer-facing report summary.
    Prototype only — not a medical diagnosis.
    """

    summary_parts = []

    if "hemoglobin" in lab_values:
        summary_parts.append(
            f"Hemoglobin: {lab_values['hemoglobin']}"
        )

    if "temperature" in lab_values:
        summary_parts.append(
            f"Temperature: {lab_values['temperature']}"
        )

    if "spo2" in lab_values:
        summary_parts.append(
            f"SpO2: {lab_values['spo2']}"
        )

    if not summary_parts:
        return "No structured observations were extracted from the report."

    return " | ".join(summary_parts)