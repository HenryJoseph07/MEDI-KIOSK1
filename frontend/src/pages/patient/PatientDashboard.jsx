import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/api";

function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const patientData = await apiRequest(
        "/api/patients/me"
      );

      setPatient(
        patientData.user ||
        patientData.patient
      );

      const documentData = await apiRequest(
        "/api/documents/my-documents"
      );

      setDocuments(
        documentData.documents || []
      );

    } catch (error) {
      console.error(error);

      if (
        error.message.toLowerCase().includes(
          "unauthorized"
        )
      ) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1>Patient Dashboard</h1>

      {patient && (
        <div>
          <h2>Welcome, {patient.name}</h2>

          <p>
            User ID: {patient.userId}
          </p>

          <p>
            Email: {patient.email}
          </p>
        </div>
      )}

      <h2>My Documents</h2>

      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        documents.map((document) => (
          <div key={document.id}>
            <h3>
              {document.original_file_name}
            </h3>

            <p>
              Type: {document.document_type}
            </p>

            <p>
              Status: {document.processing_status}
            </p>
          </div>
        ))
      )}

      <button
        onClick={() =>
          navigate("/upload-document")
        }
      >
        Upload Document
      </button>

      <button
        onClick={() =>
          navigate("/health-summary")
        }
      >
        Health Summary
      </button>

      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
}

export default PatientDashboard;