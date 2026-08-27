import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadDocument.css";
import { apiRequest } from "../../api/api";

function UploadDocument() {
  const navigate = useNavigate();
  
  const [documentType, setDocumentType] = useState("Medical Report");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose a medical document");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

formData.append("document", file);
formData.append("documentType", documentType);
formData.append("documentName", file.name);

const data = await apiRequest(
  "/api/documents/upload",
  {
    method: "POST",
    body: formData
  }
);

alert(
  data.message ||
  "Document uploaded successfully!"
);

navigate("/health-summary");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      <div className="upload-card">

        {/* Brand */}
        <div className="upload-brand">
          MEDNEXUS
        </div>

        <p className="upload-subtitle">
          Secure healthcare management platform
        </p>

        {/* Heading */}
        <h1 className="upload-title">
          Upload Medical Document
        </h1>

        <p className="upload-description">
          Upload your medical reports and documents securely.
        </p>

        <form
          className="upload-form"
          onSubmit={handleUpload}
        >

          {/* Document Type */}
          <div className="upload-form-group">

            <label htmlFor="documentType">
              Document Type
            </label>

            <select
  value={documentType}
  onChange={(e) =>
    setDocumentType(e.target.value)
  }
>
  <option value="medical_report">
    Medical Report
  </option>

  <option value="prescription">
    Prescription
  </option>

  <option value="lab_report">
    Lab Report
  </option>

  <option value="health_report">
    Health Report
  </option>

  <option value="other">
    Other
  </option>
</select>

          </div>

          {/* File */}
          <div className="upload-form-group">

            <label htmlFor="medicalFile">
              Choose Medical Document
            </label>

            <div className="file-upload-box">

              <input
                id="medicalFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
              />

              {file && (
                <p className="selected-file">
                  Selected: {file.name}
                </p>
              )}

            </div>

          </div>

          {/* Buttons */}
          <div className="upload-actions">

            <button
              type="submit"
              className="upload-btn"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>

            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/patient/dashboard")}
            >
              Back
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default UploadDocument;