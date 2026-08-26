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
            fs.unlink(req.file.path, () => {});

            return res.status(400).json({
                success: false,
                message: "Invalid document type"
            });
        }

        // Find patient
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

        // Store uploaded document
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

        // ===============================
        // SEND DOCUMENT TO AI PIPELINE
        // ===============================
        try {
            aiResult = await processDocument(req.file);
        } catch (error) {
            console.error(
                "AI Processing Error:",
                error.response?.data || error.message
            );

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

        // Flask response format:
        //
        // {
        //   "ok": true,
        //   "data": {
        //      "document_type": ...,
        //      "patient_details": ...,
        //      "diagnoses": ...,
        //      "medicines": ...,
        //      "lab_values": ...
        //   }
        // }
        //
        // Extract the actual AI data.
        const aiData = aiResult.data || aiResult;

        // ===============================
        // CREATE FRONTEND-FRIENDLY SUMMARY
        // ===============================
        const patient = aiData.patient_details || {};

        const diagnosisText =
            Array.isArray(aiData.diagnoses) &&
            aiData.diagnoses.length > 0
                ? aiData.diagnoses.join(", ")
                : "No diagnosis available";

        let medicineText = "No medicines recorded";

        if (
            Array.isArray(aiData.medicines) &&
            aiData.medicines.length > 0
        ) {
            medicineText = aiData.medicines
                .map((medicine) => {
                    const name = medicine.name || "Unknown medicine";

                    const dosage = medicine.dosage
                        ? `, ${medicine.dosage}`
                        : "";

                    const frequency = medicine.frequency
                        ? `, ${medicine.frequency}`
                        : "";

                    const duration = medicine.duration
                        ? `, ${medicine.duration}`
                        : "";

                    return `${name}${dosage}${frequency}${duration}`;
                })
                .join("; ");
        }

        let labText = "No laboratory values recorded";

        if (
            Array.isArray(aiData.lab_values) &&
            aiData.lab_values.length > 0
        ) {
            labText = aiData.lab_values
                .map((lab) => {
                    const test = lab.test || "Unknown test";
                    const value =
                        lab.value !== null &&
                        lab.value !== undefined
                            ? lab.value
                            : "N/A";
                    const unit = lab.unit
                        ? ` ${lab.unit}`
                        : "";

                    return `${test}: ${value}${unit}`;
                })
                .join("; ");
        }

        const summaryText =
            `Patient: ${patient.name || "Unknown"}\n` +
            `Age/Sex: ${patient.age || "N/A"} / ${patient.sex || "N/A"}\n` +
            `Date: ${aiData.date || "N/A"}\n` +
            `Diagnosis: ${diagnosisText}\n` +
            `Medicines: ${medicineText}\n` +
            `Lab Findings: ${labText}`;

        // ===============================
        // SAVE AI DATA TO DATABASE
        // ===============================
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

                JSON.stringify(
                    aiData.diagnoses ||
                    aiData.conditions ||
                    []
                ),

                JSON.stringify(
                    aiData.medicines ||
                    aiData.medications ||
                    []
                ),

                JSON.stringify(
                    aiData.lab_values ||
                    aiData.lab_findings ||
                    []
                ),

                summaryText
            ]
        );

        // Mark document as completed
        await pool.query(
            "UPDATE documents SET processing_status = 'completed' WHERE id = $1",
            [document.id]
        );

        // ===============================
        // RESPONSE TO FRONTEND
        // ===============================
        return res.status(201).json({
            success: true,
            message: "Document uploaded and processed successfully",

            document: {
                id: document.id,
                patientId: document.patient_id,
                name: document.original_file_name,
                type: document.document_type,
                status: "completed",
                createdAt: document.uploaded_at,

                ai: aiData,

                summary: summaryText
            }
        });

    } catch (error) {
        console.error("Upload Document Error:", error);

        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }

        return res.status(500).json({
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

        return res.json({
            success: true,
            documents: result.rows
        });

    } catch (error) {
        console.error("Get Documents Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch documents"
        });
    }
};


module.exports = {
    uploadDocument,
    getMyDocuments
};