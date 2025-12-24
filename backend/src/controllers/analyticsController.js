const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

exports.getAuthAttempts = asyncHandler(async (req, res) => {
    const { site_name } = req.query;

    const query = site_name
        ? 'SELECT * FROM Analytics WHERE event_type = $1 AND site_name = $2 ORDER BY timestamp DESC'
        : 'SELECT * FROM Analytics WHERE event_type = $1 ORDER BY timestamp DESC';

    const params = site_name ? ['auth.login', site_name] : ['auth.login'];

    const result = await db.query(query, params);
    return success(res, result.rows);
});

exports.getUsersRegistered = asyncHandler(async (req, res) => {
    const { site_name } = req.query;

    const query = site_name
        ? 'SELECT * FROM Analytics WHERE event_type = $1 AND site_name = $2 ORDER BY timestamp DESC'
        : 'SELECT * FROM Analytics WHERE event_type = $1 ORDER BY timestamp DESC';

    const params = site_name ? ['user.registered', site_name] : ['user.registered'];

    const result = await db.query(query, params);
    return success(res, result.rows);
});
