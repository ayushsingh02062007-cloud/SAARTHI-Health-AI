import re
# ==========================================
# SAARTHI AI Medical Information Model
# Lightweight deployment version
# ==========================================

MODEL_NAME = "saarthi-lightweight-organizer"

MODEL_STATUS = "ready"


# ==========================================
# Basic Information Extraction
# ==========================================

def extract_field(
    text: str,
    field_name: str
) -> str:

    pattern = rf"{field_name}\s*:\s*(.*?)(?=\n|$)"

    match = re.search(
        pattern,
        text,
        re.IGNORECASE
    )

    if match:

        value = match.group(1).strip()

        if value.lower() in {
            "not provided",
            "not detected",
            "none",
            "null"
        }:
            return ""

        return value

    return ""


# ==========================================
# Lightweight Patient Information Analysis
# ==========================================

def analyze_patient_information(
    patient_text: str
) -> dict:

    if not patient_text or not patient_text.strip():

        return {
            "status": "error",
            "message": "No patient information provided."
        }


    # ======================================
    # Extract structured fields
    # ======================================

    patient_id = extract_field(
        patient_text,
        "Patient ID"
    )

    age = extract_field(
        patient_text,
        "Age"
    )

    gender = extract_field(
        patient_text,
        "Gender"
    )

    symptoms = extract_field(
        patient_text,
        "Symptoms"
    )

    duration = extract_field(
        patient_text,
        "Duration"
    )


    # ======================================
    # Lightweight organization
    # ======================================

    reported_information = []

    if patient_id:
        reported_information.append(
            f"Patient ID: {patient_id}"
        )

    if age:
        reported_information.append(
            f"Age: {age}"
        )

    if gender:
        reported_information.append(
            f"Gender: {gender}"
        )

    if symptoms:
        reported_information.append(
            f"Reported symptoms: {symptoms}"
        )

    if duration:
        reported_information.append(
            f"Reported duration: {duration}"
        )


    if reported_information:

        important_information = "\n".join(
            reported_information
        )

    else:

        important_information = (
            "No structured patient information "
            "was identified."
        )


    # ======================================
    # Missing information
    # ======================================

    missing_information = []

    if not age:
        missing_information.append("Age")

    if not gender:
        missing_information.append("Gender")

    if not symptoms:
        missing_information.append("Symptoms")

    if not duration:
        missing_information.append("Duration")


    if missing_information:

        missing_text = ", ".join(
            missing_information
        )

    else:

        missing_text = (
            "No basic information is missing."
        )


    # ======================================
    # Review note
    # ======================================

    generated_text = (
        "Symptoms:\n"
        f"{symptoms or 'Not provided'}\n\n"

        "Duration:\n"
        f"{duration or 'Not provided'}\n\n"

        "Important reported information:\n"
        f"{important_information}\n\n"

        "Missing information:\n"
        f"{missing_text}"
    )


    # ======================================
    # Structured summary
    # ======================================

    structured_summary = (
        f"Patient ID: "
        f"{patient_id or 'Not provided'}\n"
        f"Age: "
        f"{age or 'Not provided'}\n"
        f"Gender: "
        f"{gender or 'Not provided'}\n"
        f"Symptoms: "
        f"{symptoms or 'Not provided'}\n"
        f"Duration: "
        f"{duration or 'Not provided'}\n\n"
        f"AI Organized Information:\n"
        f"{generated_text}"
    )


    return {

        "status": "success",

        "model":
            MODEL_NAME,

        "model_status":
            MODEL_STATUS,

        "ai_summary":
            structured_summary,

        "structured_information": {

            "patient_id":
                patient_id or None,

            "age":
                age or None,

            "gender":
                gender or None,

            "symptoms":
                symptoms or None,

            "duration":
                duration or None
        },

        "human_review":
            "Required",

        "safety":
            "Non-diagnostic",

        "disclaimer": (
            "AI output is for healthcare "
            "information organization only. "
            "It does not provide diagnosis, "
            "treatment or medical advice."
        )
    }


# ==========================================
# Model Health Check
# ==========================================

def get_model_status() -> dict:

    return {

        "model":
            MODEL_NAME,

        "status":
            MODEL_STATUS,

        "available":
            True
    }