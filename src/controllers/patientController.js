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
// GET PATIENT BY USER ID
// DOCTOR ONLY
// ===============================
const getPatientById = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT
                id,
                name,
                email,
                role,
                created_at
             FROM users
             WHERE id = $1
             AND role = 'patient'`,
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
        console.error("Get Patient Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch patient"
        });
    }
};


module.exports = {
    getMyProfile,
    getPatientById
};