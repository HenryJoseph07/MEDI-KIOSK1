const pool = require("../config/db");
const { findPatient } = require("./patientApiController");

const verifyDoctor = async (req, res) => {
    const result = await pool.query(
        "SELECT id FROM users WHERE user_id = $1 AND role = 'doctor'",
        [req.params.doctorId]
    );
    if (!result.rows.length) {
        res.status(404).json({ success: false, message: "Doctor not found" });
        return null;
    }
    if (req.user.role !== "doctor" || req.user.userId !== result.rows[0].id) {
        res.status(403).json({ success: false, message: "Access denied" });
        return null;
    }
    return result.rows[0];
};

const getPatients = async (req, res) => {
    try {
        if (!await verifyDoctor(req, res)) return;
        const result = await pool.query(
            `SELECT u.user_id AS "patientId", u.name, u.phone AS mobile,
                    p.age, p.gender, p.language
             FROM patients p JOIN users u ON u.id = p.user_id
             ORDER BY u.name`
        );
        res.json({ success: true, patients: result.rows });
    } catch (error) {
        console.error("Get Doctor Patients Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch patients" });
    }
};

const getPatientDetails = async (req, res) => {
    try {
        if (!await verifyDoctor(req, res)) return;
        const patient = await findPatient(req.params.patientId);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
        const summary = await pool.query("SELECT * FROM medical_summaries WHERE patient_id = $1", [patient.id]);
        const documents = await pool.query(
            `SELECT document_id AS "documentId", original_file_name AS "fileName",
                    document_type AS "documentType", description,
                    uploaded_at AS "uploadedAt", processing_status AS status
             FROM documents WHERE patient_id = $1 ORDER BY uploaded_at DESC`,
            [patient.id]
        );
        res.json({ success: true, patient: {
            patientId: patient.patient_id, name: patient.name, age: patient.age,
            gender: patient.gender, mobile: patient.phone, language: patient.language,
            healthSummary: summary.rows[0] || null, documents: documents.rows
        }});
    } catch (error) {
        console.error("Get Doctor Patient Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch patient details" });
    }
};

module.exports = { getPatients, getPatientDetails };
