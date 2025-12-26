const otpService = require('./otp.service');
const { sendOTPEmail } = require('../../services/emailService');
const { success, error } = require('../../core/utils/response');
const asyncHandler = require('../../core/utils/asyncHandler');

/**
 * Send OTP
 */
exports.sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return error(res, 'Email required', 'Email address is required', 400);
    }

    // Create OTP
    try {
        const otpResult = await otpService.createOTP(email, 'email_verification');
        // createOTP returns { success: true, otp } or throws? 
        // My new otp.service.js returns object { success: true, otp }. It does catch errors?
        // Wait, I removed the try-catch block in the class method but didn't add one?
        // No, I removed the try-catch wrapper in favor of letting it throw or return?
        // Let's check the created otp.service.js content again. 
        // I did NOT put a try/catch in createOTP, so it will throw on DB error.
        // It returns { success: true, otp }. 

        // Send Email
        const emailResult = await sendOTPEmail(email, otpResult.otp);
        if (!emailResult.success) {
            return error(res, emailResult.error, 'Failed to send OTP email', 500);
        }

        return success(res, { email }, 'OTP sent successfully to your email');
    } catch (err) {
        return error(res, err.message, 'Failed to generate OTP', 500);
    }
});

/**
 * Verify OTP
 */
exports.verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return error(res, 'Missing fields', 'Email and OTP are required', 400);
    }

    try {
        const result = await otpService.verifyOTP(email, otp, 'email_verification');
        if (!result.success) {
            return error(res, result.error, 'OTP verification failed', 400);
        }

        return success(res, { email, verified: true }, 'Email verified successfully');
    } catch (err) {
        return error(res, err.message, 'OTP verification failed', 400);
    }
});
