import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import HealthSummary from "../../components/HealthSummary";
import "./DoctorDashboard.css";

import { apiRequest } from "../../api/api";

function PatientDetails() {

  const { id } = useParams();
  const [documents, setDocuments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {

    try {

      setLoading(true);

      const patientData = await apiRequest(
        `/api/patients/${id}`
      );
      const documentData = await apiRequest(
  `/api/documents/patient/${id}`
);

setDocuments(
  documentData.documents || []
);
      const summaryData = await apiRequest(
        `/api/summaries/patient/${id}`
      );

      setPatient(patientData.patient);

      setSummary(
        summaryData.summaries?.[0] || null
      );

    } catch (error) {

      console.error(
        "Patient Details Error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading patient information...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-loading">
        Patient not found.
      </div>
    );
  }

  return (
    <>
      <Navbar userName="Doctor" />

      <div className="dashboard-layout">

        <Sidebar type="doctor" />

        <main className="main-content">

          <div className="page-header">

            <h1>
              Patient Details
            </h1>

            <p>
              Patient ID: {patient.userId}
            </p>

          </div>


          {/* PATIENT INFORMATION */}

          <div
            className="card"
            style={{ marginBottom: "25px" }}
          >

            <h2>
              👤 {patient.name}
            </h2>

            <p style={{ marginTop: "8px" }}>
              Email: {patient.email}
            </p>

          </div>


          {/* HEALTH SUMMARY */}
          <div
  className="card"
  style={{ marginTop: "25px" }}
>

  <h2>
    📄 Medical Documents
  </h2>

  {documents.length === 0 ? (

    <p style={{ marginTop: "15px" }}>
      No documents uploaded.
    </p>

  ) : (

    <div style={{ marginTop: "20px" }}>

      {documents.map((doc) => (

        <div
          key={doc.id}
          style={{
            padding: "15px",
            borderBottom: "1px solid #e2e8f0"
          }}
        >

          <h3>
            📄 {doc.original_file_name}
          </h3>

          <p>
            Type: {doc.document_type}
          </p>

          <p>
            Status: {doc.processing_status}
          </p>

          <p>
            Uploaded:{" "}
            {new Date(
              doc.uploaded_at
            ).toLocaleDateString()}
          </p>

        </div>

      ))}

    </div>

  )}

</div>
          {summary ? (

            <HealthSummary
  summary={{
    symptoms:
      summary.symptoms?.join(", ") ||
      "No symptoms available",

    diagnosis:
      summary.diagnosis?.join(", ") ||
      "No diagnosis available",

    medications:
      summary.medications
        ?.map((m) =>
          typeof m === "object"
            ? `${m.name || ""} ${m.dosage || ""}`
            : m
        )
        .join(", ") ||
      "No medication information available",

    labResults:
      summary.lab_findings || []
  }}
/>
            
            

          ) : (

            <div className="card">
              <h2>🩺 AI Health Summary</h2>

              <p style={{ marginTop: "15px" }}>
                No health summary available.
              </p>
            </div>

          )}

        </main>

      </div>
    </>
  );
}

export default PatientDetails;