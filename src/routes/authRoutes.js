const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const router = express.Router();

// Patient / Doctor registration
router.post("/register", register);

// Patient / Doctor login
router.post("/login", login);

module.exports = router;