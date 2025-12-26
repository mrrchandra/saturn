module.exports = {
    domain: 'user',
    functions: {
        'user.get': {
            description: 'Get user information',
            handler: 'userController.getUserInfo',
            requiresAuth: false,
            rateLimitTier: 'low'
        },
        'user.details': {
            description: 'Get detailed user info',
            handler: 'userController.getUserDetails',
            requiresAuth: false,
            rateLimitTier: 'low'
        },
        'user.avatar': {
            description: 'Get user avatar',
            handler: 'userController.getAvatar',
            requiresAuth: false,
            rateLimitTier: 'low'
        },
        'user.metadata': {
            description: 'Get user metadata',
            handler: 'userController.getMetadata',
            requiresAuth: false,
            rateLimitTier: 'low'
        }
    }
};
