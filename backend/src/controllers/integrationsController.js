const db = require('../config/db');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');

exports.getProjects = asyncHandler(async (req, res) => {
    const result = await db.query('SELECT * FROM Projects ORDER BY created_at DESC');
    return success(res, result.rows);
});

exports.addProject = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) return error(res, 'Validation error', 'Project name is required', 400);

    const apiKey = `sat_live_${crypto.randomBytes(24).toString('hex')}`;

    try {
        const result = await db.query(
            'INSERT INTO Projects (name, api_key) VALUES ($1, $2) RETURNING *',
            [name, apiKey]
        );
        return success(res, result.rows[0], 'Project created', 201);
    } catch (err) {
        if (err.code === '23505') {
            return error(res, 'Duplicate project', 'Project name already exists', 400);
        }
        throw err;
    }
});

exports.toggleMaintenance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { is_maintenance } = req.body;

    const result = await db.query(
        'UPDATE Projects SET is_maintenance = $1 WHERE id = $2 RETURNING *',
        [is_maintenance, id]
    );

    if (result.rowCount === 0) {
        return error(res, 'Not found', 'Project not found', 404);
    }

    return success(res, result.rows[0], 'Maintenance mode updated');
});

exports.deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await db.query('DELETE FROM Projects WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        return error(res, 'Not found', 'Project not found', 404);
    }

    return success(res, null, 'Project deleted successfully');
});
