const pool = require("../config/db");

// ==========================================
// SAVE / UPDATE AI GENERATED SUMMARY
// Called by the AI processing service
// ==========================================
const saveSummary = async (req, res) => {
    try {
        const {
            documentId,
            userId,
            summary,
            conditions,
            medications,
            allergies,
            keyFindings,
            recommendations
        } = req.body;

        if (!documentId || !userId || !summary) {
            return res.status(400).json({
                success: false,
                message: "documentId, userId and summary are required"
            });
        }

        // Verify that document belongs to this patient
        const documentCheck = await pool.query(
            `SELECT id
             FROM documents
             WHERE id = $1
             AND user_id = $2`,
            [documentId, userId]
        );

        if (documentCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Document not found for this patient"
            });
        }

        // Insert summary
        const result = await pool.query(
            `INSERT INTO health_summaries
            (
                user_id,
                document_id,
                summary,
                conditions,
                medications,
                allergies,
                key_findings,
                recommendations
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING
                id,
                user_id,
                document_id,
                summary,
                conditions,
                medications,
                allergies,
                key_findings,
                recommendations,
                created_at`,
            [
                userId,
                documentId,
                summary,
                conditions || [],
                medications || [],
                allergies || [],
                keyFindings || [],
                recommendations || []
            ]
        );

        // Mark document as processed
        await pool.query(
            `UPDATE documents
             SET processing_status = 'completed'
             WHERE id = $1`,
            [documentId]
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
            `SELECT
                id,
                document_id,
                summary,
                conditions,
                medications,
                allergies,
                key_findings,
                recommendations,
                created_at
             FROM health_summaries
             WHERE user_id = $1
             ORDER BY created_at DESC`,
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

        // Verify patient exists
        const patient = await pool.query(
            `SELECT id, name, email
             FROM users
             WHERE id = $1
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
        const result = await pool.query(
            `SELECT
                id,
                summary,
                conditions,
                medications,
                allergies,
                key_findings,
                recommendations,
                created_at
             FROM health_summaries
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,

            patient: {
                id: patient.rows[0].id,
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