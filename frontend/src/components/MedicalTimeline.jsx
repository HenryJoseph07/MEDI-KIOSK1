function MedicalTimeline({ events = [] }) {
  return (
    <div className="card">

      <h2>📅 Medical Timeline</h2>

      <div className="timeline">

        {events.length === 0 ? (

          <p style={{ marginTop: "20px", color: "#718096" }}>
            No medical events available.
          </p>

        ) : (

          events.map((event, index) => (

            <div
              className="timeline-item"
              key={index}
            >

              <div className="timeline-date">
                {event?.date || "Date unavailable"}
              </div>

              <h3 style={{ marginTop: "6px" }}>
                {event?.title || "Medical Event"}
              </h3>

              <p
                style={{
                  marginTop: "5px",
                  color: "#718096"
                }}
              >
                {event?.description ||
                  "No description available"}
              </p>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default MedicalTimeline;