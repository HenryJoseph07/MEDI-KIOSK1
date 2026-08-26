const express = require("express");

const {
    getMyProfile,
    getPatientById
} = require("../controllers/patientController");
const { patientRegister, patientLogin } = require("../controllers/frontendAuthController");
const {
    getPatient,
    getDocuments,
    getHealthSummary,
    getTimeline
} = require("../controllers/patientApiController");
const { uploadDocument } = require("../controllers/documentController");
const upload = require("../middleware/uploadMiddleware");

const {
    protect,
    patientOnly,
    doctorOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", patientRegister);
router.post("/login", patientLogin);

// Patient can see their own profile
router.get(
    "/me",
    protect,
    patientOnly,
    getMyProfile
);

router.get("/:patientId/documents", protect, getDocuments);
router.post("/:patientId/documents", protect, patientOnly, upload.single("file"), uploadDocument);
router.get("/:patientId/health-summary", protect, getHealthSummary);
router.get("/:patientId/timeline", protect, getTimeline);
router.get("/:patientId", protect, getPatient);

// Doctor can find a patient using User ID
router.get(
    "/:userId",
    protect,
    doctorOnly,
    getPatientById
);

module.exports = router;