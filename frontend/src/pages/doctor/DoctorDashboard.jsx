import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import PatientCard from "../../components/PatientCard";

const patients = [
  {
    id: "MKP10025",
    name: "Manaswini",
    age: 20,
    gender: "Female"
  },
  {
    id: "MKP10026",
    name: "Dedeepya",
    age: 21,
    gender: "Female"
  }
];

function DoctorDashboard() {
  return (
    <>
      <Navbar userName="Dr. Anil" />

      <div className="dashboard-layout">
        <Sidebar type="doctor" />

        <main className="main-content">
          <div className="page-header">
            <h1>Doctor Dashboard</h1>
            <p>Manage and review patient cases.</p>
          </div>

          <div className="stats-grid">
            <div className="card stat-card">
              <p>Total Patients</p>
              <h3>125</h3>
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
            Recent Patients
          </h2>

          <div className="documents-grid">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export default DoctorDashboard;