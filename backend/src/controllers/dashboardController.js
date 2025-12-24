const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

exports.getStats = asyncHandler(async (req, res) => {
    // Real logic to fetch counts from database
    const userCount = await db.query('SELECT COUNT(*) FROM Users');
    const loginAttempts = await db.query('SELECT COUNT(*) FROM Analytics WHERE event_type = $1', ['auth.login']);
    const activeSessions = await db.query('SELECT COUNT(*) FROM AuthTokens');

    const stats = [
        { id: 1, label: 'Managed Records', value: userCount.rows[0].count, change: 'Lifetime', trend: 'neutral' },
        { id: 2, label: 'Auth Events', value: loginAttempts.rows[0].count, change: 'All time', trend: 'up' },
        { id: 3, label: 'Global Sessions', value: activeSessions.rows[0].count, change: 'Real-time', trend: 'neutral' },
        { id: 4, label: 'System Health', value: 'Optimal', change: 'Stable', trend: 'up' },
    ];

    return success(res, stats);
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
    const result = await db.query(`
        SELECT a.id, u.email as user, a.event_type as action, 
        CASE 
            WHEN a.timestamp > NOW() - INTERVAL '1 hour' THEN 'Just now'
            ELSE TO_CHAR(a.timestamp, 'HH12:MI AM')
        END as time
        FROM Analytics a
        LEFT JOIN Users u ON a.user_id = u.id
        ORDER BY a.timestamp DESC
        LIMIT 10
    `);

    return success(res, result.rows);
});
