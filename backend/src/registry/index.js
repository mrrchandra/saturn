const db = require('../config/db');

/**
 * Function Registry - Single source of truth
 * Maps public API names to internal handlers
 */
const FUNCTION_REGISTRY = {
    // Auth domain
    'auth.login': {
        domain: 'auth',
        description: 'User login with email/password',
        handler: 'authController.login',
        requiresAuth: false,
        rateLimitTier: 'medium'
    },
    'auth.register': {
        domain: 'auth',
        description: 'Register new user account',
        handler: 'authController.register',
        requiresAuth: false,
        rateLimitTier: 'medium'
    },
    'auth.logout': {
        domain: 'auth',
        description: 'Logout current user',
        handler: 'authController.logout',
        requiresAuth: true,
        rateLimitTier: 'low'
    },
    'auth.refresh': {
        domain: 'auth',
        description: 'Refresh access token',
        handler: 'authController.refresh',
        requiresAuth: false,
        rateLimitTier: 'medium'
    },
    'auth.forgot-password': {
        domain: 'auth',
        description: 'Request password reset OTP',
        handler: 'authController.forgotPassword',
        requiresAuth: false,
        rateLimitTier: 'high'
    },
    'auth.reset-password': {
        domain: 'auth',
        description: 'Reset password with OTP',
        handler: 'authController.resetPassword',
        requiresAuth: false,
        rateLimitTier: 'high'
    },
    'auth.upload-pfp': {
        domain: 'auth',
        description: 'Upload profile picture',
        handler: 'authController.uploadPFP',
        requiresAuth: true,
        rateLimitTier: 'medium'
    },

    // OTP domain
    'otp.send': {
        domain: 'otp',
        description: 'Send OTP for email verification',
        handler: 'authController.sendOTP',
        requiresAuth: false,
        rateLimitTier: 'critical'
    },
    'otp.verify': {
        domain: 'otp',
        description: 'Verify OTP code',
        handler: 'authController.verifyOTPCode',
        requiresAuth: false,
        rateLimitTier: 'high'
    },

    // User domain
    'user.get': {
        domain: 'user',
        description: 'Get user information',
        handler: 'userController.getUserInfo',
        requiresAuth: false,
        rateLimitTier: 'low'
    },
    'user.details': {
        domain: 'user',
        description: 'Get detailed user info',
        handler: 'userController.getUserDetails',
        requiresAuth: false,
        rateLimitTier: 'low'
    },
    'user.avatar': {
        domain: 'user',
        description: 'Get user avatar',
        handler: 'userController.getAvatar',
        requiresAuth: false,
        rateLimitTier: 'low'
    },
    'user.metadata': {
        domain: 'user',
        description: 'Get user metadata',
        handler: 'userController.getMetadata',
        requiresAuth: false,
        rateLimitTier: 'low'
    }
};

/**
 * Sync registry to database
 */
const syncRegistryToDatabase = async () => {
    console.log('🔄 Syncing function registry to database...');

    for (const [functionName, config] of Object.entries(FUNCTION_REGISTRY)) {
        try {
            await db.query(`
                INSERT INTO FunctionRegistry (domain, function_name, description, handler_path, requires_auth, rate_limit_tier)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (domain, function_name) 
                DO UPDATE SET 
                    description = EXCLUDED.description,
                    handler_path = EXCLUDED.handler_path,
                    requires_auth = EXCLUDED.requires_auth,
                    rate_limit_tier = EXCLUDED.rate_limit_tier,
                    updated_at = NOW()
            `, [
                config.domain,
                functionName,
                config.description,
                config.handler,
                config.requiresAuth,
                config.rateLimitTier
            ]);

            console.log(`  ✓ ${functionName}`);
        } catch (error) {
            console.error(`  ✗ ${functionName}:`, error.message);
        }
    }

    console.log('✅ Registry sync complete!');
};

/**
 * Get function config by name
 */
const getFunctionConfig = (functionName) => {
    return FUNCTION_REGISTRY[functionName] || null;
};

/**
 * Get all functions by domain
 */
const getFunctionsByDomain = (domain) => {
    return Object.entries(FUNCTION_REGISTRY)
        .filter(([_, config]) => config.domain === domain)
        .reduce((acc, [name, config]) => {
            acc[name] = config;
            return acc;
        }, {});
};

module.exports = {
    FUNCTION_REGISTRY,
    syncRegistryToDatabase,
    getFunctionConfig,
    getFunctionsByDomain
};
