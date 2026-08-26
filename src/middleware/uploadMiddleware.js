const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

// Allowed file types
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only PDF, JPG, JPEG and PNG files are allowed"),
            false
        );
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    }
});

module.exports = upload;