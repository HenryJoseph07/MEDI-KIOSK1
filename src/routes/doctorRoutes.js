const express = require("express");
const { doctorRegister, doctorLogin } = require("../controllers/frontendAuthController");
const { getPatients, getPatientDetails } = require("../controllers/doctorApiController");
const { protect, doctorOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", doctorRegister);
router.post("/login", doctorLogin);
router.get("/:doctorId/patients", protect, doctorOnly, getPatients);
router.get("/:doctorId/patients/:patientId", protect, doctorOnly, getPatientDetails);

module.exports = router;