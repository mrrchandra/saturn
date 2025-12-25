const saturnOnly = (req, res, next) => {
    // Must have project context
    if (!req.project) {
        return res.status(401).json({
            success: false,
            message: 'API key required'
        });
    }

    // Check if project is Saturn Platform
    if (!req.project.config?.is_saturn_platform) {
        console.log(`[SaturnOnly] Access denied for project: ${req.project.name}`);
        return res.status(403).json({
            success: false,
            message: 'This endpoint is only accessible by Saturn Platform',
            hint: 'Use the Saturn Dashboard to manage projects'
        });
    }

    console.log(`[SaturnOnly] Access granted for Saturn Platform`);
    next();
};

module.exports = saturnOnly;
