const db = require('../../core/db');
const crypto = require('crypto');

class IntegrationsService {
    /**
     * Get all projects
     */
    async getProjects() {
        const result = await db.query('SELECT * FROM Projects ORDER BY created_at DESC');
        return result.rows;
    }

    /**
     * Add a new project and generate API key
     */
    async addProject(name) {
        if (!name) throw new Error('Project name is required');

        const apiKey = `sat_live_${crypto.randomBytes(24).toString('hex')}`;

        try {
            const result = await db.query(
                'INSERT INTO Projects (name, api_key) VALUES ($1, $2) RETURNING *',
                [name, apiKey]
            );
            return result.rows[0];
        } catch (err) {
            if (err.code === '23505') {
                throw new Error('Project name already exists');
            }
            throw err;
        }
    }

    /**
     * Toggle maintenance mode for a project
     */
    async toggleMaintenance(id, isMaintenance) {
        const result = await db.query(
            'UPDATE Projects SET is_maintenance = $1 WHERE id = $2 RETURNING *',
            [isMaintenance, id]
        );

        if (result.rowCount === 0) return null;
        return result.rows[0];
    }

    /**
     * Delete a project
     */
    async deleteProject(id) {
        const result = await db.query('DELETE FROM Projects WHERE id = $1', [id]);
        return result.rowCount > 0;
    }
}

module.exports = new IntegrationsService();
