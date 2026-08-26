const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// ROUTES
// ===============================

const authRoutes = require("./src/routes/authRoutes");
const patientRoutes = require("./src/routes/patientRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const summaryRoutes = require("./src/routes/summaryRoutes");


// Authentication
app.use("/api/auth", authRoutes);

// Patient
app.use("/api/patients", patientRoutes);

// Documents
app.use("/api/documents", documentRoutes);

// Health summaries
app.use("/api/summaries", summaryRoutes);


// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SIH26047 Backend is running 🚀"
    });
});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 SIH26047 Backend Started");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("=================================");
});

