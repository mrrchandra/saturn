const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { success, error } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

/**
 * Check session - validate access token from cookie
 */
exports.session = asyncHandler(async (req, res) => {
    const accessToken = req.cookies.saturn_access;

    if (!accessToken) {
        return res.status(401).json({
            success: false,
            authenticated: false,
            message: 'No session found'
        });
    }

    try {
        const payload = jwt.verify(accessToken, JWT_SECRET);

        // Get user from DB
        const result = await db.query(
            'SELECT id, email, username, role FROM Users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                authenticated: false,
                message: 'User not found'
            });
        }

        return success(res, {
            authenticated: true,
            user: result.rows[0]
        }, 'Session valid');
    } catch (err) {
        // Access token expired - try silent refresh
        return handleSilentRefresh(req, res);
    }
});

/**
 * Silent refresh - issue new access token using refresh token
 */
const handleSilentRefresh = async (req, res) => {
    const refreshToken = req.cookies.saturn_refresh;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            authenticated: false,
            message: 'No refresh token'
        });
    }

    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        // Get user and verify refresh token
        const result = await db.query(
            'SELECT id, email, username, role, refresh_token FROM Users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                authenticated: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        // Verify refresh token matches hashed version in DB
        const isValid = await bcrypt.compare(refreshToken, user.refresh_token);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                authenticated: false,
                message: 'Invalid refresh token'
            });
        }

        // Issue new access token
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Set new access token cookie
        res.cookie('saturn_access', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        return success(res, {
            authenticated: true,
            user: { id: user.id, email: user.email, username: user.username, role: user.role }
        }, 'Session refreshed');
    } catch (err) {
        return res.status(401).json({
            success: false,
            authenticated: false,
            message: 'Session expired'
        });
    }
};

module.exports = { session: exports.session };
