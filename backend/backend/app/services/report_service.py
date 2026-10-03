from pathlib import Path

from app.ai.ocr.ocr_engine import extract_text_from_file
from app.services.lab_extractor import extract_lab_values
from app.services.report_summary import generate_report_summary


def process_report(file_path: str) -> dict:
    """
    Process an uploaded report and generate structured observations
    and a reviewer-facing summary.

    Prototype only — not for medical diagnosis.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Report not found: {file_path}")

    extracted_text = extract_text_from_file(str(path))

    lab_values = extract_lab_values(extracted_text)

    summary = generate_report_summary(lab_values)

    return {
        "status": "success",
        "filename": path.name,
        "extracted_text": extracted_text,
        "lab_values": lab_values,
        "summary": summary
    }