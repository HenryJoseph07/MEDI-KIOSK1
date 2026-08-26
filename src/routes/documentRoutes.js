const express = require("express");

const {
    uploadDocument,
    getMyDocuments
} = require("../controllers/documentController");

const {
    protect,
    patientOnly
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

module.exports = router;