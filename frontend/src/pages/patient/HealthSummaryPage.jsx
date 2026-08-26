import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/api";

function HealthSummaryPage() {
  const navigate = useNavigate();

  const [summary, setSummary] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await apiRequest(
        "/api/summaries/my-summary"
      );

      const latestSummary =
        data.summaries?.[0] || null;

      setSummary(latestSummary);

    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading health summary...</h2>;
  }

  if (!summary) {
    return (
      <div>
        <h1>Health Summary</h1>

        <p>
          No health summary available yet.
        </p>

        <button
          onClick={() =>
            navigate("/patient-dashboard")
          }
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>

      <h1>Health Summary</h1>

      <section>
        <h2>Summary</h2>

        <p>
          {summary.summary}
        </p>
      </section>

      <section>
        <h2>Conditions</h2>

        {summary.conditions?.length > 0 ? (
          <ul>
            {summary.conditions.map(
              (condition, index) => (
                <li key={index}>
                  {condition}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>No conditions recorded.</p>
        )}
      </section>

      <section>
        <h2>Medications</h2>

        {summary.medications?.length > 0 ? (
          <ul>
            {summary.medications.map(
              (medicine, index) => (
                <li key={index}>
                  {medicine}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>No medications recorded.</p>
        )}
      </section>

      <section>
        <h2>Allergies</h2>

        {summary.allergies?.length > 0 ? (
          <ul>
            {summary.allergies.map(
              (allergy, index) => (
                <li key={index}>
                  {allergy}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>No allergies recorded.</p>
        )}
      </section>

      <section>
        <h2>Lab Findings</h2>

        {summary.lab_findings?.length > 0 ? (
          <ul>
            {summary.lab_findings.map(
              (finding, index) => (
                <li key={index}>
                  {finding}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>No lab findings recorded.</p>
        )}
      </section>

      <section>
        <h2>Previous History</h2>

        {summary.previous_history?.length > 0 ? (
          <ul>
            {summary.previous_history.map(
              (history, index) => (
                <li key={index}>
                  {history}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            No previous history recorded.
          </p>
        )}
      </section>

      <button
        onClick={() =>
          navigate("/patient-dashboard")
        }
      >
        Back to Dashboard
      </button>

    </div>
  );
}

export default HealthSummaryPage;