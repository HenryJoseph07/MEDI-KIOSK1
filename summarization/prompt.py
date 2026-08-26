"""
prompt.py — Prompt construction for medical document extraction.
Supports:
- Printed laboratory reports
- Printed prescriptions
- Handwritten prescriptions
- Patient demographic information
"""

def build_extraction_prompt(cleaned_text: str) -> str:

    return f"""
You are a medical document information extraction system.

Your task is to extract structured information from OCR text obtained
from a medical document.

The document may be:
1. A printed laboratory report
2. A printed prescription
3. A handwritten prescription
4. A medical consultation note

The OCR may contain spelling mistakes, broken lines, incorrect characters,
missing spaces, and incorrectly recognized handwriting.

IMPORTANT:
- Reconstruct the document structure using context.
- Do NOT require information to appear on the same OCR line.
- For laboratory reports, associate test names with their corresponding
  result values even when the OCR has separated the columns.
- Preserve the actual value from the document.
- Do not invent medical values.
- If a value is genuinely absent or unreadable, use null.
- Do not use null merely because the value is on another OCR line.
- For handwritten text, make your best interpretation using surrounding
  context, but do not invent a medicine or diagnosis that has no evidence.
- Preserve uncertainty rather than hallucinating.

PATIENT INFORMATION
Extract patient information whenever it appears anywhere in the document.

Possible fields:
- name
- age
- sex
- address
- date
- doctor

Patient information may appear in formats such as:
NAME:
Name:
Patient:
Age:
AGE:
Sex:
SEX:
Address:
ADDRESS:
Date:
DATE:
Doctor:
Referred Doctor:
Dr.

If a field is not present or genuinely unreadable, use null.

LABORATORY REPORTS
For each laboratory test, extract:
- test
- value
- unit
- flag

The value may be:
- an integer
- a decimal
- a value containing commas
- a value such as "<2.50"
- a textual result such as "Negative"

Examples:
TLC 2,300
Haemoglobin 13.0
PCV 38.4
Platelets 1,80,000
Neutrophils 28%
Dengue NS1 Negative

Use the reference range in the document whenever available to determine:
- LOW
- HIGH
- NORMAL

Do NOT incorrectly mark a value as high or low merely because of a
generic reference range. Prefer the reference range printed in the
document.

For example:

Neutrophils     28%     35.5 - 74.7%

must become:

{{
  "test": "Neutrophils",
  "value": "28",
  "unit": "%",
  "flag": "LOW"
}}

If a test has a value clearly visible in the OCR/context, extract it
even if the table formatting is broken.

PRESCRIPTIONS
For medicines extract:
- name
- dosage
- frequency
- duration

Handwritten prescriptions often contain abbreviations such as:
OD, BD, TDS, QID, SOS, HS, etc.

Preserve these abbreviations when they are present.

For example:
"Tablet X 500 mg BD x 5 days"

should become:

{{
  "name": "Tablet X",
  "dosage": "500 mg",
  "frequency": "BD",
  "duration": "5 days"
}}

Do not assume that every handwritten line is a medicine.
Some lines may be:
- diagnosis
- clinical complaint
- examination findings
- treatment instructions
- dental findings
- procedure notes

DIAGNOSES / COMPLAINTS
Extract clinically relevant diagnoses, complaints, or impressions when
they are explicitly present.

DOCUMENT TYPE
Determine whether the document is:
- "lab_report"
- "prescription"
- "consultation_note"
- "medical_report"
- "unknown"

OUTPUT REQUIREMENT

Return ONLY valid JSON.

The JSON must have exactly this structure:

{{
  "document_type": "lab_report",
  "patient": {{
    "name": null,
    "age": null,
    "sex": null,
    "address": null,
    "date": null,
    "doctor": null
  }},
  "diagnoses": [],
  "medicines": [],
  "lab_values": [],
  "source": "llm"
}}

For lab_values use:

{{
  "test": "test name",
  "value": "value",
  "unit": "unit",
  "flag": "LOW/NORMAL/HIGH"
}}

For medicines use:

{{
  "name": "medicine name",
  "dosage": null,
  "frequency": null,
  "duration": null
}}

Do not add explanations outside the JSON.

OCR TEXT:

--------------------
{cleaned_text}
--------------------
"""