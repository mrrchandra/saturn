const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');

exports.updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, site_name, metadata } = req.body;

    const result = await db.query(
        'UPDATE Users SET email = $1, site_name = $2, metadata = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, site_name, metadata',
        [email, site_name, metadata, id]
    );

    if (result.rows.length === 0) {
        return error(res, 'User not found', 'User does not exist', 404);
    }

    // Log admin action
    await db.query(
        'INSERT INTO AdminLogs (admin_user_id, action_type, target_user_id, meta) VALUES ($1, $2, $3, $4)',
        [req.user?.id || 1, 'update_user', id, JSON.stringify({ email, site_name })]
    );

    return success(res, { user: result.rows[0] }, 'User updated successfully');
});

exports.deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await db.query('DELETE FROM Users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
        return error(res, 'User not found', 'User does not exist', 404);
    }

    // Log admin action
    await db.query(
        'INSERT INTO AdminLogs (admin_user_id, action_type, target_user_id) VALUES ($1, $2, $3)',
        [req.user?.id || 1, 'delete_user', id]
    );

    return success(res, null, 'User deleted successfully');
});

exports.listUsers = asyncHandler(async (req, res) => {
    const { site_name } = req.query;

    const query = site_name ? 'SELECT * FROM Users WHERE site_name = $1' : 'SELECT * FROM Users';
    const params = site_name ? [site_name] : [];

    const result = await db.query(query, params);
    return success(res, result.rows);
});

exports.updateSiteSettings = asyncHandler(async (req, res) => {
    const { project_name, maintenance_mode, config_json } = req.body;

    const result = await db.query(
        `INSERT INTO SiteSettings (id, project_name, maintenance_mode, config_json) 
         VALUES (1, $1, $2, $3) 
         ON CONFLICT (id) DO UPDATE 
         SET project_name = $1, maintenance_mode = $2, config_json = $3, updated_at = NOW() 
         RETURNING *`,
        [project_name, maintenance_mode, config_json]
    );

    return success(res, { settings: result.rows[0] }, 'Site settings updated');
});

exports.getSiteSettings = asyncHandler(async (req, res) => {
    const result = await db.query('SELECT * FROM SiteSettings WHERE id = 1');

    if (result.rows.length === 0) {
        // Return default settings if none exist
        return success(res, { settings: { project_name: 'Saturn Platform', maintenance_mode: false, allow_registration: true } });
    }

    return success(res, { settings: result.rows[0] });
});
