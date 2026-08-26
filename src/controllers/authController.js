const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");

// ===============================
// REGISTER USER
// ===============================
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required"
            });
        }

        if (!["patient", "doctor"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be patient or doctor"
            });
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `${role === "patient" ? "PAT" : "DOC"}-${crypto.randomUUID()}`;

        const client = await pool.connect();
        let result;

        try {
            await client.query("BEGIN");
            result = await client.query(
                `INSERT INTO users (user_id, name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, user_id, name, email, role`,
                [userId, name, email, hashedPassword, role]
            );

            if (role === "patient") {
                await client.query(
                    "INSERT INTO patients (user_id) VALUES ($1)",
                    [result.rows[0].id]
                );
            } else {
                await client.query(
                    "INSERT INTO doctors (user_id) VALUES ($1)",
                    [result.rows[0].id]
                );
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }

        const user = result.rows[0];

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user
        });

    } catch (error) {
        console.error("Register Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ===============================
// LOGIN USER
// ===============================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                userId: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    register,
    login
};  