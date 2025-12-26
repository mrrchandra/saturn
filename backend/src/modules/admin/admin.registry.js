module.exports = {
    domain: 'admin',
    functions: {
        'admin.get-settings': {
            description: 'Get global site settings',
            handler: 'adminController.getSiteSettings',
            requiresAuth: true,
            rateLimitTier: 'low'
        },
        'admin.update-settings': {
            description: 'Update global site settings',
            handler: 'adminController.updateSiteSettings',
            requiresAuth: true,
            rateLimitTier: 'medium'
        },
        'admin.list-users': {
            description: 'List all users in the system',
            handler: 'adminController.listUsers',
            requiresAuth: true,
            rateLimitTier: 'low'
        }
    }
};
