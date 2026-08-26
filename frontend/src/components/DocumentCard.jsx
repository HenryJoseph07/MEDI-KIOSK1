function DocumentCard({ document }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3>📄 {document.name}</h3>

          <p style={{ color: "#718096", marginTop: "8px" }}>
            {document.type}
          </p>

          <p style={{ color: "#718096", marginTop: "5px" }}>
            Uploaded: {document.date}
          </p>
        </div>

        <span>⋮</span>
      </div>

      <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
        <button className="secondary-btn">
          View
        </button>

        <button className="primary-btn">
          Download
        </button>
      </div>
    </div>
  );
}

export default DocumentCard;