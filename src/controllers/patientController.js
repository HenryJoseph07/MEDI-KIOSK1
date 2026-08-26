const pool = require("../config/db");

// ===============================
// GET MY PROFILE
// ===============================
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                id,
                user_id,
                name,
                email,
                role,
                created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            patient: result.rows[0]
        });

    } catch (error) {
        console.error("Get Patient Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient profile"
        });
    }
};

// ===============================
// GET ALL PATIENTS
// DOCTOR ONLY
// ===============================
const getAllPatients = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                u.id,
                u.user_id,
                u.name,
                u.email,
                u.created_at
             FROM users u
             WHERE u.role = 'patient'
             ORDER BY u.created_at DESC`
        );

        res.json({
            success: true,
            patients: result.rows
        });

    } catch (error) {
        console.error("Get All Patients Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patients"
        });
    }
};
// ===============================
// GET PATIENT BY USER ID
// DOCTOR ONLY
// ===============================
const getPatientById = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT
                u.id,
                u.user_id,
                u.name,
                u.email,
                u.role,
                p.id AS patient_id,
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.abha_id,
                p.address,
                p.emergency_contact,
                p.created_at
             FROM users u
             JOIN patients p
                ON p.user_id = u.id
             WHERE u.user_id = $1
               AND u.role = 'patient'`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.json({
            success: true,
            patient: result.rows[0]
        });

    } catch (error) {
        console.error("Get Patient By ID Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });
    }
};

module.exports = {
    getMyProfile,
    getPatientById,
    getAllPatients
};