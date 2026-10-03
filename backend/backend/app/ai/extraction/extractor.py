import re


def extract_patient_information(text: str) -> dict:
    """
    Extract basic patient-related information from
    unstructured text.

    Prototype only — does not provide medical diagnosis.
    """

    if not text:
        return {
            "patient_id": None,
            "age": None,
            "gender": None,
            "symptoms": [],
            "duration": None
        }

    normalized_text = " ".join(text.split())

    patient_id = None
    age = None
    gender = None
    duration = None
    symptoms = []

    # Patient ID
    patient_match = re.search(
        r"(?:patient\s*id|patient\s*no|id)"
        r"\s*[:\-]?\s*([A-Za-z0-9\-]+)",
        normalized_text,
        re.IGNORECASE
    )

    if patient_match:
        patient_id = patient_match.group(1)

    # Age
    age_match = re.search(
        r"(?:age)\s*[:\-]?\s*(\d{1,3})",
        normalized_text,
        re.IGNORECASE
    )

    if age_match:
        age = int(age_match.group(1))

    # Gender
    gender_match = re.search(
        r"(?:gender|sex)\s*[:\-]?\s*"
        r"(male|female|other)",
        normalized_text,
        re.IGNORECASE
    )

    if gender_match:
        gender = gender_match.group(1).capitalize()

    # Duration
    duration_match = re.search(
        r"(?:duration|since|for)\s*[:\-]?\s*"
        r"(\d+)\s*(day|days|week|weeks|month|months)",
        normalized_text,
        re.IGNORECASE
    )

    if duration_match:
        duration = (
            f"{duration_match.group(1)} "
            f"{duration_match.group(2)}"
        )

    # Basic symptom keywords
    symptom_keywords = [
        "fever",
        "bukhar",
        "cough",
        "khansi",
        "cold",
        "sardi",
        "headache",
        "sir dard",
        "weakness",
        "kamzori",
        "vomiting",
        "ulti",
        "breathing difficulty",
        "difficulty breathing",
        "saans lene mein dikkat",
        "chest pain",
        "seene mein dard"
    ]

    text_lower = normalized_text.lower()

    for symptom in symptom_keywords:
        if symptom in text_lower:
            symptoms.append(symptom)

    # Remove duplicate symptoms
    symptoms = list(dict.fromkeys(symptoms))

    return {
        "patient_id": patient_id,
        "age": age,
        "gender": gender,
        "symptoms": symptoms,
        "duration": duration
    }