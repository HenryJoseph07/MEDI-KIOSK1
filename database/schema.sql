-- ============================================
-- SIH26047 - Patient Case Taking System
-- Database Schema
-- ============================================

-- =========================
-- USERS TABLE
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    user_id VARCHAR(50) UNIQUE NOT NULL,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    phone VARCHAR(20),

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('patient', 'doctor')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- PATIENT PROFILE
-- =========================

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE NOT NULL,

    date_of_birth DATE,

    gender VARCHAR(20),

    blood_group VARCHAR(10),

    abha_id VARCHAR(100) UNIQUE,

    address TEXT,

    emergency_contact VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- DOCTOR PROFILE
-- =========================

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE NOT NULL,

    specialization VARCHAR(150),

    registration_number VARCHAR(100),

    hospital_name VARCHAR(200),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_doctor_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- MEDICAL DOCUMENTS
-- =========================

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,

    patient_id INTEGER NOT NULL,

    document_type VARCHAR(50) NOT NULL,

    original_file_name VARCHAR(255),

    file_path TEXT NOT NULL,

    mime_type VARCHAR(100),

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);


-- =========================
-- AI GENERATED SUMMARIES
-- =========================

CREATE TABLE IF NOT EXISTS medical_summaries (
    id SERIAL PRIMARY KEY,

    patient_id INTEGER UNIQUE NOT NULL,

    conditions JSONB DEFAULT '[]'::jsonb,

    medications JSONB DEFAULT '[]'::jsonb,

    allergies JSONB DEFAULT '[]'::jsonb,

    lab_findings JSONB DEFAULT '[]'::jsonb,

    previous_history JSONB DEFAULT '[]'::jsonb,

    summary TEXT,

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_summary_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);


-- =========================
-- INDEXES
-- =========================

CREATE INDEX IF NOT EXISTS idx_users_user_id
ON users(user_id);

CREATE INDEX IF NOT EXISTS idx_patients_abha_id
ON patients(abha_id);

CREATE INDEX IF NOT EXISTS idx_documents_patient_id
ON documents(patient_id);

CREATE INDEX IF NOT EXISTS idx_summaries_patient_id
ON medical_summaries(patient_id);