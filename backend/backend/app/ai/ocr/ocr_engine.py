from pathlib import Path
import os

import pytesseract
from PIL import Image
from pypdf import PdfReader
from pdf2image import convert_from_path


# =========================================================
# CONFIGURATION
# =========================================================

# Local Windows system ke liye Tesseract path.
# Render/Linux par system-installed Tesseract automatically use hoga.
if os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )


# Local Windows par Poppler path.
# Render/Linux par None use hoga because Poppler system PATH
# se available hoga.
if os.name == "nt":
    POPPLER_PATH = (
        r"E:\Release-26.09.0-0\poppler-26.09.0\Library\bin"
    )
else:
    POPPLER_PATH = None


# =========================================================
# MAIN TEXT EXTRACTION FUNCTION
# =========================================================

def extract_text_from_file(file_path: str) -> str:
    """
    Extract text from TXT, PDF and image files.

    Supported formats:
        - TXT
        - PDF
        - PNG
        - JPG
        - JPEG

    PDF processing:
        1. Try embedded text extraction using pypdf.
        2. If no text exists, convert PDF pages to images.
        3. Run Tesseract OCR on each page.

    Prototype only — not for medical diagnosis.
    """

    path = Path(file_path)

    # =====================================================
    # FILE CHECK
    # =====================================================

    if not path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    extension = path.suffix.lower()

    # =====================================================
    # TXT FILE
    # =====================================================

    if extension == ".txt":

        return path.read_text(
            encoding="utf-8-sig"
        ).strip()

    # =====================================================
    # IMAGE OCR
    # =====================================================

    if extension in [".png", ".jpg", ".jpeg"]:

        try:

            image = Image.open(path)

            extracted_text = pytesseract.image_to_string(
                image
            )

            return extracted_text.strip()

        except Exception as error:

            return (
                "Image OCR failed: "
                f"{str(error)}"
            )

    # =====================================================
    # PDF PROCESSING
    # =====================================================

    if extension == ".pdf":

        # -------------------------------------------------
        # STEP 1: Try embedded PDF text
        # -------------------------------------------------

        try:

            reader = PdfReader(str(path))

            extracted_pages = []

            for page in reader.pages:

                page_text = page.extract_text()

                if page_text:
                    extracted_pages.append(
                        page_text.strip()
                    )

            extracted_text = "\n".join(
                extracted_pages
            ).strip()

        except Exception:

            extracted_text = ""

        # -------------------------------------------------
        # If embedded text exists, return it
        # -------------------------------------------------

        if extracted_text:

            return extracted_text

        # -------------------------------------------------
        # STEP 2: Scanned PDF OCR
        # -------------------------------------------------

        try:

            pdf_options = {
                "dpi": 200
            }

            if POPPLER_PATH:
                pdf_options["poppler_path"] = POPPLER_PATH

            pages = convert_from_path(
                str(path),
                **pdf_options
            )

            ocr_pages = []

            for page_number, page_image in enumerate(
                pages,
                start=1
            ):

                page_text = pytesseract.image_to_string(
                    page_image
                ).strip()

                if page_text:

                    ocr_pages.append(
                        f"Page {page_number}:\n"
                        f"{page_text}"
                    )

            scanned_text = "\n\n".join(
                ocr_pages
            ).strip()

            if scanned_text:

                return scanned_text

            return (
                "No text could be extracted from the PDF."
            )

        except Exception as error:

            return (
                "Scanned PDF OCR failed: "
                f"{str(error)}"
            )

    # =====================================================
    # UNSUPPORTED FILE
    # =====================================================

    return (
        "Unsupported file format. "
        "Please upload TXT, PDF, PNG or JPG."
    )