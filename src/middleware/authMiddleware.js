const jwt = require("jsonwebtoken");

// ===============================
// VERIFY LOGIN
// ===============================
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store logged-in user information
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


// ===============================
// ONLY PATIENT
// ===============================
const patientOnly = (req, res, next) => {

    if (req.user.role !== "patient") {
        return res.status(403).json({
            success: false,
            message: "Patient access only"
        });
    }

    next();
};


// ===============================
// ONLY DOCTOR
// ===============================
const doctorOnly = (req, res, next) => {

    if (req.user.role !== "doctor") {
        return res.status(403).json({
            success: false,
            message: "Doctor access only"
        });
    }

    next();
};


module.exports = {
    protect,
    patientOnly,
    doctorOnly
};