"""
summarizer.py

Gemini-based medical document structuring.

Input:
    Cleaned OCR text

Output:
    Consistent structured JSON containing:

    - document_type
    - patient_details
    - date
    - diagnoses
    - medicines
    - lab_values
    - source
    - processed_at
"""

import os
import re
import json
from datetime import datetime

from google import genai


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


def build_prompt(cleaned_text: str) -> str:

    return f"""
You are a medical document information extraction system.

Analyze the following OCR text from a medical document.

The source may be:
- a laboratory report
- a printed prescription
- a handwritten prescription
- a medical consultation note

Your job is to convert the text into accurate structured JSON.

IMPORTANT RULES:

1. Do NOT invent information.
2. If information is not present, use null or [].
3. Preserve medicine names as accurately as possible.
4. Handwritten medicine names may contain OCR errors. Use the surrounding
   context to make the most likely interpretation, but do not invent a
   completely unrelated medicine.
5. Extract patient information whenever available.
6. Extract all laboratory values when present.
7. Preserve negative test results.
8. Preserve units.
9. Preserve reference ranges when useful.
10. Determine whether the document is a:
      "lab_report"
      "prescription"
      "medical_note"
      "other"

PATIENT DETAILS:

Extract:
- name
- age
- sex
- address
- doctor
- sample_number
- registration_number

DATE:

Extract the document date.

DIAGNOSES:

Extract complaints, diagnoses, clinical impressions and conditions.

MEDICINES:

For every medicine mentioned, extract:
- name
- dosage
- frequency
- duration

If dosage/frequency/duration is not readable, use null.

LAB VALUES:

For every laboratory investigation, extract:
- test
- value
- unit
- reference_range
- flag

For flag use:
- HIGH
- LOW
- NORMAL
- null

Do NOT mark a value HIGH or LOW unless the document provides enough
information to make that determination.

IMPORTANT FOR LAB REPORTS:

Do not skip rows just because the value is 0, 3, 4, 69, Negative,
or another small value.

For example, if the report contains:

Monocytes    04%
Eosinophils  03%
Basophils    00%

all three must be included.

Do not confuse reference-range values with the actual result.

Return ONLY valid JSON.

JSON FORMAT:

{{
  "document_type": "lab_report",
  "patient_details": {{
    "name": null,
    "age": null,
    "sex": null,
    "address": null,
    "doctor": null,
    "sample_number": null,
    "registration_number": null
  }},
  "date": null,
  "diagnoses": [],
  "medicines": [
    {{
      "name": null,
      "dosage": null,
      "frequency": null,
      "duration": null
    }}
  ],
  "lab_values": [
    {{
      "test": null,
      "value": null,
      "unit": null,
      "reference_range": null,
      "flag": null
    }}
  ]
}}

OCR TEXT:

--------------------
{cleaned_text}
--------------------
"""


def _clean_json_response(text: str) -> str:
    """
    Removes Markdown code fences if Gemini returns them.
    """

    text = text.strip()

    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^```\s*",
        "",
        text
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    return text.strip()


def _call_gemini(cleaned_text: str) -> dict:

    client = _get_client()

    prompt = build_prompt(cleaned_text)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    raw = response.text

    if not raw:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    raw = _clean_json_response(raw)

    return json.loads(raw)


def _normalize(result: dict) -> dict:

    patient = result.get("patient_details")

    if not isinstance(patient, dict):
        patient = {}

    medicines = result.get("medicines", [])
    lab_values = result.get("lab_values", [])
    diagnoses = result.get("diagnoses", [])

    if not isinstance(medicines, list):
        medicines = []

    if not isinstance(lab_values, list):
        lab_values = []

    if not isinstance(diagnoses, list):
        diagnoses = []

    normalized_medicines = []

    for medicine in medicines:

        if not isinstance(medicine, dict):
            continue

        normalized_medicines.append({
            "name": medicine.get("name"),
            "dosage": medicine.get("dosage"),
            "frequency": medicine.get("frequency"),
            "duration": medicine.get("duration")
        })

    normalized_labs = []

    for lab in lab_values:

        if not isinstance(lab, dict):
            continue

        normalized_labs.append({
            "test": lab.get("test"),
            "value": lab.get("value"),
            "unit": lab.get("unit"),
            "reference_range": lab.get("reference_range"),
            "flag": lab.get("flag")
        })

    return {
        "document_type": result.get(
            "document_type",
            "other"
        ),

        "patient_details": {
            "name": patient.get("name"),
            "age": patient.get("age"),
            "sex": patient.get("sex"),
            "address": patient.get("address"),
            "doctor": patient.get("doctor"),
            "sample_number": patient.get("sample_number"),
            "registration_number": patient.get(
                "registration_number"
            )
        },

        "date": result.get("date"),

        "diagnoses": diagnoses,

        "medicines": normalized_medicines,

        "lab_values": normalized_labs,

        "source": "llm",

        "processed_at": datetime.now().isoformat(
            timespec="seconds"
        )
    }


def summarize(cleaned_text: str) -> dict:
    """
    Gemini structuring with rule-based fallback.
    """

    try:

        result = _call_gemini(cleaned_text)

        return _normalize(result)

    except Exception as e:

        print(
            f"[Summarizer] Gemini structuring failed "
            f"({e}), falling back to rule-based parser."
        )

        from summarization.medical_parser import rule_based_parse

        result = rule_based_parse(cleaned_text)

        # Make sure older rule-based output also has patient_details.
        if "patient_details" not in result:
            result["patient_details"] = {
                "name": None,
                "age": None,
                "sex": None,
                "address": None,
                "doctor": None,
                "sample_number": None,
                "registration_number": None
            }

        return result