/**
 * Send OTP for email verification
 */
exports.sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return error(res, 'Email required', 'Email address is required', 400);
    }

    // Create OTP
    const otpResult = await createOTP(email, 'email_verification');
    if (!otpResult.success) {
        return error(res, otpResult.error, 'Failed to generate OTP', 500);
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otpResult.otp);
    if (!emailResult.success) {
        return error(res, emailResult.error, 'Failed to send OTP email', 500);
    }

    return success(res, { email }, 'OTP sent successfully to your email');
});

/**
 * Verify OTP
 */
exports.verifyOTPCode = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return error(res, 'Missing fields', 'Email and OTP are required', 400);
    }

    const result = await verifyOTP(email, otp, 'email_verification');
    if (!result.success) {
        return error(res, result.error, 'OTP verification failed', 400);
    }

    return success(res, { email, verified: true }, 'Email verified successfully');
});
