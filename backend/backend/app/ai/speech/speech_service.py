SUPPORTED_SPEECH_LANGUAGES = {
    "english": "en-IN",
    "hindi": "hi-IN",
    "odia": "or-IN"
}


def get_speech_language(language: str) -> str:
    """
    Return the browser/ASR language code for the selected language.
    """

    if not language:
        return "en-IN"

    value = language.strip().lower()

    aliases = {
        "english": "en-IN",
        "english india": "en-IN",
        "en": "en-IN",

        "hindi": "hi-IN",
        "hi": "hi-IN",

        "odia": "or-IN",
        "oriya": "or-IN",
        "or": "or-IN"
    }

    return aliases.get(value, "en-IN")


def create_speech_request(
    language: str,
    audio_filename: str | None = None
) -> dict:
    """
    Prepare speech-to-text processing metadata.

    The actual speech recognition is currently handled
    by the frontend browser SpeechRecognition API.

    A production implementation can connect this interface
    to Whisper or another verified speech recognition model.
    """

    speech_language = get_speech_language(language)

    return {
        "status": "prototype",
        "language": speech_language,
        "audio_filename": audio_filename,
        "message": (
            "Speech-to-text processing is currently handled "
            "by the frontend browser speech recognition layer."
        )
    }