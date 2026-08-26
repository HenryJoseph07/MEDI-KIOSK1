import { useState } from "react";

function UploadBox() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="upload-box">

      <div className="upload-icon">
        📤
      </div>

      <h2>Upload Medical Document</h2>

      <p>
        Upload prescriptions, lab reports or medical records
      </p>

      {/* Hidden file input */}
      <input
        type="file"
        id="medicalFile"
        className="file-input"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileChange}
      />

      {/* Custom Choose File button */}
      <label
        htmlFor="medicalFile"
        className="choose-file-btn"
      >
        📁 Choose File
      </label>

      {/* Selected file name */}
      {selectedFile && (
        <div className="selected-file">
          <span>📄</span>

          <span className="file-name">
            {selectedFile.name}
          </span>
        </div>
      )}

    </div>
  );
}

export default UploadBox;