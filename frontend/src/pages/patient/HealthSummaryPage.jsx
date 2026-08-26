import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api/api";
import "./HealthSummaryPage.css";

function HealthSummaryPage() {
    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const data = await apiRequest(
                "/api/summaries/my-summary"
            );

            console.log("Health Summary API:", data);

            const latestSummary =
                data.summaries?.[0] || null;

            setSummary(latestSummary);

        } catch (error) {
            console.error(
                "Health Summary Error:",
                error
            );

            alert(error.message);
        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // SAFELY CONVERT AI DATA TO TEXT
    // ==========================================

    const formatItem = (item) => {

        if (item === null || item === undefined) {
            return "N/A";
        }

        // Already a string/number
        if (
            typeof item === "string" ||
            typeof item === "number"
        ) {
            return String(item);
        }

        // Object returned by AI
        if (typeof item === "object") {

            // Medicine
            if (item.name) {
                let text = item.name;

                if (item.dosage) {
                    text += ` — ${item.dosage}`;
                }

                if (item.frequency) {
                    text += ` — ${item.frequency}`;
                }

                if (item.duration) {
                    text += ` — ${item.duration}`;
                }

                return text;
            }

            // Lab finding
            if (item.test) {
                let text = item.test;

                if (
                    item.value !== undefined &&
                    item.value !== null
                ) {
                    text += `: ${item.value}`;
                }

                if (item.unit) {
                    text += ` ${item.unit}`;
                }

                return text;
            }

            // Generic object
            return Object.entries(item)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" — ");
        }

        return String(item);
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="health-summary-page">
                <div className="summary-container">
                    <div className="summary-loading">
                        <div className="loading-spinner"></div>
                        <h2>Loading Health Summary...</h2>
                        <p>
                            Please wait while we retrieve
                            your medical information.
                        </p>
                    </div>
                </div>
            </div>
        );
    }


    // ==========================================
    // NO SUMMARY
    // ==========================================

    if (!summary) {
        return (
            <div className="health-summary-page">

                <div className="summary-container">

                    <div className="summary-header">
                        <div>
                            <h1>Health Summary</h1>
                            <p>
                                Your AI-generated medical summary
                            </p>
                        </div>
                    </div>

                    <div className="empty-summary-card">

                        <div className="empty-icon">
                            🩺
                        </div>

                        <h2>
                            No Health Summary Available
                        </h2>

                        <p>
                            Upload a medical document to generate
                            your AI-powered health summary.
                        </p>

                        <div className="summary-actions">

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        "/upload-document"
                                    )
                                }
                            >
                                + Upload Medical Document
                            </button>

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/patient-dashboard"
                                    )
                                }
                            >
                                Back to Dashboard
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // NORMALIZE JSONB VALUES
    // ==========================================

    const conditions =
        Array.isArray(summary.conditions)
            ? summary.conditions
            : [];

    const medications =
        Array.isArray(summary.medications)
            ? summary.medications
            : [];

    const allergies =
        Array.isArray(summary.allergies)
            ? summary.allergies
            : [];

    const labFindings =
        Array.isArray(summary.lab_findings)
            ? summary.lab_findings
            : [];

    const previousHistory =
        Array.isArray(summary.previous_history)
            ? summary.previous_history
            : [];


    // ==========================================
    // DISPLAY SUMMARY
    // ==========================================

    return (
        <div className="health-summary-page">

            <div className="summary-container">

                {/* HEADER */}

                <div className="summary-header">

                    <div>

                        <div className="summary-breadcrumb">
                            Patient Portal / Health Summary
                        </div>

                        <h1>
                            Health Summary
                        </h1>

                        <p>
                            Your AI-generated medical information
                        </p>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/patient-dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>

                </div>


                {/* AI SUMMARY */}

                <section className="summary-main-card">

                    <div className="card-title">

                        <div className="card-icon">
                            🧠
                        </div>

                        <div>
                            <h2>AI Health Summary</h2>
                            <p>
                                Overview generated from your
                                uploaded medical documents
                            </p>
                        </div>

                    </div>

                    <div className="summary-text">
                        {summary.summary ||
                            "No summary information available."}
                    </div>

                </section>


                {/* CONDITIONS */}

                <section className="summary-card">

                    <div className="card-title">

                        <div className="card-icon">
                            🩺
                        </div>

                        <h2>Conditions & Diagnoses</h2>

                    </div>

                    {conditions.length > 0 ? (

                        <div className="item-list">

                            {conditions.map(
                                (condition, index) => (

                                    <div
                                        className="summary-item"
                                        key={index}
                                    >
                                        <span className="item-bullet">
                                            ✓
                                        </span>

                                        <span>
                                            {formatItem(condition)}
                                        </span>
                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="empty-text">
                            No conditions recorded.
                        </p>

                    )}

                </section>


                {/* MEDICATIONS */}

                <section className="summary-card">

                    <div className="card-title">

                        <div className="card-icon">
                            💊
                        </div>

                        <h2>Medications</h2>

                    </div>

                    {medications.length > 0 ? (

                        <div className="item-list">

                            {medications.map(
                                (medicine, index) => (

                                    <div
                                        className="summary-item"
                                        key={index}
                                    >
                                        <span className="item-bullet">
                                            💊
                                        </span>

                                        <span>
                                            {formatItem(medicine)}
                                        </span>
                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="empty-text">
                            No medications recorded.
                        </p>

                    )}

                </section>


                {/* ALLERGIES */}

                <section className="summary-card">

                    <div className="card-title">

                        <div className="card-icon">
                            ⚠️
                        </div>

                        <h2>Allergies</h2>

                    </div>

                    {allergies.length > 0 ? (

                        <div className="item-list">

                            {allergies.map(
                                (allergy, index) => (

                                    <div
                                        className="summary-item"
                                        key={index}
                                    >
                                        <span className="item-bullet">
                                            !
                                        </span>

                                        <span>
                                            {formatItem(allergy)}
                                        </span>
                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="empty-text">
                            No allergies recorded.
                        </p>

                    )}

                </section>


                {/* LAB FINDINGS */}

                <section className="summary-card">

                    <div className="card-title">

                        <div className="card-icon">
                            🧪
                        </div>

                        <h2>Laboratory Findings</h2>

                    </div>

                    {labFindings.length > 0 ? (

                        <div className="item-list">

                            {labFindings.map(
                                (finding, index) => (

                                    <div
                                        className="summary-item"
                                        key={index}
                                    >
                                        <span className="item-bullet">
                                            •
                                        </span>

                                        <span>
                                            {formatItem(finding)}
                                        </span>
                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="empty-text">
                            No laboratory findings recorded.
                        </p>

                    )}

                </section>


                {/* PREVIOUS HISTORY */}

                <section className="summary-card">

                    <div className="card-title">

                        <div className="card-icon">
                            📋
                        </div>

                        <h2>Previous Medical History</h2>

                    </div>

                    {previousHistory.length > 0 ? (

                        <div className="item-list">

                            {previousHistory.map(
                                (history, index) => (

                                    <div
                                        className="summary-item"
                                        key={index}
                                    >
                                        <span className="item-bullet">
                                            •
                                        </span>

                                        <span>
                                            {formatItem(history)}
                                        </span>
                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="empty-text">
                            No previous medical history recorded.
                        </p>

                    )}

                </section>


                {/* FOOTER */}

                <div className="summary-footer">

                    <p>
                        This summary is generated from your
                        uploaded medical documents.
                    </p>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/patient-dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </div>

        </div>
    );
}

export default HealthSummaryPage;