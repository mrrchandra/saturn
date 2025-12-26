module.exports = {
    domain: 'auth',
    functions: {
        'auth.login': {
            description: 'User login with email/password',
            handler: 'authController.login',
            requiresAuth: false,
            rateLimitTier: 'medium'
        },
        'auth.register': {
            description: 'Register new user account',
            handler: 'authController.register',
            requiresAuth: false,
            rateLimitTier: 'medium'
        },
        'auth.logout': {
            description: 'Logout current user',
            handler: 'authController.logout',
            requiresAuth: true,
            rateLimitTier: 'low'
        },
        'auth.refresh': {
            description: 'Refresh access token',
            handler: 'authController.refresh',
            requiresAuth: false,
            rateLimitTier: 'medium'
        },
        'auth.forgot-password': {
            description: 'Request password reset OTP',
            handler: 'authController.forgotPassword',
            requiresAuth: false,
            rateLimitTier: 'high'
        },
        'auth.reset-password': {
            description: 'Reset password with OTP',
            handler: 'authController.resetPassword',
            requiresAuth: false,
            rateLimitTier: 'high'
        },
        'auth.upload-pfp': {
            description: 'Upload profile picture',
            handler: 'authController.uploadPFP',
            requiresAuth: true,
            rateLimitTier: 'medium'
        },
        'auth.session': {
            description: 'Check current user session',
            handler: 'sessionController.session',
            requiresAuth: false,
            rateLimitTier: 'low'
        },
        'auth.me': {
            description: 'Get current user information (alias for session)',
            handler: 'sessionController.session',
            requiresAuth: false,
            rateLimitTier: 'low'
        }
    }
};
