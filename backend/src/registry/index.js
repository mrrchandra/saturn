const db = require('../core/db');

// Import Module Registries
const authRegistry = require('../modules/auth/auth.registry');
const userRegistry = require('../modules/user/user.registry');
const otpRegistry = require('../modules/otp/otp.registry');
const adminRegistry = require('../modules/admin/admin.registry');
const analyticsRegistry = require('../modules/analytics/analytics.registry');
const integrationsRegistry = require('../modules/integrations/integrations.registry');
const notifyRegistry = require('../modules/notify/notify.registry');
const systemRegistry = require('../modules/system/system.registry');

// Aggregate all functions
const FUNCTION_REGISTRY = {
    ...authRegistry.functions,
    ...userRegistry.functions,
    ...otpRegistry.functions,
    ...adminRegistry.functions,
    ...analyticsRegistry.functions,
    ...integrationsRegistry.functions,
    ...notifyRegistry.functions,
    ...systemRegistry.functions
};

// Rebuild Registry with Domain Injection
const modules = [authRegistry, userRegistry, otpRegistry, adminRegistry, analyticsRegistry, integrationsRegistry, notifyRegistry, systemRegistry];
const AGGREGATED_REGISTRY = {};

modules.forEach(mod => {
    Object.entries(mod.functions).forEach(([funcName, funcConfig]) => {
        AGGREGATED_REGISTRY[funcName] = {
            ...funcConfig,
            domain: mod.domain // Inject domain from module wrapper
        };
    });
});

// Export the aggregated one
const FINAL_REGISTRY = AGGREGATED_REGISTRY;

const syncRegistry = async () => {
    console.log('🔄 Syncing function registry to database...');

    for (const [functionName, config] of Object.entries(FINAL_REGISTRY)) {
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
    return FINAL_REGISTRY[functionName] || null;
};

/**
 * Get all functions by domain
 */
const getFunctionsByDomain = (domain) => {
    return Object.entries(FINAL_REGISTRY)
        .filter(([_, config]) => config.domain === domain)
        .reduce((acc, [name, config]) => {
            acc[name] = config;
            return acc;
        }, {});
};

module.exports = {
    FUNCTION_REGISTRY: FINAL_REGISTRY,
    syncRegistryToDatabase: syncRegistry,
    getFunctionConfig,
    getFunctionsByDomain
};
