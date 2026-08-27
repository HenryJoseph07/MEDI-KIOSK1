function HealthSummary({ summary = {} }) {

  // Safely get lab results
  const labResults = Array.isArray(summary?.labResults)
    ? summary.labResults
    : [];

  // Return CSS class based on flag
  const getFlagClass = (flag) => {
    const value = String(flag || "").toLowerCase();

    if (value === "high") return "lab-flag high";
    if (value === "low") return "lab-flag low";
    if (value === "normal") return "lab-flag normal";

    return "lab-flag";
  };

  return (
    <div className="card health-summary">

      {/* =========================
          HEADER
      ========================= */}
      <h2>
        🩺 AI Health Summary
      </h2>


      {/* =========================
          SYMPTOMS
      ========================= */}
      <div className="summary-section">

        <h3>Symptoms</h3>

        <p className="summary-text">
          {summary?.symptoms || "No symptoms available"}
        </p>

      </div>


      {/* =========================
          DIAGNOSIS
      ========================= */}
      <div className="summary-section">

        <h3>Diagnosis</h3>

        <p className="summary-text">
          {summary?.diagnosis || "No diagnosis available"}
        </p>

      </div>


      {/* =========================
          MEDICATIONS
      ========================= */}
      <div className="summary-section">

        <h3>Medications</h3>

        <p className="summary-text">
          {summary?.medications ||
            "No medication information available"}
        </p>

      </div>


      {/* =========================
          LAB RESULTS
      ========================= */}
      <div className="summary-section">

        <h3>Lab Results</h3>

        {labResults.length === 0 ? (

          <p className="summary-text">
            No laboratory results available
          </p>

        ) : (

          <div className="lab-results-container">

            {labResults.map((lab, index) => {

              /*
                Each lab result is expected to look like:

                {
                  test: "WBC",
                  value: "6.10",
                  unit: "10³/mm³",
                  flag: "NORMAL",
                  reference_range: "4.0 - 11.0"
                }
              */

              // Safety: prevent React from trying to render
              // an object directly.
              if (!lab || typeof lab !== "object") {
                return (
                  <div
                    key={index}
                    className="lab-result-row"
                  >
                    <span className="lab-test">
                      Unknown Test
                    </span>

                    <span className="lab-value">
                      {String(lab)}
                    </span>
                  </div>
                );
              }

              const test =
                lab.test ||
                lab.name ||
                lab.parameter ||
                "Unknown Test";

              const value =
                lab.value !== undefined &&
                lab.value !== null
                  ? lab.value
                  : "-";

              const unit =
                lab.unit || "";

              const flag =
                lab.flag || "";

              const referenceRange =
                lab.reference_range ||
                lab.referenceRange ||
                "";

              return (

                <div
                  className="lab-result-row"
                  key={index}
                >

                  {/* TEST NAME */}
                  <div className="lab-test-info">

                    <span className="lab-test">
                      {test}
                    </span>

                    {referenceRange && (
                      <span className="lab-reference">
                        Reference: {referenceRange}
                      </span>
                    )}

                  </div>


                  {/* VALUE + UNIT */}
                  <div className="lab-value-container">

                    <span className="lab-value">
                      {value}
                    </span>

                    {unit && (
                      <span className="lab-unit">
                        {unit}
                      </span>
                    )}

                  </div>


                  {/* FLAG */}
                  {flag && (

                    <span className={getFlagClass(flag)}>
                      {String(flag).toUpperCase()}
                    </span>

                  )}

                </div>

              );
            })}

          </div>

        )}

      </div>


      {/* =========================
          LEGEND
      ========================= */}
      {labResults.length > 0 && (

        <div className="lab-legend">

          <span className="legend-title">
            Status:
          </span>

          <span className="lab-flag normal">
            NORMAL
          </span>

          <span className="lab-flag high">
            HIGH
          </span>

          <span className="lab-flag low">
            LOW
          </span>

        </div>

      )}

    </div>
  );
}

export default HealthSummary;