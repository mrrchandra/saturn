const db = require('../../core/db');

class UserService {
    /**
     * Get basic user info by ID
     */
    async getUserInfo(id) {
        const result = await db.query('SELECT id, email, avatar_url, site_name, created_at FROM Users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    /**
     * Get full user details by ID
     */
    async getUserDetails(id) {
        const result = await db.query('SELECT * FROM Users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    /**
     * Get user avatar URL
     */
    async getAvatar(id) {
        const result = await db.query('SELECT avatar_url FROM Users WHERE id = $1', [id]);
        return result.rows[0] ? result.rows[0].avatar_url : undefined;
    }

    /**
     * Get user metadata
     */
    async getMetadata(id) {
        const result = await db.query('SELECT metadata FROM Users WHERE id = $1', [id]);
        return result.rows[0] ? result.rows[0].metadata : undefined;
    }
}

module.exports = new UserService();
