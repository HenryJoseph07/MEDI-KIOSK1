const pool = require("../config/db");

const findPatient = async (patientId) => {
    const result = await pool.query(
        `SELECT p.id, u.id AS user_id, u.user_id AS patient_id, u.name, u.email, u.phone,
                p.age, p.gender, p.language
         FROM patients p JOIN users u ON u.id = p.user_id
         WHERE u.user_id = $1 AND u.role = 'patient'`,
        [patientId]
    );
    return result.rows[0];
};

const ensureAccess = async (req, res) => {
    const patient = await findPatient(req.params.patientId);
    if (!patient) {
        res.status(404).json({ success: false, message: "Patient not found" });
        return null;
    }
    if (req.user.role === "patient" && patient.user_id !== req.user.userId) {
        res.status(403).json({ success: false, message: "Access denied" });
        return null;
    }
    return patient;
};

const getPatient = async (req, res) => {
    try {
        const patient = await ensureAccess(req, res);
        if (!patient) return;
        res.json({ success: true, patient: {
            patientId: patient.patient_id, name: patient.name, age: patient.age,
            gender: patient.gender, mobile: patient.phone, language: patient.language,
            email: patient.email
        }});
    } catch (error) {
        console.error("Get Patient Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch patient" });
    }
};

const getDocuments = async (req, res) => {
    try {
        const patient = await ensureAccess(req, res);
        if (!patient) return;
        const result = await pool.query(
            `SELECT document_id AS "documentId", $2 AS "patientId", original_file_name AS "fileName",
                    document_type AS "documentType", description, uploaded_at AS "uploadedAt",
                    processing_status AS status
             FROM documents WHERE patient_id = $1 ORDER BY uploaded_at DESC`,
            [patient.id, patient.patient_id]
        );
        res.json({ success: true, documents: result.rows });
    } catch (error) {
        console.error("Get Documents Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch documents" });
    }
};

const getHealthSummary = async (req, res) => {
    try {
        const patient = await ensureAccess(req, res);
        if (!patient) return;
        const result = await pool.query("SELECT * FROM medical_summaries WHERE patient_id = $1", [patient.id]);
        const item = result.rows[0];
        res.json({ success: true, healthSummary: item ? {
            overview: item.overview || item.summary,
            conditions: item.conditions || [], medications: item.medications || [],
            allergies: item.allergies || [], recentFindings: item.recent_findings || item.lab_findings || [],
            recommendations: item.recommendations || [], generatedAt: item.generated_at
        } : null });
    } catch (error) {
        console.error("Get Health Summary Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch health summary" });
    }
};

const getTimeline = async (req, res) => {
    try {
        const patient = await ensureAccess(req, res);
        if (!patient) return;
        const result = await pool.query(
            `SELECT date, type, title, description, document_id AS "documentId"
             FROM medical_timeline WHERE patient_id = $1 ORDER BY date DESC`,
            [patient.id]
        );
        res.json({ success: true, timeline: result.rows });
    } catch (error) {
        console.error("Get Timeline Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch timeline" });
    }
};

module.exports = { findPatient, getPatient, getDocuments, getHealthSummary, getTimeline };
