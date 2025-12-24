-- Migration: Add OTP Verification table
-- Date: 2025-12-25

-- Create OTP Verification table
CREATE TABLE IF NOT EXISTS OTPVerification (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'email_verification', 'password_reset'
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_email ON OTPVerification(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON OTPVerification(expires_at);

-- Add email_verified column to Users table
ALTER TABLE Users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
