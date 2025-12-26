const db = require('../core/db');

// Import Module Registries
const authRegistry = require('../modules/auth/auth.registry');
const userRegistry = require('../modules/user/user.registry');
const otpRegistry = require('../modules/otp/otp.registry');

// Aggregate all functions
const FUNCTION_REGISTRY = {
    ...authRegistry.functions,
    ...userRegistry.functions,
    ...otpRegistry.functions
};

/**
 * Sync registry to database
 */
const syncRegistryToDatabase = async () => {
    console.log('🔄 Syncing function registry to database...');

    for (const [functionName, config] of Object.entries(FUNCTION_REGISTRY)) {
        try {
            // Determine domain from config or fallback (though config has it implicitly via structure, 
            // the object structure in registry files is: { domain: '...', functions: { 'name': { ... } } }
            // Wait, in my aggregation above `...authRegistry.functions`:
            // `authRegistry.functions` is `{ 'auth.login': { ... } }`.
            // The individual function config inside `auth.registry.js` DOES NOT have `domain` property inside the function object!
            // It was `module.exports = { domain: 'auth', functions: { ... } }`.
            // Inside `functions`, the objects have `description`, `handler`, etc. but NOT `domain`.
            // The Main Registry had `domain: 'auth'` inside each entry.
            // I need to inject the domain during aggregation or update the sub-registries.
            // Aggregation injection is cleaner.

            // Let's refactor the aggregation loops slightly or use the sub variables.
            // BUT for this specific file write, I can just map them before spreading?
            // Or handle it in the Sync function?
            // `FUNCTION_REGISTRY` is used by `getFunctionConfig` lookup. Usually domain isn't needed for lookup.
            // But `syncRegistryToDatabase` NEEDS `domain` for the INSERT statement.
            // `getFunctionsByDomain` NEEDS `domain` property.

            // Re-Strategy: Build the registry properly with domain injection.
        } catch (error) {
            console.error(`  ✗ ${functionName}:`, error.message);
        }
    }
};

// Rebuild Registry with Domain Injection
const modules = [authRegistry, userRegistry, otpRegistry];
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
