const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');

exports.getUserInfo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await db.query('SELECT id, email, avatar_url, site_name, created_at FROM Users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }

    return success(res, result.rows[0]);
});

exports.getUserDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM Users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }

    return success(res, result.rows[0]);
});

exports.getAvatar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await db.query('SELECT avatar_url FROM Users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }

    return success(res, { avatar_url: result.rows[0].avatar_url });
});

exports.getMetadata = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await db.query('SELECT metadata FROM Users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }

    return success(res, result.rows[0].metadata);
});
