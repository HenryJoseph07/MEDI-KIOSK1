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

    email VARCHAR(150) UNIQUE,

    phone VARCHAR(20),

    pin_hash TEXT,

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

    age INTEGER,

    gender VARCHAR(20),

    language VARCHAR(50),

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

    document_id VARCHAR(20) UNIQUE,

    description TEXT,

    processing_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),

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

ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS language VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_id VARCHAR(20);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE medical_summaries ADD COLUMN IF NOT EXISTS overview TEXT;
ALTER TABLE medical_summaries ADD COLUMN IF NOT EXISTS recent_findings JSONB DEFAULT '[]'::jsonb;
ALTER TABLE medical_summaries ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_document_id
ON documents(document_id);

CREATE TABLE IF NOT EXISTS medical_timeline (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_patient_id
ON medical_timeline(patient_id, date DESC);

CREATE TABLE IF NOT EXISTS patient_doctor_access (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (patient_id, doctor_id)
);