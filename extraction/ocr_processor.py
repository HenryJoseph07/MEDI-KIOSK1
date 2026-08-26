"""
ocr_processor.py

Uses Gemini Vision instead of Tesseract.

Input:
    Image file (jpg, jpeg, png, webp)

Output:
    Raw text extracted from the document.

Gemini can read:
    - Printed laboratory reports
    - Handwritten prescriptions
    - Patient details
    - Medicine names
    - Diagnoses
    - Lab values
"""

import os
from pathlib import Path

from google import genai
from google.genai import types


GEMINI_MODEL = os.environ.get(
    "GEMINI_MODEL",
    "gemini-3.5-flash-lite"
)


def _get_client():
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY environment variable is not set."
        )

    return genai.Client(api_key=api_key)


def _get_mime_type(filepath: str) -> str:
    extension = Path(filepath).suffix.lower()

    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".gif": "image/gif",
    }

    return mime_types.get(extension, "image/jpeg")


def run_ocr(filepath: str) -> str:
    """
    Sends the image directly to Gemini Vision and asks it
    to accurately transcribe all visible text.

    This replaces Tesseract completely.
    """

    if not os.path.exists(filepath):
        raise FileNotFoundError(
            f"File not found: {filepath}"
        )

    client = _get_client()

    with open(filepath, "rb") as f:
        image_bytes = f.read()

    mime_type = _get_mime_type(filepath)

    prompt = """
You are a medical document OCR system.

Read the supplied medical document carefully.

The document may be:
1. A printed laboratory report
2. A printed prescription
3. A handwritten prescription
4. A medical form containing patient information

Extract ALL visible text as accurately as possible.

IMPORTANT:
- Preserve the actual text.
- Do not summarize.
- Do not invent missing information.
- Do not correct uncertain handwriting by guessing.
- For handwritten text, make your best transcription.
- Preserve medicine names exactly as they appear when possible.
- Preserve numbers, decimal points, dates and units.
- Include patient details such as:
  Name
  Age
  Sex
  Address
  Date
  Doctor
  Sample number
  Registration number
- Include laboratory test names, results, units and reference ranges.
- Include diagnosis/complaint text.
- Include medicine names and dosage/frequency information.
- Include negative results such as Negative.
- Include text in Indian languages if present.

Return ONLY the extracted text.
Do not add explanations.
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type
            ),
            prompt
        ]
    )

    text = response.text

    if not text:
        raise RuntimeError(
            "Gemini returned empty OCR text."
        )

    return text.strip()