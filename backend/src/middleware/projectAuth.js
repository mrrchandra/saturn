const db = require('../config/db');

module.exports = async (req, res, next) => {
    const apiKey = req.headers['x-saturn-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'X-Saturn-Key header is required' });
    }

    try {
        const result = await db.query('SELECT * FROM Projects WHERE api_key = $1', [apiKey]);

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid Saturn API Key' });
        }

        const project = result.rows[0];

        if (project.is_maintenance) {
            return res.status(503).json({
                error: 'Service unavailable',
                message: `${project.name} is currently under maintenance.`
            });
        }

        req.project = project;
        next();
    } catch (err) {
        console.error('Project Auth Error:', err);
        res.status(500).json({ error: 'Internal server error during project validation' });
    }
};
