/**
 * Forgot Password - Send OTP for password reset
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const result = await db.query('SELECT id, username FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        return error(res, 'User not found', 'No account with this email exists', 404);
    }

    const user = result.rows[0];

    // Create OTP for password reset
    const otpResult = await createOTP(email, 'password_reset');
    if (!otpResult.success) {
        return error(res, otpResult.error, 'Failed to generate OTP', 500);
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otpResult.otp, user.username);
    if (!emailResult.success) {
        return error(res, emailResult.error, 'Failed to send reset email', 500);
    }

    return success(res, { email }, 'Password reset OTP sent to your email');
});

/**
 * Reset Password - Verify OTP and update password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const otpVerification = await verifyOTP(email, otp, 'password_reset');
    if (!otpVerification.success) {
        return error(res, otpVerification.error, 'Invalid or expired OTP', 400);
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE Users SET password_hash = $1 WHERE email = $2', [password_hash, email]);

    // Log analytics event
    await db.query(
        'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ((SELECT id FROM Users WHERE email = $1), $2, $3)',
        [email, 'auth.password_reset', 'Saturn Platform']
    );

    return success(res, { email }, 'Password reset successful');
});
