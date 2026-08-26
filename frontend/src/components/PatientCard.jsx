import { Link } from "react-router-dom";

function PatientCard({ patient }) {
  return (
    <div className="card">

      <h3>
        👤 {patient.name}
      </h3>

      <p style={{ marginTop: "8px" }}>
        Patient ID: {patient.user_id}
      </p>

      <p style={{ color: "#718096", marginTop: "5px" }}>
        Email: {patient.email}
      </p>

      <Link
        to={`/doctor/patient/${patient.user_id}`}
        className="primary-btn"
        style={{
          display: "inline-block",
          marginTop: "15px"
        }}
      >
        View Details
      </Link>

    </div>
  );
}

export default PatientCard;