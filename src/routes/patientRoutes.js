const express = require("express");

const {
    getMyProfile,
    getPatientById,
    getAllPatients
} = require("../controllers/patientController");

const {
    protect,
    patientOnly,
    doctorOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// Patient can see their own profile
router.get(
    "/me",
    protect,
    patientOnly,
    getMyProfile
);
// Doctor can see all patients
router.get(
    "/",
    protect,
    doctorOnly,
    getAllPatients
);
// Doctor can find a patient using User ID
router.get(
    "/:userId",
    protect,
    doctorOnly,
    getPatientById
);

module.exports = router;