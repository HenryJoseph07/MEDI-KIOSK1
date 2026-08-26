import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import PatientCard from "../../components/PatientCard";
import { apiRequest } from "../../api/api";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          "/api/documents/patients"
        );

        setPatients(data.patients || []);

      } catch (error) {
        console.error("Failed to fetch patients:", error);
        setError(error.message || "Failed to load patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <>
      <Navbar
        userName={user.name || "Doctor"}
      />

      <div className="dashboard-layout">

        <Sidebar type="doctor" />

        <main className="main-content">

          <div className="page-header">
            <h1>Doctor Dashboard</h1>
            <p>
              Manage and review patient cases.
            </p>
          </div>

          <div className="stats-grid">

            <div className="card stat-card">
              <p>Total Patients</p>
              <h3>{patients.length}</h3>
            </div>

            <div className="card stat-card">
              <p>Today's Cases</p>
              <h3>12</h3>
            </div>

            <div className="card stat-card">
              <p>Pending Reviews</p>
              <h3>5</h3>
            </div>

          </div>

          <h2 style={{ marginBottom: "15px" }}>
            Patients
          </h2>

          {error && (
            <div className="doctor-login-error">
              {error}
            </div>
          )}

          <div className="documents-grid">

            {loading ? (
              <p>Loading patients...</p>
            ) : patients.length === 0 ? (
              <p>No registered patients found.</p>
            ) : (
              patients.map((patient) => (
                <PatientCard
                  key={patient.user_id}
                  patient={patient}
                />
              ))
            )}

          </div>

        </main>

      </div>
    </>
  );
}

export default DoctorDashboard;