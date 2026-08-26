const express = require("express");

const {
    uploadDocument,
    getMyDocuments,
    getPatientDocuments,
    getPatients
} = require("../controllers/documentController");
const {
    protect,
    patientOnly,
    doctorOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/upload",
    protect,
    patientOnly,
    upload.single("document"),
    uploadDocument
);

router.get(
    "/my-documents",
    protect,
    patientOnly,
    getMyDocuments
);

router.get(
    "/patients",
    protect,
    doctorOnly,
    getPatients
);

router.get(
    "/patient/:userId",
    protect,
    doctorOnly,
    getPatientDocuments
);
module.exports = router;