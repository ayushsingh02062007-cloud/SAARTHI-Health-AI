
from deep_translator import GoogleTranslator


SUPPORTED_LANGUAGES = {
    "english": "en",
    "hindi": "hi",
    "odia": "or"
}


# Lightweight offline demo translations.
# Used when the external translation service is unavailable.
DEMO_TRANSLATIONS = {
    # -------------------------
    # Hindi -> English
    # -------------------------
    ("hi", "en", "mujhe bukhar hai"):
        "I have a fever.",

    ("hi", "en", "mujhe bukhar hai."):
        "I have a fever.",

    ("hi", "en", "मुझे बुखार है"):
        "I have a fever.",

    ("hi", "en", "मुझे बुखार है।"):
        "I have a fever.",

    ("hi", "en", "mujhe saans lene mein dikkat hai"):
        "I am having difficulty breathing.",

    ("hi", "en", "mujhe saans lene mein dikkat hai."):
        "I am having difficulty breathing.",

    ("hi", "en", "मुझे सांस लेने में दिक्कत है"):
        "I am having difficulty breathing.",

    ("hi", "en", "मुझे सांस लेने में दिक्कत है।"):
        "I am having difficulty breathing.",

    ("hi", "en", "मुझे साँस लेने में दिक्कत है"):
        "I am having difficulty breathing.",

    ("hi", "en", "मुझे साँस लेने में दिक्कत है।"):
        "I am having difficulty breathing.",

    ("hi", "en", "mujhe seene mein dard hai"):
        "I have chest pain.",

    ("hi", "en", "मुझे सीने में दर्द है"):
        "I have chest pain.",

    ("hi", "en", "मुझे सीने में दर्द है।"):
        "I have chest pain.",

    ("hi", "en", "mujhe khansi hai"):
        "I have a cough.",

    ("hi", "en", "मुझे खांसी है"):
        "I have a cough.",

    ("hi", "en", "मुझे खांसी है।"):
        "I have a cough.",

    ("hi", "en", "mujhe sir dard hai"):
        "I have a headache.",

    ("hi", "en", "मुझे सिर दर्द है"):
        "I have a headache.",

    ("hi", "en", "मुझे सिर दर्द है।"):
        "I have a headache.",

    # -------------------------
    # Odia -> English
    # -------------------------
    ("or", "en", "ମୋତେ ଜ୍ୱର ହେଉଛି"):
        "I have a fever.",

    ("or", "en", "ମୋତେ ଜ୍ୱର ହେଉଛି।"):
        "I have a fever.",

    ("or", "en", "ମୋତେ କାଶ ହେଉଛି"):
        "I have a cough.",

    ("or", "en", "ମୋତେ କାଶ ହେଉଛି।"):
        "I have a cough.",

    # -------------------------
    # English -> Hindi
    # -------------------------
    ("en", "hi", "i have a fever"):
        "मुझे बुखार है।",

    ("en", "hi", "i have a fever."):
        "मुझे बुखार है।",

    ("en", "hi", "i have a cough"):
        "मुझे खांसी है।",

    ("en", "hi", "i have a cough."):
        "मुझे खांसी है।",

    ("en", "hi", "i have a headache"):
        "मुझे सिरदर्द है।",

    ("en", "hi", "i have a headache."):
        "मुझे सिरदर्द है।",

    # -------------------------
    # English -> Odia
    # -------------------------
    ("en", "or", "i have a fever"):
        "ମୋତେ ଜ୍ୱର ହେଉଛି।",

    ("en", "or", "i have a fever."):
        "ମୋତେ ଜ୍ୱର ହେଉଛି।"
}


def get_supported_languages() -> dict:
    return SUPPORTED_LANGUAGES.copy()


def normalize_language(language: str) -> str:
    if not language:
        return "en"

    value = language.strip().lower()

    aliases = {
        "english": "en",
        "eng": "en",
        "en": "en",

        "hindi": "hi",
        "hin": "hi",
        "hi": "hi",

        "odia": "or",
        "oriya": "or",
        "ori": "or",
        "or": "or"
    }

    return aliases.get(value, "en")


def translate_text(
    text: str,
    source_language: str,
    target_language: str
) -> dict:

    source = normalize_language(source_language)
    target = normalize_language(target_language)

    if not text or not text.strip():
        return {
            "status": "success",
            "source_language": source,
            "target_language": target,
            "translated_text": ""
        }

    clean_text = text.strip()

    # Same language
    if source == target:
        return {
            "status": "success",
            "source_language": source,
            "target_language": target,
            "translated_text": clean_text,
            "message": "No translation required."
        }

    # Lightweight offline demo fallback
    demo_key = (
        source,
        target,
        clean_text.lower()
    )

    if demo_key in DEMO_TRANSLATIONS:
        return {
            "status": "success",
            "source_language": source,
            "target_language": target,
            "translated_text": DEMO_TRANSLATIONS[demo_key],
            "message": (
                "Translation completed using "
                "local demo fallback."
            ),
            "translation_mode": "offline_demo"
        }

    # Try external translation service
    try:
        translated_text = GoogleTranslator(
            source=source,
            target=target
        ).translate(clean_text)

        return {
            "status": "success",
            "source_language": source,
            "target_language": target,
            "translated_text": translated_text,
            "message": "Translation completed successfully.",
            "translation_mode": "external"
        }

    except Exception:
        # Safe fallback: preserve original text
        return {
            "status": "fallback",
            "source_language": source,
            "target_language": target,
            "translated_text": clean_text,
            "message": (
                "External translation service unavailable. "
                "Original text preserved for human review."
            ),
            "translation_mode": "fallback"
        }
