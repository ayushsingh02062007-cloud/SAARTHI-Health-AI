def detect_safety_signals(symptoms: str) -> dict:
    """
    Detect predefined safety/urgency signals from reported symptoms.

    This module does NOT diagnose a medical condition.
    It only identifies predefined terms that may require
    prompt review by a qualified healthcare professional.
    """

    if not symptoms:
        return {
            "urgency_signal": False,
            "matched_signals": [],
            "review_required": True
        }

    text = symptoms.lower()

    safety_keywords = {
        "breathing_difficulty": [
            "difficulty breathing",
            "breathing difficulty",
            "shortness of breath",
            "saans lene mein dikkat",
            "saans ki dikkat"
        ],
        "chest_pain": [
            "chest pain",
            "seene mein dard",
            "seene me dard"
        ],
        "unconsciousness": [
            "unconscious",
            "behosh",
            "loss of consciousness"
        ],
        "severe_bleeding": [
            "severe bleeding",
            "heavy bleeding",
            "bahut khoon",
            "zyada khoon"
        ]
    }

    matched_signals = []

    for signal_name, keywords in safety_keywords.items():

        for keyword in keywords:

            if keyword in text:
                matched_signals.append(signal_name)
                break

    urgency_signal = len(matched_signals) > 0

    return {
        "urgency_signal": urgency_signal,
        "matched_signals": matched_signals,
        "review_required": True
    }