"""
medical_parser.py — Two jobs:

1. rule_based_parse(): deterministic, offline extraction of medicines/
   lab values/diagnoses/dates from cleaned OCR text using keyword and
   regex matching. This is the fallback used when no LLM API key is
   configured, or if the LLM call fails/returns malformed JSON — it's
   what keeps a live demo from going blank.

2. normalize_llm_output(): takes whatever JSON the LLM returned and
   fills in any missing keys with safe defaults, so downstream code
   (main.py, the frontend) can always rely on a consistent shape
   regardless of which path produced the result.
"""

import re
from datetime import datetime

# Words that indicate a line is a MEDICINE line (form + frequency).
DRUG_FORM_WORDS = ["tab", "tablet", "cap", "capsule", "syp", "syrup", "inj", "injection"]
FREQ_WORDS = ["od", "bd", "tds", "qid", "sos"]

# Lab lines must contain one of these units. Widened from the original
# g/dL-style list after testing against a real lab report — CBC panels
# commonly use 10^3/ul, /ul, and bare % as well.
LAB_UNIT_RE = r"(g/dl|mg/dl|mmol/l|iu/l|10\^?3/u?l|/mm3|/u?l|%)"

REFERENCE_RANGES = {
    "hemoglobin": (13.0, 17.0, "g/dL"),
    "fbs": (70, 100, "mg/dL"),
    "fasting blood sugar": (70, 100, "mg/dL"),
    "creatinine": (0.6, 1.3, "mg/dL"),
    "wbc": (4000, 11000, "/mm3"),
}

DATE_PATTERN = r"\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b"


def _is_medicine_line(low: str) -> bool:
    has_form = any(k in low for k in DRUG_FORM_WORDS)
    has_freq_or_duration = (
        any(re.search(rf"\b{f}\b", low) for f in FREQ_WORDS)
        or re.search(r"x\s?\d+\s?day", low)
        or "day" in low
    )
    return has_form and has_freq_or_duration


def _extract_dates(text: str):
    return list(set(re.findall(DATE_PATTERN, text)))


def _extract_medicines(text: str):
    meds = []
    for line in text.splitlines():
        low = line.lower()
        if _is_medicine_line(low):
            cleaned = line.strip()
            if cleaned and len(cleaned) < 100:
                meds.append({"name": cleaned, "dosage": None, "frequency": None})
    return meds


def _parse_range_and_flag(value: float, window_text: str, unit: str):
    """
    Tries to find a reference range (e.g. '35.5 - 74.7') in the given
    text window and flag the value against it. Falls back to the
    static REFERENCE_RANGES dict if no range is found in the document
    itself. Real lab reports print their own ranges (often gender-
    specific) — using the document's own range is more accurate than
    a hardcoded guess whenever it's available.
    """
    range_match = re.search(r"(\d+\.?\d*)\s*-\s*(\d+\.?\d*)", window_text)
    if range_match:
        try:
            lo, hi = float(range_match.group(1)), float(range_match.group(2))
            return "LOW" if value < lo else "HIGH" if value > hi else "NORMAL"
        except ValueError:
            pass
    return None


# Words that mean a line is header/demographic info, not a lab test —
# excluded so "AGE: 8 years" etc never gets mistaken for a result row.
NON_LAB_HEADER_WORDS = [
    "name", "address", "age", "sample", "date", "referred", "doctor",
    "clinic", "hospital", "investigations", "reference values", "result",
    "haematology", "hematology", "serology", "immunology", "report",
    "email", "electronically", "verified", "signature"
]


def _extract_lab_values(text: str):
    lines = text.splitlines()
    results = []

    for i, line in enumerate(lines):
        low = line.lower().strip()
        if not low or _is_medicine_line(low):
            continue
        if any(h in low for h in NON_LAB_HEADER_WORDS):
            continue

        # Test name followed directly by its result value — this is
        # how virtually every lab report table row starts.
        m = re.match(
            r"^(?P<name>[A-Za-z][A-Za-z\s]{1,30}?)\s*[:\-]?\s*(?P<value>\d{1,3}(?:,\d{2,3})*\.?\d*)\b",
            line.strip()
        )
        if not m:
            continue

        name = m.group("name").strip()
        if len(name) < 2:
            continue
        try:
            value = float(m.group("value").replace(",", ""))
        except ValueError:
            continue

        # Unit and reference range often wrap onto the next 1-2 lines
        # in real reports — search a small window instead of just
        # the current line.
        window = " ".join(lines[i:i + 3])
        unit_match = re.search(LAB_UNIT_RE, window.lower())
        unit = unit_match.group(1) if unit_match else ""

        flag = _parse_range_and_flag(value, window, unit)
        if flag is None:
            ref = REFERENCE_RANGES.get(name.lower())
            if ref:
                lo, hi, _u = ref
                flag = "LOW" if value < lo else "HIGH" if value > hi else "NORMAL"

        results.append({
            "test": name.title(),
            "value": value,
            "unit": unit,
            "flag": flag
        })
    return results


def _extract_diagnoses(text: str):
    keywords = ["diagnosis", "dx", "impression", "c/o", "complaint"]
    hits = []
    for line in text.splitlines():
        if any(k in line.lower() for k in keywords) and not _is_medicine_line(line.lower()):
            hits.append(line.strip())
    return hits


def rule_based_parse(cleaned_text: str) -> dict:
    """Offline, deterministic extraction — the fallback path."""
    dates = _extract_dates(cleaned_text)
    return {
        "document_type": "unknown",
        "date": dates[0] if dates else None,
        "diagnoses": _extract_diagnoses(cleaned_text),
        "medicines": _extract_medicines(cleaned_text),
        "lab_values": _extract_lab_values(cleaned_text),
        "source": "rule_based",
        "processed_at": datetime.now().isoformat(timespec="seconds"),
    }


def normalize_llm_output(llm_json: dict) -> dict:
    """
    Ensures the LLM output always has a consistent structure.
    """

    patient = llm_json.get("patient", {})

    return {
        "document_type": llm_json.get("document_type", "unknown"),

        "patient": {
            "name": patient.get("name"),
            "age": patient.get("age"),
            "sex": patient.get("sex"),
            "address": patient.get("address"),
            "date": patient.get("date"),
            "doctor": patient.get("doctor"),
        },

        "date": llm_json.get("date") or patient.get("date"),

        "diagnoses": llm_json.get("diagnoses", []),

        "medicines": llm_json.get("medicines", []),

        "lab_values": llm_json.get("lab_values", []),

        "source": "llm",

        "processed_at": datetime.now().isoformat(timespec="seconds"),
    }