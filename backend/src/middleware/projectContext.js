const db = require('../config/db');

/**
 * Project Context Middleware
 * Loads project configuration and attaches to request
 */
const projectContext = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

        // Skip API key check for health endpoint
        if (req.path === '/' || req.path === '/health') {
            req.project = null;
            return next();
        }

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key required - provide via x-api-key header'
            });
        }

        // Load project from database
        const projectResult = await db.query(
            'SELECT id, name, is_maintenance, feature_flags, config FROM Projects WHERE api_key = $1',
            [apiKey]
        );

        if (projectResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        const project = projectResult.rows[0];

        console.log(`[ProjectContext] Loaded project: ${project.name} (ID: ${project.id})`);

        // Check maintenance mode (except for admin routes)
        if (project.is_maintenance && !req.path.startsWith('/api/admin')) {
            return res.status(503).json({
                success: false,
                message: 'Service temporarily unavailable - maintenance mode',
                maintenance: true
            });
        }

        // Load enabled functions for this project
        const functionsResult = await db.query(`
            SELECT fr.function_name, fr.domain, pf.is_enabled, pf.custom_rate_limit
            FROM FunctionRegistry fr
            LEFT JOIN ProjectFunctions pf ON fr.id = pf.function_id AND pf.project_id = $1
        `, [project.id]);

        // Build enabled functions map
        const enabledFunctions = {};
        functionsResult.rows.forEach(row => {
            // If no ProjectFunctions entry exists, default to enabled
            const isEnabled = row.is_enabled !== null ? row.is_enabled : true;
            enabledFunctions[row.function_name] = {
                enabled: isEnabled,
                customRateLimit: row.custom_rate_limit
            };
        });

        // Attach project context to request
        req.project = {
            id: project.id,
            name: project.name,
            featureFlags: project.feature_flags || {},
            enabledFunctions,
            config: project.config || {}
        };

        next();
    } catch (error) {
        console.error('Project context error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load project context'
        });
    }
};

module.exports = projectContext;
