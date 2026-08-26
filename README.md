# MediKiosk — AI Pipeline Module

This is the document-intelligence core: takes an uploaded document
(image or PDF), extracts text, cleans it, and produces a structured
clinical summary. Built to be imported by the team's Flask app
(whoever owns the upload API endpoint) — it does not run its own web
server.

## Pipeline flow

```
File (image or PDF)
   |
   v
extraction/pdf_processor.py   (if PDF: render pages -> images)
   |
   v
extraction/ocr_processor.py   (image -> raw text)
   |    Cloud Vision (primary) -> Tesseract (offline fallback)
   v
extraction/text_cleaner.py    (raw text -> cleaned text)
   |
   v
summarization/summarizer.py   (cleaned text -> structured JSON)
   |    LLM-based (primary) -> rule_based_parse (offline fallback)
   v
Structured clinical summary dict
```

Every stage has a fallback so the pipeline degrades gracefully instead
of crashing if an API key is missing or the internet drops mid-demo:
Cloud Vision -> Tesseract, and LLM structuring -> rule-based parser.

## Folder structure

```
ai_pipeline/
├── main.py                        <- orchestrator / entry point
├── extraction/
│   ├── ocr_processor.py           <- image -> raw text
│   ├── pdf_processor.py           <- PDF -> raw text (per page)
│   └── text_cleaner.py            <- raw text -> cleaned text
├── summarization/
│   ├── summarizer.py              <- cleaned text -> structured JSON
│   ├── prompt.py                  <- LLM prompt templates
│   └── medical_parser.py          <- rule-based fallback + LLM output validation
├── requirements.txt
└── README.md
```

## Setup

1. Install system dependencies:
   - Tesseract OCR binary (offline OCR fallback):
     - Ubuntu/Debian: `sudo apt install tesseract-ocr tesseract-ocr-hin tesseract-ocr-tel tesseract-ocr-tam tesseract-ocr-ben tesseract-ocr-mar`
     - Mac: `brew install tesseract tesseract-lang`
     - Windows: installer from https://github.com/UB-Mannheim/tesseract/wiki
       (if pytesseract can't find it, set the path at the top of
       extraction/ocr_processor.py)
   - Poppler (needed for PDF page rendering):
     - Ubuntu/Debian: `sudo apt install poppler-utils`
     - Mac: `brew install poppler`
     - Windows: download poppler binaries and add the `bin/` folder to PATH

2. `pip install -r requirements.txt`

3. (Optional, recommended) Set up Cloud Vision for better OCR accuracy,
   especially on Indian scripts and handwriting:
   - Create a GCP project, enable the Cloud Vision API, create a
     service account, download its JSON key
   - `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"`

4. (Optional, recommended) Set up the LLM structuring step for much
   better accuracy than the rule-based parser, especially on messy
   OCR text:
   - `export ANTHROPIC_API_KEY="your-key-here"`

Without steps 3-4, the pipeline still fully works — it just uses the
offline/rule-based fallbacks throughout.

## How this connects to the Node.js backend

Node.js can't directly import Python code, so `api_server.py` exposes
this pipeline as a small HTTP service. Run it as its own process:

```
python3 api_server.py
```

It listens on **port 5001** (check with your backend teammate that
this doesn't clash with anything they've already got running).

Endpoints:
- `GET /health` — returns `{"status": "ok"}`, for a quick check that
  this service is up
- `POST /process-document` — accepts a multipart form with a file
  field named `document`, returns `{"ok": true, "data": {...}}` where
  `data` matches the schema documented in `output/summary_schema.json`

The Node.js `documentController.js` should forward the uploaded file
to this endpoint (e.g. using `axios` + `form-data`) after saving it,
then store/return whatever comes back in `data`.

## Usage

Command line (for testing against real sample documents):
```
python3 main.py path/to/prescription.jpg
python3 main.py path/to/lab_report.pdf
```

As a module (for whoever owns the Flask upload endpoint):
```python
from main import run_pipeline

result = run_pipeline(saved_filepath)
# result is a dict: document_type, date, diagnoses, medicines,
# lab_values, source ("llm" or "rule_based"), processed_at,
# raw_text_preview
```

## Demo-day notes

- Test on your actual sample documents early — tune the keyword lists
  in `summarization/medical_parser.py` (DRUG_FORM_WORDS,
  REFERENCE_RANGES) against what your documents actually contain, not
  generic examples.
- Keep the fallback paths working even if you set up Cloud Vision/LLM
  — they're your insurance against venue wifi failing mid-demo.
- `source` in the output tells you which path actually ran (`"llm"`
  or `"rule_based"`) — useful for debugging which one produced a given
  result.