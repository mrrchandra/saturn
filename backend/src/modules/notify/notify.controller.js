const notifyService = require('./notify.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success, error } = require('../../core/utils/response');

/**
 * Send email notification
 */
exports.sendEmail = asyncHandler(async (req, res) => {
    const { to, subject, body, user_id } = req.body;

    if (!to || !subject || !body) {
        return error(res, 'Validation error', 'Recipient, subject, and body are required', 400);
    }

    try {
        await notifyService.sendEmail(to, subject, body, user_id);
        return success(res, null, 'Email sent successfully');
    } catch (err) {
        return error(res, err.message, 'Failed to send email', 500);
    }
});

/**
 * Send push notification
 */
exports.sendPush = asyncHandler(async (req, res) => {
    const { token, title, body, user_id } = req.body;

    if (!token || !title || !body) {
        return error(res, 'Validation error', 'Token, title, and body are required', 400);
    }

    try {
        await notifyService.sendPush(token, title, body, user_id);
        return success(res, null, 'Push notification sent successfully');
    } catch (err) {
        const statusCode = err.message === 'Firebase not initialized' ? 500 : 400;
        return error(res, err.message, 'Failed to send push notification', statusCode);
    }
});

/**
 * Subscribe to push notifications
 */
exports.subscribe = asyncHandler(async (req, res) => {
    const { user_id, token } = req.body;

    if (!user_id || !token) {
        return error(res, 'Validation error', 'User ID and token are required', 400);
    }

    try {
        await notifyService.subscribe(user_id, token);
        return success(res, null, 'Subscribed to push notifications');
    } catch (err) {
        return error(res, err.message, 'Subscription failed', 500);
    }
});
