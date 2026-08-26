const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const tokenFor = (user) => jwt.sign(
    { userId: user.id, publicUserId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
);

const uniqueId = async (prefix) => {
    let value;
    do {
        value = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
        const result = await pool.query("SELECT 1 FROM users WHERE user_id = $1", [value]);
        if (!result.rows.length) return value;
    } while (true);
};

const patientRegister = async (req, res) => {
    try {
        const { name, age, gender, mobile, language, pin } = req.body;
        if (!name || !/^\d{4}$/.test(String(pin || ""))) {
            return res.status(400).json({ success: false, message: "name and a 4-digit pin are required" });
        }
        const userId = await uniqueId("MKP");
        const pinHash = await bcrypt.hash(String(pin), 10);
        const client = await pool.connect();
        let user;
        try {
            await client.query("BEGIN");
            const result = await client.query(
                `INSERT INTO users (user_id, name, email, phone, pin_hash, password_hash, role)
                 VALUES ($1, $2, NULL, $3, $4, $4, 'patient')
                 RETURNING id, user_id, name, phone, role`,
                [userId, name, mobile || null, pinHash]
            );
            user = result.rows[0];
            await client.query(
                "INSERT INTO patients (user_id, age, gender, language) VALUES ($1, $2, $3, $4)",
                [user.id, age || null, gender || null, language || null]
            );
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            token: tokenFor(user),
            patient: { patientId: user.user_id, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Patient Register Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const patientLogin = async (req, res) => {
    try {
        const { patientId, pin } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1 AND role = 'patient'", [patientId]);
        if (!result.rows.length || !result.rows[0].pin_hash || !(await bcrypt.compare(String(pin || ""), result.rows[0].pin_hash))) {
            return res.status(401).json({ success: false, message: "Invalid patient ID or PIN" });
        }
        const user = result.rows[0];
        res.json({ success: true, message: "Login successful", token: tokenFor(user), patient: { patientId: user.user_id, name: user.name, role: user.role } });
    } catch (error) {
        console.error("Patient Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const doctorRegister = async (req, res) => {
    try {
        const { name, email, password, specialization } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: "name, email and password are required" });
        const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
        if (existing.rows.length) return res.status(409).json({ success: false, message: "User already exists" });
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = await uniqueId("MKD");
        const client = await pool.connect();
        let user;
        try {
            await client.query("BEGIN");
            const result = await client.query(
                `INSERT INTO users (user_id, name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4, 'doctor')
                 RETURNING id, user_id, name, email, role`,
                [userId, name, email, passwordHash]
            );
            user = result.rows[0];
            await client.query("INSERT INTO doctors (user_id, specialization) VALUES ($1, $2)", [user.id, specialization || null]);
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
        res.status(201).json({ success: true, message: "Doctor registered successfully", token: tokenFor(user), doctor: { doctorId: user.user_id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Doctor Register Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'doctor'", [email]);
        if (!result.rows.length || !(await bcrypt.compare(password || "", result.rows[0].password_hash))) return res.status(401).json({ success: false, message: "Invalid email or password" });
        const user = result.rows[0];
        res.json({ success: true, message: "Login successful", token: tokenFor(user), doctor: { doctorId: user.user_id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Doctor Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { patientRegister, patientLogin, doctorRegister, doctorLogin };
