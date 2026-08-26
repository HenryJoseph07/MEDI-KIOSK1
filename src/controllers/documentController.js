const pool = require("../config/db");
const fs = require("fs");

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

        // Save document information in database
        const result = await pool.query(
            `INSERT INTO documents
            (
                user_id,
                document_name,
                document_type,
                file_path,
                mime_type,
                processing_status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id,
                      user_id,
                      document_name,
                      document_type,
                      processing_status,
                      created_at`,
            [
                userId,
                documentName || req.file.originalname,
                documentType || "other",
                req.file.path,
                req.file.mimetype,
                "pending"
            ]
        );

        const document = result.rows[0];

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document: {
                id: document.id,
                userId: document.user_id,
                name: document.document_name,
                type: document.document_type,
                status: document.processing_status,
                createdAt: document.created_at
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
                document_name,
                document_type,
                processing_status,
                created_at
             FROM documents
             WHERE user_id = $1
             ORDER BY created_at DESC`,
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