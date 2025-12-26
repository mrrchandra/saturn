const authService = require('./auth.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success, error } = require('../../core/utils/response');

/**
 * Register a new user
 */
exports.register = asyncHandler(async (req, res) => {
    try {
        const user = await authService.register(req.body, req.project);
        return success(res, { user }, 'User registered successfully', 201);
    } catch (err) {
        return error(res, err.message, 'Registration failed', 400);
    }
});

/**
 * Login user
 */
exports.login = asyncHandler(async (req, res) => {
    try {
        const { user, accessToken, refreshToken } = await authService.login(req.body, req.project);

        // Set cookies
        res.cookie('saturn_access', accessToken, {
            httpOnly: true,
            secure: true, // Required for sameSite: 'none'
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        }).cookie('saturn_refresh', refreshToken, {
            httpOnly: true,
            secure: true, // Required for sameSite: 'none'
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return success(res, {
            user: { id: user.id, email: user.email, username: user.username, role: user.role }
        }, 'Login successful');

    } catch (err) {
        return error(res, 'Invalid credentials', err.message, 401);
    }
});

/**
 * Refresh Token
 */
exports.refresh = asyncHandler(async (req, res) => {
    try {
        const { accessToken } = await authService.refreshToken(req.body.refreshToken); // Or from cookie req.cookies.saturn_refresh? Original used body.
        return success(res, { token: accessToken }, 'Token refreshed');
    } catch (err) {
        // Original cleared tokens on failure? Not explicitly, but recommended
        res.clearCookie('saturn_access').clearCookie('saturn_refresh');
        return error(res, 'Invalid token', err.message, 401);
    }
});

/**
 * Logout
 */
exports.logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user?.id, req.project);
    res.clearCookie('saturn_access').clearCookie('saturn_refresh');
    return success(res, null, 'Logged out successfully');
});

/**
 * Send OTP
 */
exports.sendOTP = asyncHandler(async (req, res) => {
    try {
        const result = await authService.sendOTP(req.body.email);
        return success(res, result, 'OTP sent successfully to your email');
    } catch (err) {
        return error(res, err.message, 'Failed to send OTP', 500);
    }
});

/**
 * Verify OTP
 */
exports.verifyOTPCode = asyncHandler(async (req, res) => {
    try {
        const result = await authService.verifyOTP(req.body.email, req.body.otp);
        return success(res, result, 'Email verified successfully');
    } catch (err) {
        return error(res, err.message, 'OTP verification failed', 400);
    }
});

/**
 * Forgot Password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
        return success(res, result, 'Password reset OTP sent to your email');
    } catch (err) {
        return error(res, err.message, 'Failed to process request', err.message === 'User not found' ? 404 : 500);
    }
});

/**
 * Reset Password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
    try {
        const result = await authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
        return success(res, result, 'Password reset successful');
    } catch (err) {
        return error(res, err.message, 'Password reset failed', 400);
    }
});

/**
 * Upload Profile Picture
 */
exports.uploadPFP = asyncHandler(async (req, res) => {
    try {
        const result = await authService.uploadPFP(req.body.user_id, req.file);
        return success(res, result, 'Profile picture updated successfully');
    } catch (err) {
        return error(res, err.message || 'Failed to upload image', 'Upload failed', 500);
    }
});
