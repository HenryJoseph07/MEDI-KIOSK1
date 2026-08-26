const pool = require("../config/db");

const saveSummary = async (req, res) => {
    try {
        const {
            summary,
            conditions,
            medications,
            allergies,
            labFindings,
            previousHistory
        } = req.body;

        if (!summary) {
            return res.status(400).json({
                success: false,
                message: "summary is required"
            });
        }

        const patient = await pool.query(
            "SELECT id FROM patients WHERE user_id = $1",
            [req.user.userId]
        );

        if (patient.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO medical_summaries
                (patient_id, conditions, medications, allergies, lab_findings, previous_history, summary)
             VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7)
             ON CONFLICT (patient_id) DO UPDATE SET
                conditions = EXCLUDED.conditions,
                medications = EXCLUDED.medications,
                allergies = EXCLUDED.allergies,
                lab_findings = EXCLUDED.lab_findings,
                previous_history = EXCLUDED.previous_history,
                summary = EXCLUDED.summary,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [
                patient.rows[0].id,
                JSON.stringify(conditions || []),
                JSON.stringify(medications || []),
                JSON.stringify(allergies || []),
                JSON.stringify(labFindings || []),
                JSON.stringify(previousHistory || []),
                summary
            ]
        );

        res.status(201).json({
            success: true,
            message: "Health summary saved successfully",
            summary: result.rows[0]
        });

    } catch (error) {
        console.error("Save Summary Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save health summary"
        });
    }
};


// ==========================================
// GET MY HEALTH SUMMARY
// PATIENT ONLY
// ==========================================
const getMySummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT ms.*
             FROM medical_summaries ms
             JOIN patients p ON p.id = ms.patient_id
             WHERE p.user_id = $1`,
            [userId]
        );

        res.json({
            success: true,
            summaries: result.rows
        });

    } catch (error) {
        console.error("Get My Summary Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch health summary"
        });
    }
};


// ==========================================
// DOCTOR GET PATIENT SUMMARY
// ==========================================
const getPatientSummary = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify patient exists using PAT-xxxxx user_id
        const patient = await pool.query(
            `SELECT id, user_id, name, email
             FROM users
             WHERE user_id = $1
             AND role = 'patient'`,
            [userId]
        );

        if (patient.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Get summaries
        // patients.user_id stores users.id (integer)
        const result = await pool.query(
            `SELECT ms.*
             FROM medical_summaries ms
             JOIN patients p ON p.id = ms.patient_id
             WHERE p.user_id = $1`,
            [patient.rows[0].id]
        );

        res.json({
            success: true,

            patient: {
                id: patient.rows[0].id,
                userId: patient.rows[0].user_id,
                name: patient.rows[0].name,
                email: patient.rows[0].email
            },

            summaries: result.rows
        });

    } catch (error) {
        console.error("Get Patient Summary Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient summary"
        });
    }
};


module.exports = {
    saveSummary,
    getMySummary,
    getPatientSummary
};