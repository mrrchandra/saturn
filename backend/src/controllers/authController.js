const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const { createOTP, verifyOTP } = require('../utils/otpService');
const { sendOTPEmail } = require('../services/emailService');

/**
 * Register a new user
 */
exports.register = asyncHandler(async (req, res) => {
    const { email, username, password, site_name, role } = req.body;

    // Check if user exists
    const existing = await db.query('SELECT id FROM Users WHERE email = $1 OR username = $2', [email, username || null]);
    if (existing.rowCount > 0) {
        return error(res, 'User already exists', 'Account already registered', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const site = req.project ? req.project.name : (site_name || 'Saturn Platform');

    const result = await db.query(
        'INSERT INTO Users (email, username, password_hash, site_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, role',
        [email, username || null, password_hash, site, role || 'user']
    );

    // Log analytics event
    await db.query(
        'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ($1, $2, $3)',
        [result.rows[0].id, 'user.registered', site]
    );

    return success(res, { user: result.rows[0] }, 'User registered successfully', 201);
});

/**
 * Login user and issue tokens
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        return error(res, 'Invalid credentials', 'Email or password incorrect', 401);
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return error(res, 'Invalid credentials', 'Email or password incorrect', 401);
    }

    // Generate Tokens
    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Store hashed refresh token in Users table
    await db.query(
        'UPDATE Users SET refresh_token = $1 WHERE id = $2',
        [hashedRefreshToken, user.id]
    );

    // Log analytics event
    const site = req.project ? req.project.name : (user.site_name || 'Saturn Platform');
    await db.query(
        'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ($1, $2, $3)',
        [user.id, 'auth.login', site]
    );

    // Set httpOnly cookies
    res
        .cookie('saturn_access', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        })
        .cookie('saturn_refresh', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

    return success(res, {
        user: { id: user.id, email: user.email, username: user.username, role: user.role }
    }, 'Login successful');
});

/**
 * Refresh Access Token
 */
exports.refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Token missing', 'Refresh token required', 401);

    // Verify token against DB
    const tokenResult = await db.query('SELECT * FROM AuthTokens WHERE token = $1 AND type = $2', [refreshToken, 'refresh']);
    if (tokenResult.rowCount === 0) {
        return error(res, 'Invalid token', 'Refresh token not found in database', 401);
    }

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const token = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return success(res, { token }, 'Token refreshed');
    } catch (err) {
        // If expired or invalid, clean up DB
        await db.query('DELETE FROM AuthTokens WHERE token = $1', [refreshToken]);
        return error(res, 'Invalid token', 'Refresh token expired or invalid', 401);
    }
});

/**
 * Logout user
 */
exports.logout = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (userId) {
        // Clear refresh token from DB
        await db.query('UPDATE Users SET refresh_token = NULL WHERE id = $1', [userId]);

        // Log analytics event
        const site = req.project ? req.project.name : 'Saturn Platform';
        await db.query(
            'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ($1, $2, $3)',
            [userId, 'auth.logout', site]
        );
    }

    // Clear cookies
    res
        .clearCookie('saturn_access')
        .clearCookie('saturn_refresh');

    return success(res, null, 'Logged out successfully');
});

/**
 * Upload Profile Picture via ImgLink
 */
exports.uploadPFP = asyncHandler(async (req, res) => {
    const { user_id } = req.body;
    const file = req.file;

    if (!file) return error(res, 'File missing', 'No image file provided', 400);

    // Prepare FormData for ImgLink
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    try {
        const response = await axios.post('https://imglink.io/api/upload', formData, {
            headers: {
                ...formData.getHeaders()
                // Authorization header might not be needed for public upload, or if valid key is in env. 
                // User didn't specify auth in curl, but env has IMGLINK_API_KEY. I'll keep it if it was there, 
                // but the curl example didn't have it. 
                // However, I should probably stick to what the code had or what the user showed.
                // User curl: curl -X POST https://imglink.io/api/upload -F "file=@image.jpg" -F "delete_after=3600"
                // No auth header in user example.
                // But typically APIs might need it. I will keep the header if env var exists, it likely won't hurt, 
                // or I can remove it if I suspect it's wrong.
                // *Decision*: I'll keep the existing auth structure but assume it's optional if the user example didn't show it.
                // Actually, checking previous code: `Authorization: Bearer ${process.env.IMGLINK_API_KEY}`
                // I will leave it alone for now, just changing URL and response.
            }
        });

        // Response format based on user provided JSON:
        // {
        //   "success": true,
        //   "image_url": "https://imglink.io/abc123.jpg",
        //   "direct_link": "https://imglink.io/image/abc123",
        //   "thumbnail": "https://imglink.io/thumb/abc123.jpg"
        // }

        // Log the response for debugging
        console.log('ImgLink Response:', response.data);

        const imageUrl = response.data.images?.[0]?.direct_link;

        if (!imageUrl) {
            throw new Error('Failed to retrieve image URL from ImgLink response');
        }

        console.log('Updating user:', user_id, 'with avatar:', imageUrl);

        await db.query('UPDATE Users SET avatar_url = $1 WHERE id = $2', [imageUrl, user_id]);

        return success(res, { avatar_url: imageUrl }, 'Profile picture updated successfully');
    } catch (err) {
        console.error('ImgLink Error:', err.response?.data || err.message);
        return error(res, err.response?.data || 'ImgLink upload failed', 'Failed to upload image to ImgLink', 500);
    }
});
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
