const db = require('../../core/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpService = require('../otp/otp.service');
const { sendOTPEmail } = require('../../services/emailService');

class AuthService {
    /**
     * Register a new user
     */
    async register(userData, projectContext) {
        const { email, username, password, site_name, role } = userData;

        // Check if user exists
        const existing = await db.query('SELECT id FROM Users WHERE email = $1 OR username = $2', [email, username || null]);
        if (existing.rowCount > 0) {
            throw new Error('User already exists'); // Controller catches this
        }

        const password_hash = await bcrypt.hash(password, 10);
        const site = projectContext ? projectContext.name : (site_name || 'Saturn Platform');

        const result = await db.query(
            'INSERT INTO Users (email, username, password_hash, site_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, role',
            [email, username || null, password_hash, site, role || 'user']
        );

        const user = result.rows[0];

        // Log analytics event (Ideally moved to event bus later)
        await db.query(
            'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ($1, $2, $3)',
            [user.id, 'user.registered', site]
        );

        return user;
    }

    /**
     * Login user
     */
    async login(credentials, projectContext) {
        const { email, password } = credentials;

        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error('Invalid credentials');
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
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

        // Store hashed refresh token
        await db.query(
            'UPDATE Users SET refresh_token = $1 WHERE id = $2',
            [hashedRefreshToken, user.id]
        );

        // Log analytics
        const site = projectContext ? projectContext.name : (user.site_name || 'Saturn Platform');
        await db.query(
            'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ($1, $2, $3)',
            [user.id, 'auth.login', site]
        );

        return { user, accessToken, refreshToken };
    }

    /**
     * Refresh Token
     */
    async refreshToken(token) {
        if (!token) throw new Error('Refresh token required');

        try {
            const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

            // Verify against User's stored hash
            const userResult = await db.query('SELECT refresh_token FROM Users WHERE id = $1', [payload.userId]);
            if (userResult.rows.length === 0) throw new Error('User not found');

            const storedHash = userResult.rows[0].refresh_token;
            if (!storedHash) throw new Error('Token invalidated');

            const isValid = await bcrypt.compare(token, storedHash);
            if (!isValid) throw new Error('Invalid token');

            // Generate new access token
            const newAccessToken = jwt.sign({ userId: payload.userId, email: payload.email, role: payload.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
            return { accessToken: newAccessToken };

        } catch (err) {
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Logout
     */
    async logout(userId, projectContext) {
        if (userId) {
            await db.query('UPDATE Users SET refresh_token = NULL WHERE id = $1', [userId]);

            const site = projectContext ? projectContext.name : 'Saturn Platform';
            await db.query(
                'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ($1, $2, $3)',
                [userId, 'auth.logout', site]
            );
        }
    }

    /**
     * Send OTP
     */
    async sendOTP(email) {
        const otpResult = await otpService.createOTP(email, 'email_verification');
        if (!otpResult.success) throw new Error(otpResult.error);

        const emailResult = await sendOTPEmail(email, otpResult.otp);
        if (!emailResult.success) throw new Error(emailResult.error);

        return { email };
    }

    /**
     * Verify OTP
     */
    async verifyOTP(email, otp) {
        const result = await otpService.verifyOTP(email, otp, 'email_verification');
        if (!result.success) throw new Error(result.error);
        return { email, verified: true };
    }

    /**
     * Forgot Password
     */
    async forgotPassword(email) {
        const result = await db.query('SELECT id, username FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) throw new Error('User not found');

        const user = result.rows[0];
        const otpResult = await otpService.createOTP(email, 'password_reset');
        if (!otpResult.success) throw new Error(otpResult.error);

        const emailResult = await sendOTPEmail(email, otpResult.otp, user.username);
        if (!emailResult.success) throw new Error(emailResult.error);

        return { email };
    }

    /**
     * Reset Password
     */
    async resetPassword(email, otp, newPassword) {
        const otpVerification = await otpService.verifyOTP(email, otp, 'password_reset');
        if (!otpVerification.success) throw new Error(otpVerification.error);

        const password_hash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE Users SET password_hash = $1 WHERE email = $2', [password_hash, email]);

        // Analytics
        await db.query(
            'INSERT INTO Analytics (user_id, event_type, site_name) VALUES ((SELECT id FROM Users WHERE email = $1), $2, $3)',
            [email, 'auth.password_reset', 'Saturn Platform']
        );

        return { email };
    }

    /**
     * Upload Profile Picture via ImgLink
     */
    async uploadPFP(userId, file) {
        if (!file) throw new Error('No image file provided');

        // Lazy load expensive/large deps or just ensure axios/FormData are available
        const axios = require('axios');
        const FormData = require('form-data');

        // Prepare FormData for ImgLink
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname);

        try {
            const response = await axios.post('https://imglink.io/api/upload', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            const imageUrl = response.data.images?.[0]?.direct_link;

            if (!imageUrl) {
                throw new Error('Failed to retrieve image URL from ImgLink response');
            }

            await db.query('UPDATE Users SET avatar_url = $1 WHERE id = $2', [imageUrl, userId]);

            return { avatar_url: imageUrl };
        } catch (err) {
            console.error('ImgLink Error:', err.response?.data || err.message);
            throw new Error('Failed to upload image to ImgLink');
        }
    }
}

module.exports = new AuthService();
