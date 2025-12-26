module.exports = {
    domain: 'analytics',
    functions: {
        'analytics.auth-attempts': {
            description: 'Get authentication attempt logs',
            handler: 'analyticsController.getAuthAttempts',
            requiresAuth: true,
            rateLimitTier: 'low'
        },
        'analytics.users-registered': {
            description: 'Get user registration logs',
            handler: 'analyticsController.getUsersRegistered',
            requiresAuth: true,
            rateLimitTier: 'low'
        }
    }
};
