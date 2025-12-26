const db = require('../../core/db');

class AdminService {
    /**
     * List all users
     */
    async listUsers(site_name) {
        const query = site_name ? 'SELECT id, email, username, role, site_name, created_at FROM Users WHERE site_name = $1' : 'SELECT id, email, username, role, site_name, created_at FROM Users';
        const params = site_name ? [site_name] : [];
        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Update user details (Admin)
     */
    async updateUser(id, userData, adminId) {
        const { email, site_name, metadata } = userData;
        const result = await db.query(
            'UPDATE Users SET email = $1, site_name = $2, metadata = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, site_name, metadata',
            [email, site_name, metadata, id]
        );

        if (result.rows.length === 0) return null;

        // Log admin action
        await db.query(
            'INSERT INTO AdminLogs (admin_user_id, action_type, target_user_id, meta) VALUES ($1, $2, $3, $4)',
            [adminId || 1, 'update_user', id, JSON.stringify({ email, site_name })]
        );

        return result.rows[0];
    }

    /**
     * Delete user (Admin)
     */
    async deleteUser(id, adminId) {
        const result = await db.query('DELETE FROM Users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return null;

        // Log admin action
        await db.query(
            'INSERT INTO AdminLogs (admin_user_id, action_type, target_user_id) VALUES ($1, $2, $3)',
            [adminId || 1, 'delete_user', id]
        );

        return true;
    }

    /**
     * Get site settings
     */
    async getSiteSettings() {
        const result = await db.query('SELECT * FROM SiteSettings WHERE id = 1');
        if (result.rows.length === 0) {
            return { project_name: 'Saturn Platform', maintenance_mode: false, allow_registration: true };
        }
        return result.rows[0];
    }

    /**
     * Update site settings
     */
    async updateSiteSettings(settings) {
        const { project_name, maintenance_mode, config_json } = settings;
        const result = await db.query(
            `INSERT INTO SiteSettings (id, project_name, maintenance_mode, config_json) 
             VALUES (1, $1, $2, $3) 
             ON CONFLICT (id) DO UPDATE 
             SET project_name = $1, maintenance_mode = $2, config_json = $3, updated_at = NOW() 
             RETURNING *`,
            [project_name, maintenance_mode, config_json]
        );
        return result.rows[0];
    }

    /**
     * List all functions in registry
     */
    async getAllFunctions() {
        const result = await db.query(`
            SELECT id, domain, function_name, description, rate_limit_tier
            FROM FunctionRegistry
            ORDER BY domain, function_name
        `);
        return result.rows;
    }

    /**
     * Get functions for a specific project
     */
    async getProjectFunctions(projectId) {
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
        return result.rows;
    }

    /**
     * Toggle a function for a project
     */
    async toggleProjectFunction(projectId, functionId, is_enabled) {
        const existing = await db.query(
            'SELECT id FROM ProjectFunctions WHERE project_id = $1 AND function_id = $2',
            [projectId, functionId]
        );

        if (existing.rows.length > 0) {
            await db.query(
                'UPDATE ProjectFunctions SET is_enabled = $1 WHERE project_id = $2 AND function_id = $3',
                [is_enabled, projectId, functionId]
            );
        } else {
            await db.query(
                'INSERT INTO ProjectFunctions (project_id, function_id, is_enabled) VALUES ($1, $2, $3)',
                [projectId, functionId, is_enabled]
            );
        }
        return { is_enabled };
    }

    /**
     * Update project allowed origins
     */
    async updateProjectOrigins(projectId, origins) {
        const result = await db.query(`
            UPDATE Projects 
            SET config = jsonb_set(
                COALESCE(config, '{}'),
                '{allowed_origins}',
                $1::jsonb
            )
            WHERE id = $2
            RETURNING id, name, config
        `, [JSON.stringify(origins), projectId]);

        if (result.rows.length === 0) return null;
        return result.rows[0];
    }
}

module.exports = new AdminService();
