const db = require('../../core/db');

class AnalyticsService {
    /**
     * Get authentication attempts (logins)
     */
    async getAuthAttempts(site_name) {
        const query = site_name
            ? 'SELECT * FROM Analytics WHERE event_type = $1 AND site_name = $2 ORDER BY timestamp DESC'
            : 'SELECT * FROM Analytics WHERE event_type = $1 ORDER BY timestamp DESC';

        const params = site_name ? ['auth.login', site_name] : ['auth.login'];

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Get user registrations
     */
    async getUsersRegistered(site_name) {
        const query = site_name
            ? 'SELECT * FROM Analytics WHERE event_type = $1 AND site_name = $2 ORDER BY timestamp DESC'
            : 'SELECT * FROM Analytics WHERE event_type = $1 ORDER BY timestamp DESC';

        const params = site_name ? ['user.registered', site_name] : ['user.registered'];

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Create an analytics event
     */
    async logEvent(userId, eventType, siteName, meta = {}) {
        const result = await db.query(
            'INSERT INTO Analytics (user_id, event_type, site_name, meta) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, eventType, siteName, JSON.stringify(meta)]
        );
        return result.rows[0];
    }
}

module.exports = new AnalyticsService();
