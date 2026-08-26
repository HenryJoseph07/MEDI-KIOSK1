const pool = require("../config/db");
const fs = require("fs");
const { processDocument } = require("../services/aiService");

// ===============================
// UPLOAD DOCUMENT
// ===============================
const uploadDocument = async (req, res) => {
    try {
        // Only authenticated patient can reach here
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document"
            });
        }

        const {
            documentType,
            documentName
        } = req.body;

        // Allowed document types
        const allowedTypes = [
            "prescription",
            "lab_report",
            "health_report",
            "medical_report",
            "other"
        ];

        if (documentType && !allowedTypes.includes(documentType)) {
            // Delete uploaded file if type is invalid
            fs.unlink(req.file.path, () => {});

            return res.status(400).json({
                success: false,
                message: "Invalid document type"
            });
        }

        const patientResult = await pool.query(
            "SELECT id FROM patients WHERE user_id = $1",
            [userId]
        );

        if (patientResult.rows.length === 0) {
            fs.unlink(req.file.path, () => {});
            return res.status(404).json({
                success: false,
                message: "Patient profile not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO documents
            (
                patient_id,
                original_file_name,
                document_type,
                file_path,
                mime_type,
                processing_status
            )
            VALUES ($1, $2, $3, $4, $5, 'processing')
            RETURNING id,
                      patient_id,
                      original_file_name,
                      document_type,
                      processing_status,
                      uploaded_at`,
            [
                patientResult.rows[0].id,
                documentName || req.file.originalname,
                documentType || "other",
                req.file.path,
                req.file.mimetype
            ]
        );

        const document = result.rows[0];
        let aiResult;

        try {
            aiResult = await processDocument(req.file);
        } catch (error) {
            await pool.query(
                "UPDATE documents SET processing_status = 'failed' WHERE id = $1",
                [document.id]
            );
            return res.status(502).json({
                success: false,
                message: "Document uploaded but AI processing failed",
                documentId: document.id
            });
        }

        const summaryText = aiResult.summary || aiResult.raw_text_preview || "AI summary generated";
        await pool.query(
            `INSERT INTO medical_summaries
                (patient_id, conditions, medications, lab_findings, summary)
             VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5)
             ON CONFLICT (patient_id) DO UPDATE SET
                conditions = EXCLUDED.conditions,
                medications = EXCLUDED.medications,
                lab_findings = EXCLUDED.lab_findings,
                summary = EXCLUDED.summary,
                updated_at = CURRENT_TIMESTAMP`,
            [
                patientResult.rows[0].id,
                JSON.stringify(aiResult.diagnoses || aiResult.conditions || []),
                JSON.stringify(aiResult.medicines || aiResult.medications || []),
                JSON.stringify(aiResult.lab_values || aiResult.lab_findings || []),
                summaryText
            ]
        );

        await pool.query(
            "UPDATE documents SET processing_status = 'completed' WHERE id = $1",
            [document.id]
        );

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document: {
                id: document.id,
                patientId: document.patient_id,
                name: document.original_file_name,
                type: document.document_type,
                status: "completed",
                createdAt: document.uploaded_at,
                ai: aiResult
            }
        });

    } catch (error) {
        console.error("Upload Document Error:", error);

        // Remove file if database insertion fails
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }

        res.status(500).json({
            success: false,
            message: "Failed to upload document"
        });
    }
};


// ===============================
// GET MY DOCUMENTS
// PATIENT ONLY
// ===============================
const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                id,
                     original_file_name,
                document_type,
                processing_status,
                     uploaded_at
                 FROM documents d
                 JOIN patients p ON p.id = d.patient_id
                 WHERE p.user_id = $1
                 ORDER BY uploaded_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            documents: result.rows
        });

    } catch (error) {
        console.error("Get Documents Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch documents"
        });
    }
};


module.exports = {
    uploadDocument,
    getMyDocuments
};