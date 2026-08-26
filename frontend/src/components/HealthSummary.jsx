function HealthSummary({ summary = {} }) {
  return (
    <div className="card">

      <h2>🩺 AI Health Summary</h2>

      <div style={{ marginTop: "20px" }}>
        <h3>Symptoms</h3>

        <p style={{ marginTop: "8px", color: "#718096" }}>
          {summary?.symptoms || "No symptoms available"}
        </p>
      </div>


      <div style={{ marginTop: "20px" }}>
        <h3>Diagnosis</h3>

        <p style={{ marginTop: "8px", color: "#718096" }}>
          {summary?.diagnosis || "No diagnosis available"}
        </p>
      </div>


      <div style={{ marginTop: "20px" }}>
        <h3>Medications</h3>

        <p style={{ marginTop: "8px", color: "#718096" }}>
          {summary?.medications || "No medication information available"}
        </p>
      </div>


      <div style={{ marginTop: "20px" }}>
        <h3>Lab Results</h3>

        <p style={{ marginTop: "8px", color: "#718096" }}>
          {summary?.labResults || "No laboratory results available"}
        </p>
      </div>

    </div>
  );
}

export default HealthSummary;