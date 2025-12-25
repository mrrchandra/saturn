const projectCors = (req, res, next) => {
    const origin = req.headers.origin;

    // Allow non-browser requests (SDK, server-to-server)
    if (!origin) {
        return next();
    }

    // Skip CORS for health check
    if (req.path === '/' || req.path === '/health') {
        return next();
    }

    // Project must be loaded by projectContext middleware
    if (!req.project) {
        return res.status(401).json({
            success: false,
            message: 'API key required'
        });
    }

    const allowedOrigins = req.project.config?.allowed_origins || [];

    console.log(`[ProjectCORS] Checking origin ${origin} for project ${req.project.name}`);
    console.log(`[ProjectCORS] Allowed origins:`, allowedOrigins);

    if (!allowedOrigins.includes(origin)) {
        console.log(`[ProjectCORS] Origin ${origin} not allowed`);
        return res.status(403).json({
            success: false,
            message: 'Origin not allowed for this project',
            hint: 'Add this origin in project settings'
        });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-API-Key,X-CSRF-Token');
    res.setHeader('Vary', 'Origin');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    console.log(`[ProjectCORS] Origin ${origin} allowed`);
    next();
};

module.exports = projectCors;
