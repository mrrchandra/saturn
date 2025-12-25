const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');

/**
 * Get all functions for a project
 */
exports.getProjectFunctions = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const result = await db.query(`
        SELECT 
            fr.id,
            fr.domain,
            fr.function_name,
            fr.description,
            fr.rate_limit_tier,
            COALESCE(pf.is_enabled, true) as is_enabled,
            pf.custom_rate_limit
        FROM FunctionRegistry fr
        LEFT JOIN ProjectFunctions pf ON fr.id = pf.function_id AND pf.project_id = $1
        ORDER BY fr.domain, fr.function_name
    `, [projectId]);

    return success(res, result.rows);
});

/**
 * Toggle function for a project
 */
exports.toggleProjectFunction = asyncHandler(async (req, res) => {
    const { projectId, functionId } = req.params;
    const { is_enabled } = req.body;

    // Check if entry exists
    const existing = await db.query(
        'SELECT id FROM ProjectFunctions WHERE project_id = $1 AND function_id = $2',
        [projectId, functionId]
    );

    if (existing.rows.length > 0) {
        // Update existing
        await db.query(
            'UPDATE ProjectFunctions SET is_enabled = $1 WHERE project_id = $2 AND function_id = $3',
            [is_enabled, projectId, functionId]
        );
    } else {
        // Insert new
        await db.query(
            'INSERT INTO ProjectFunctions (project_id, function_id, is_enabled) VALUES ($1, $2, $3)',
            [projectId, functionId, is_enabled]
        );
    }

    return success(res, { is_enabled }, 'Function updated');
});

/**
 * Get all functions in registry
 */
exports.getAllFunctions = asyncHandler(async (req, res) => {
    const result = await db.query(`
        SELECT id, domain, function_name, description, rate_limit_tier
        FROM FunctionRegistry
        ORDER BY domain, function_name
    `);

    return success(res, result.rows);
});

module.exports = exports;
