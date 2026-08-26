from flask import Flask, request, jsonify
from pathlib import Path
import sys
import os

# Allow importing main.py from the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from main import run_pipeline


app = Flask(__name__)

# Temporary upload directory
UPLOAD_FOLDER = PROJECT_ROOT / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "MediKiosk AI Pipeline"
    })


@app.route("/process", methods=["POST"])
def process_document():

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "error": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "No filename provided"
        }), 400

    # Save uploaded file
    filepath = Path(app.config["UPLOAD_FOLDER"]) / file.filename
    file.save(filepath)

    try:
        # Run your existing AI pipeline
        result = run_pipeline(str(filepath))

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        # Remove temporary file after processing
        if filepath.exists():
            filepath.unlink()


if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )