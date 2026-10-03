
from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM
)

import re


# ==========================================
# SAARTHI AI Medical Information Model
# ==========================================

MODEL_NAME = "google/flan-t5-small"


try:

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME
    )

    medical_ai = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_NAME
    )

    MODEL_STATUS = "loaded"


except Exception as error:

    tokenizer = None

    medical_ai = None

    MODEL_STATUS = "error"

    print(
        f"SAARTHI AI Model loading failed: {error}"
    )


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
# AI Patient Information Analysis
# ==========================================

def analyze_patient_information(
    patient_text: str
) -> dict:

    if not patient_text or not patient_text.strip():

        return {
            "status": "error",
            "message": "No patient information provided."
        }


    if medical_ai is None or tokenizer is None:

        return {
            "status": "error",
            "message": (
                "AI model is currently unavailable."
            ),
            "model": MODEL_NAME,
            "model_status": MODEL_STATUS
        }


    # ======================================
    # Extract known structured fields
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
    # AI Prompt
    # ======================================

    prompt = f"""
You are SAARTHI Health AI.

You are a healthcare information organization
assistant.

Your ONLY task is to organize information
explicitly provided by the patient.

Do NOT diagnose.
Do NOT prescribe medicine.
Do NOT recommend treatment.
Do NOT make a final clinical decision.

Create a concise review note.

Patient ID: {patient_id or "Not provided"}
Age: {age or "Not provided"}
Gender: {gender or "Not provided"}
Symptoms: {symptoms or "Not provided"}
Duration: {duration or "Not provided"}

Return only these sections:

Symptoms:
Duration:
Important reported information:
Missing information:

Do not invent information.
"""


    try:

        # ==================================
        # Tokenize prompt
        # ==================================

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=512
        )


        # ==================================
        # Generate AI output
        # ==================================

        outputs = medical_ai.generate(
            **inputs,
            max_new_tokens=180,
            do_sample=False
        )


        generated_text = tokenizer.decode(
            outputs[0],
            skip_special_tokens=True
        ).strip()


        # ==================================
        # Reliable fallback values
        # ==================================

        if not generated_text:

            generated_text = (
                "Symptoms: "
                f"{symptoms or 'Not provided'}\n"
                "Duration: "
                f"{duration or 'Not provided'}\n"
                "Important reported information: "
                f"Patient information was provided for review.\n"
                "Missing information: "
                "Additional clinical information may be required."
            )


        # ==================================
        # Build structured AI summary
        # ==================================

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


    except Exception as error:

        return {

            "status": "error",

            "model":
                MODEL_NAME,

            "model_status":
                MODEL_STATUS,

            "message":
                "AI analysis failed.",

            "error":
                str(error)
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
            medical_ai is not None
    }
