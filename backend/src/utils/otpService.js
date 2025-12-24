const db = require('../config/db');
const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create and store OTP in database
 */
const createOTP = async (email, purpose = 'email_verification') => {
    try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Delete any existing unverified OTPs for this email and purpose
        await db.query(
            'DELETE FROM OTPVerification WHERE email = $1 AND purpose = $2 AND verified = FALSE',
            [email, purpose]
        );

        // Insert new OTP
        await db.query(
            'INSERT INTO OTPVerification (email, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
            [email, otp, purpose, expiresAt]
        );

        return { success: true, otp };
    } catch (error) {
        console.error('Error creating OTP:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verify OTP
 */
const verifyOTP = async (email, otp, purpose = 'email_verification') => {
    try {
        const result = await db.query(
            'SELECT * FROM OTPVerification WHERE email = $1 AND otp_code = $2 AND purpose = $3 AND verified = FALSE AND expires_at > NOW()',
            [email, otp, purpose]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Invalid or expired OTP' };
        }

        // Mark OTP as verified
        await db.query(
            'UPDATE OTPVerification SET verified = TRUE WHERE id = $1',
            [result.rows[0].id]
        );

        // If email verification, update user's email_verified status
        if (purpose === 'email_verification') {
            await db.query(
                'UPDATE Users SET email_verified = TRUE WHERE email = $1',
                [email]
            );
        }

        return { success: true };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Clean up expired OTPs (can be run periodically)
 */
const cleanupExpiredOTPs = async () => {
    try {
        await db.query('DELETE FROM OTPVerification WHERE expires_at < NOW()');
        console.log('Expired OTPs cleaned up');
    } catch (error) {
        console.error('Error cleaning up OTPs:', error);
    }
};

module.exports = {
    generateOTP,
    createOTP,
    verifyOTP,
    cleanupExpiredOTPs
};
