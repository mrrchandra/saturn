module.exports = {
    domain: 'system',
    functions: {
        'system.stats': {
            description: 'Get global platform statistics',
            handler: 'systemController.getStats',
            requiresAuth: true,
            rateLimitTier: 'low'
        },
        'system.activity': {
            description: 'Get recent activity feed',
            handler: 'systemController.getRecentActivity',
            requiresAuth: true,
            rateLimitTier: 'low'
        }
    }
};
