const express = require("express");

const {
    saveSummary,
    getMySummary,
    getPatientSummary
} = require("../controllers/summaryController");

const {
    protect,
    patientOnly,
    doctorOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// AI SERVICE → SAVE SUMMARY
// ==========================================

router.post(
    "/save",
    protect,
    patientOnly,
    saveSummary
);


// ==========================================
// PATIENT → VIEW OWN SUMMARY
// ==========================================

router.get(
    "/my-summary",
    protect,
    patientOnly,
    getMySummary
);


// ==========================================
// DOCTOR → VIEW PATIENT SUMMARY
// ==========================================

router.get(
    "/patient/:userId",
    protect,
    doctorOnly,
    getPatientSummary
);


module.exports = router;