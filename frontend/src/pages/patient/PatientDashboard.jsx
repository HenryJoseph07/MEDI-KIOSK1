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

  // ===============================
  // LOAD PATIENT + DOCUMENTS
  // ===============================
  const loadPatientData = async () => {
    try {
      const patientData = await apiRequest("/api/patients/me");

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
        error.message &&
        error.message.toLowerCase().includes("unauthorized")
      ) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ===============================
  // STATUS CLASS
  // ===============================
  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "status status-success";

      case "processing":
        return "status status-warning";

      case "failed":
        return "status status-danger";

      default:
        return "status";
    }
  };

  // ===============================
  // FORMAT DATE
  // ===============================
  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );
    } catch {
      return "N/A";
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // ===============================
  // DASHBOARD
  // ===============================
  return (
    <div className="mediNexus-app">

      {/* =================================
          NAVBAR
      ================================= */}
      <header className="navbar">

        <div className="logo">
          MedNexus
        </div>

        <div className="user-info">

          <span>
            {patient?.name || "Patient"}
          </span>

          <span className="user-avatar">
            {patient?.name
              ? patient.name.charAt(0).toUpperCase()
              : "P"}
          </span>

        </div>

      </header>


      {/* =================================
          DASHBOARD LAYOUT
      ================================= */}
      <div className="dashboard-layout">

        {/* =================================
            SIDEBAR
        ================================= */}
        <aside className="sidebar">

          <div className="sidebar-logo">
            Patient Portal
          </div>

          <nav className="sidebar-menu">

            <a
              href="#dashboard"
              className="active"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                });
              }}
            >
              🏠 Dashboard
            </a>

            <a
              href="/upload-document"
              onClick={(e) => {
                e.preventDefault();
                navigate("/upload-document");
              }}
            >
              📄 Upload Document
            </a>

            <a
              href="/health-summary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/health-summary");
              }}
            >
              ❤️ Health Summary
            </a>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              🚪 Logout
            </a>

          </nav>

        </aside>


        {/* =================================
            MAIN CONTENT
        ================================= */}
        <main className="main-content">

          {/* PAGE HEADER */}
          <div className="page-header">

            <h1>
              Patient Dashboard
            </h1>

            <p>
              Welcome back,{" "}
              <strong>
                {patient?.name || "Patient"}
              </strong>
              . Manage your medical documents and health information.
            </p>

          </div>


          {/* =================================
              STATS
          ================================= */}
          <div className="stats-grid">

            <div className="card stat-card">

              <p>
                Total Documents
              </p>

              <h3>
                {documents.length}
              </h3>

            </div>


            <div className="card stat-card">

              <p>
                Completed
              </p>

              <h3>
                {
                  documents.filter(
                    (doc) =>
                      doc.processing_status === "completed"
                  ).length
                }
              </h3>

            </div>


            <div className="card stat-card">

              <p>
                Processing
              </p>

              <h3>
                {
                  documents.filter(
                    (doc) =>
                      doc.processing_status === "processing"
                  ).length
                }
              </h3>

            </div>

          </div>


          {/* =================================
              PATIENT INFORMATION
          ================================= */}
          {patient && (
            <div className="patient-details">

              <div className="card patient-profile">

                <div className="patient-avatar">
                  👤
                </div>

                <h2>
                  {patient.name}
                </h2>

                <p>
                  Patient
                </p>

              </div>


              <div className="card">

                <h2>
                  Personal Information
                </h2>

                <div className="patient-info-grid">

                  <div className="info-item">
                    <span>
                      Email
                    </span>

                    <strong>
                      {patient.email || "N/A"}
                    </strong>
                  </div>


                  <div className="info-item">
                    <span>
                      User ID
                    </span>

                    <strong>
                      {patient.userId || patient.id || "N/A"}
                    </strong>
                  </div>

                </div>

              </div>

            </div>
          )}


          {/* =================================
              DOCUMENT SECTION
          ================================= */}
          <section className="dashboard-section">

            <div className="section-heading">

              <div>
                <h2>
                  My Documents
                </h2>

                <p>
                  Your uploaded medical documents
                </p>
              </div>

              <button
                className="primary-btn"
                onClick={() =>
                  navigate("/upload-document")
                }
              >
                + Upload Document
              </button>

            </div>


            {/* NO DOCUMENTS */}
            {documents.length === 0 ? (

              <div className="upload-box">

                <div className="upload-icon">
                  📄
                </div>

                <h3>
                  No documents uploaded yet
                </h3>

                <p>
                  Upload a prescription, lab report,
                  or medical report to generate your
                  AI-powered health summary.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    navigate("/upload-document")
                  }
                >
                  Upload Your First Document
                </button>

              </div>

            ) : (

              /* DOCUMENT CARDS */
              <div className="documents-grid">

                {documents.map((document) => (

                  <div
                    className="card document-card"
                    key={document.id}
                  >

                    <div className="document-card-header">

                      <div className="document-icon">
                        📄
                      </div>

                      <span
                        className={getStatusClass(
                          document.processing_status
                        )}
                      >
                        {document.processing_status ||
                          "unknown"}
                      </span>

                    </div>


                    <h3>
                      {document.original_file_name ||
                        "Medical Document"}
                    </h3>


                    <div className="document-meta">

                      <p>
                        <strong>
                          Type:
                        </strong>{" "}
                        {document.document_type ||
                          "Other"}
                      </p>

                      <p>
                        <strong>
                          Uploaded:
                        </strong>{" "}
                        {formatDate(
                          document.uploaded_at
                        )}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* =================================
              QUICK ACTIONS
          ================================= */}
          <section className="dashboard-section">

            <div className="section-heading">

              <div>
                <h2>
                  Quick Actions
                </h2>

                <p>
                  Access your health tools
                </p>
              </div>

            </div>


            <div className="quick-actions">

              <button
                className="action-card"
                onClick={() =>
                  navigate("/upload-document")
                }
              >
                <span className="action-icon">
                  📤
                </span>

                <span>
                  <strong>
                    Upload Document
                  </strong>

                  <small>
                    Add a new medical report
                  </small>
                </span>

              </button>


              <button
                className="action-card"
                onClick={() =>
                  navigate("/health-summary")
                }
              >
                <span className="action-icon">
                  ❤️
                </span>

                <span>
                  <strong>
                    Health Summary
                  </strong>

                  <small>
                    View your AI health summary
                  </small>
                </span>

              </button>


              <button
                className="action-card"
                onClick={handleLogout}
              >
                <span className="action-icon">
                  🚪
                </span>

                <span>
                  <strong>
                    Logout
                  </strong>

                  <small>
                    Sign out of your account
                  </small>
                </span>

              </button>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default PatientDashboard;