const db = require('../config/db');

const projectCors = async (req, res, next) => {
    const origin = req.headers.origin;

    // Allow non-browser requests (SDK, server-to-server)
    if (!origin) {
        return next();
    }

    // Skip CORS for health check
    if (req.path === '/' || req.path === '/health') {
        return next();
    }

    console.log(`[ProjectCORS] Incoming ${req.method} request from ${origin} for ${req.path}`);

    let isAllowed = false;
    let allowedOrigins = [];

    // Case 1: Project already identified (API key provided in headers)
    if (req.project) {
        allowedOrigins = req.project.config?.allowed_origins || [];
        isAllowed = allowedOrigins.includes(origin);
        console.log(`[ProjectCORS] Context Project: ${req.project.name}, Allowed: ${isAllowed}`);
    }

    // Case 2: Preflight or Missing Project Context (Try to identify by Origin)
    if (!isAllowed) {
        try {
            // Check if ANY project whitelists this origin
            // Search anywhere in the Projects table for this origin in config->allowed_origins
            const result = await db.query(`
                SELECT name, config 
                FROM Projects 
                WHERE config->'allowed_origins' @> $1::jsonb
            `, [JSON.stringify([origin])]);

            if (result.rows.length > 0) {
                isAllowed = true;
                console.log(`[ProjectCORS] Origin recognized for project(s): ${result.rows.map(r => r.name).join(', ')}`);
            } else {
                // Fallback: Check if it's the dashboard origin explicitly if not found in DB
                if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') {
                    isAllowed = true;
                    console.log(`[ProjectCORS] Allowed via hardcoded dashboard fallback`);
                }
            }
        } catch (error) {
            console.error('[ProjectCORS] DB lookup error:', error);
        }
    }

    // Set CORS headers if allowed
    if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-API-Key,X-CSRF-Token');
        res.setHeader('Vary', 'Origin');

        if (req.method === 'OPTIONS') {
            console.log(`[ProjectCORS] Handling preflight: 204`);
            return res.sendStatus(204);
        }
        return next();
    }

    // If not allowed and it's a preflight, we MUST still return a response that the browser can understand
    if (req.method === 'OPTIONS') {
        console.log(`[ProjectCORS] Preflight DENIED for origin: ${origin}`);
        return res.status(403).end(); // No headers = browser blocks
    }

    console.log(`[ProjectCORS] Access DENIED for origin: ${origin} (Project: ${req.project?.name || 'Unknown'})`);
    return res.status(403).json({
        success: false,
        message: 'CORS policy: Origin not allowed',
        origin
    });
};

module.exports = projectCors;
