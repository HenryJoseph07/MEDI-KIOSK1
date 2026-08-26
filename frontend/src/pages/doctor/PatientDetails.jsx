import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import HealthSummary from "../../components/HealthSummary";
import MedicalTimeline from "../../components/MedicalTimeline";
import DocumentCard from "../../components/DocumentCard";

const summary = {
  symptoms: "Fever, headache and weakness",
  diagnosis: "Viral infection suspected",
  medications: "Paracetamol 500 mg",
  labResults: "Hemoglobin: 11.2 g/dL"
};

const events = [
  {
    date: "25 Aug 2026",
    title: "Doctor Consultation",
    description: "Patient reported fever."
  },
  {
    date: "20 Aug 2026",
    title: "Blood Test",
    description: "Blood report uploaded."
  }
];

const document = {
  name: "Blood_Report.pdf",
  type: "Laboratory Report",
  date: "25 Aug 2026"
};

function PatientDetails() {
  const { id } = useParams();

  return (
    <>
      <Navbar userName="Dr. Anil" />

      <div className="dashboard-layout">
        <Sidebar type="doctor" />

        <main className="main-content">
          <div className="page-header">
            <h1>Patient Details</h1>
            <p>Patient ID: {id}</p>
          </div>

          <div className="card" style={{ marginBottom: "25px" }}>
            <h2>👤 Ravi Kumar</h2>
            <p style={{ marginTop: "8px" }}>
              Age: 35 | Gender: Male
            </p>
          </div>

          <HealthSummary summary={summary} />

          <div style={{ marginTop: "25px" }}>
            <h2 style={{ marginBottom: "15px" }}>
              Medical Documents
            </h2>

            <DocumentCard document={document} />
          </div>

          <div style={{ marginTop: "25px" }}>
            <MedicalTimeline events={events} />
          </div>
        </main>
      </div>
    </>
  );
}

export default PatientDetails;