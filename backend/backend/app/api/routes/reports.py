from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil

from app.services.report_service import process_report


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ==========================================
# Upload Directory
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[3]

UPLOAD_DIR = (
    BASE_DIR
    / "uploads"
    / "reports"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# Report Status
# ==========================================

@router.get("/status")
def report_status():
    return {
        "status": "success",
        "message": "Report processing module is ready"
    }


# ==========================================
# Upload + OCR + Extraction
# ==========================================

@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...)
):

    if not file.filename:
        return {
            "status": "error",
            "message": "No file selected."
        }


    # Prevent path traversal
    safe_filename = Path(
        file.filename
    ).name


    # Supported extensions
    allowed_extensions = {
        ".pdf",
        ".txt",
        ".png",
        ".jpg",
        ".jpeg"
    }

    extension = Path(
        safe_filename
    ).suffix.lower()


    if extension not in allowed_extensions:
        return {
            "status": "error",
            "message": (
                "Unsupported file format. "
                "Please upload PDF, TXT, PNG or JPG."
            )
        }


    # Final server path
    file_path = (
        UPLOAD_DIR
        / safe_filename
    )


    # Save uploaded file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )


    try:

        # Process OCR + lab extraction
        result = process_report(
            str(file_path)
        )


        return {
            "status": "success",

            "message": (
                "Report uploaded and "
                "processed successfully."
            ),

            "filename": safe_filename,

            # Used by frontend
            "report_file_path": str(
                file_path
            ),

            "report": result,

            "disclaimer": (
                "This report processing output "
                "is for triage support only and "
                "does not provide medical diagnosis "
                "or treatment."
            )
        }


    except Exception as error:

        return {
            "status": "error",

            "message": (
                "Unable to process the "
                "uploaded medical report."
            ),

            "filename": safe_filename,

            "error": str(error)
        }