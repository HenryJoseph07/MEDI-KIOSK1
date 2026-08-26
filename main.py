"""
main.py

MediKiosk AI Pipeline

Image/PDF
    ↓
Gemini Vision OCR
    ↓
Text Cleaning
    ↓
Gemini Medical Structuring
    ↓
Structured JSON
"""

import sys
import json

from extraction.ocr_processor import run_ocr
from extraction.pdf_processor import extract_text_from_pdf, is_pdf
from extraction.text_cleaner import clean_text
from summarization.summarizer import summarize


def run_pipeline(filepath: str) -> dict:

    # PDF
    if is_pdf(filepath):
        raw_text = extract_text_from_pdf(filepath)
    else:
        # Image → Gemini Vision
        raw_text = run_ocr(filepath)

    # Clean extracted text
    cleaned = clean_text(raw_text)

    # Gemini → structured medical information
    structured_summary = summarize(cleaned)

    # Keep OCR text for debugging/frontend
    structured_summary["raw_text_preview"] = cleaned[:1000]

    return structured_summary


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print("Usage: python main.py <path_to_document>")
        sys.exit(1)

    filepath = sys.argv[1]

    try:
        result = run_pipeline(filepath)

        print(
            json.dumps(
                result,
                indent=2,
                ensure_ascii=False,
                default=str
            )
        )

    except Exception as e:
        print(f"[Pipeline] ERROR: {e}")
        sys.exit(1)