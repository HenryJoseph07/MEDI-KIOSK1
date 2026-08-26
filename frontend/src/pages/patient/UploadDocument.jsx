import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/api";

function UploadDocument() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [documentType, setDocumentType] =
    useState("medical_report");

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");

      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();

    formData.append(
      "document",
      selectedFile
    );

    formData.append(
      "documentType",
      documentType
    );

    formData.append(
      "documentName",
      selectedFile.name
    );

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(
        "Upload response:",
        data
      );

      alert(
        "Document uploaded successfully!"
      );

      navigate("/patient-dashboard");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <h1>Upload Medical Document</h1>

      <div>

        <label>
          Document Type
        </label>

        <select
          value={documentType}
          onChange={(e) =>
            setDocumentType(
              e.target.value
            )
          }
        >
          <option value="prescription">
            Prescription
          </option>

          <option value="lab_report">
            Lab Report
          </option>

          <option value="health_report">
            Health Report
          </option>

          <option value="medical_report">
            Medical Report
          </option>

          <option value="other">
            Other
          </option>
        </select>

      </div>

      <div>

        <label>
          Choose Medical Document
        </label>

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

      </div>

      {selectedFile && (
        <p>
          Selected:
          {" "}
          {selectedFile.name}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading
          ? "Uploading..."
          : "Upload Document"}
      </button>

      <button
        onClick={() =>
          navigate("/patient-dashboard")
        }
      >
        Back
      </button>

    </div>
  );
}

export default UploadDocument;