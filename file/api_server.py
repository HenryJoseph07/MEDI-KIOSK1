"""
api_server.py — HTTP wrapper around the ai_pipeline, for the Node.js
backend team to call.

The rest of ai_pipeline (main.py, extraction/, summarization/) has no
knowledge of Flask or HTTP — it's pure processing logic. This file is
the ONLY integration point with the Node.js backend: it exposes one
endpoint that documentController.js (backend/src/controllers/) calls
after a patient uploads a document.

Run this as its own process, separate from the Node server:
    python3 api_server.py
It listens on port 5001 by default (Node backend likely uses 5000 or
3000/8000 for itself — check with your backend teammate and adjust
PORT below if there's a clash).
"""

import os
from flask import Flask, request, jsonify
from main import run_pipeline

app = Flask(__name__)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

PORT = 5001


@app.route("/health", methods=["GET"])
def health():
    """Simple check the backend team can hit to confirm this service is up."""
    return jsonify({"status": "ok"})


@app.route("/process-document", methods=["POST"])
def process_document():
    """
    Expects a multipart/form-data POST with a file field named
    'document' — same contract as documentRoutes.js should use when
    forwarding an uploaded file here.

    Returns the same structured JSON shape run_pipeline() produces:
    document_type, date, diagnoses, medicines, lab_values, source,
    processed_at, raw_text_preview. See output/summary_schema.json
    for the full documented contract.
    """
    if "document" not in request.files:
        return jsonify({"error": "No 'document' file field in request"}), 400

    file = request.files["document"]
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    file.save(filepath)

    try:
        result = run_pipeline(filepath)
        return jsonify({"ok": True, "data": result})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=PORT)