"""
pdf_processor.py — PDF -> raw text (per page, then joined).

Some discharge summaries / lab reports patients upload will be PDFs,
not photos. This renders each PDF page to an image and reuses the
same OCR pipeline from ocr_processor.py, so Cloud Vision / Tesseract
fallback logic isn't duplicated.

Requires: pdf2image (pip) + poppler installed on the machine:
  - Ubuntu/Debian: sudo apt install poppler-utils
  - Mac: brew install poppler
  - Windows: download poppler binaries, add the bin/ folder to PATH
    (see README for the exact link)
"""

import os
import tempfile
from pdf2image import convert_from_path

from extraction.ocr_processor import run_ocr


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Converts every page of a PDF to an image, runs OCR on each page,
    and joins the results with a page-break marker. Works for both
    scanned (image-only) and text PDFs, since we always OCR rather
    than trying to extract embedded text — this keeps one consistent
    path for accuracy and for the language-hint logic in ocr_processor.
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
        pages = convert_from_path(pdf_path, dpi=300, output_folder=tmp_dir)

        full_text = []
        for i, page_image in enumerate(pages, start=1):
            page_path = os.path.join(tmp_dir, f"page_{i}.png")
            page_image.save(page_path, "PNG")
            page_text = run_ocr(page_path)
            full_text.append(f"--- Page {i} ---\n{page_text}")

        return "\n\n".join(full_text)


def is_pdf(filepath: str) -> bool:
    return filepath.lower().endswith(".pdf")
