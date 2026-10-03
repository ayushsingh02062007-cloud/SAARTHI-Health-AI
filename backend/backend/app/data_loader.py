import json
from pathlib import Path


def load_demo_patient():
    file_path = (
        Path(__file__).parent.parent
        / "data"
        / "synthetic_patients"
        / "patient_demo.json"
    )

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)