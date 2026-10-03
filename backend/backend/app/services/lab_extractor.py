import re


def extract_lab_values(text: str) -> dict:
    """
    Extract basic laboratory/observation values from OCR/report text.

    Handles common OCR variations.
    Prototype only — not for medical diagnosis.
    """

    values = {}

    # Normalize OCR text
    normalized_text = text.replace("\n", " ")

    # ================= HEMOGLOBIN =================

    hemoglobin = re.search(
        r"hemoglobin\s*[:\-]?\s*([0-9.]+)\s*g\s*/?\s*dl",
        normalized_text,
        re.IGNORECASE
    )

    if hemoglobin:
        values["hemoglobin"] = (
            f"{hemoglobin.group(1)} g/dL"
        )

    # ================= TEMPERATURE =================

    temperature = re.search(
        r"temperature\s*[:\-]?\s*([0-9.]+)\s*[°]?\s*f",
        normalized_text,
        re.IGNORECASE
    )

    if temperature:
        values["temperature"] = (
            f"{temperature.group(1)} F"
        )

    # ================= SPO2 =================
    # Handles:
    # SpO2
    # SPO2
    # SpO 2
    # pO2 / p02 OCR variations

    spo2 = re.search(
        r"(?:spo\s*2|p[o0]\s*2|p0\s*2)\s*[:\-]?\s*([0-9.]+)\s*%",
        normalized_text,
        re.IGNORECASE
    )

    if spo2:
        values["spo2"] = (
            f"{spo2.group(1)}%"
        )

    return values