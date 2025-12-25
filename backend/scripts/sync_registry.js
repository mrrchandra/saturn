const { syncRegistryToDatabase } = require('../src/registry');

async function syncRegistry() {
    try {
        console.log('🚀 Starting registry sync...\n');
        await syncRegistryToDatabase();
        console.log('\n✅ All functions registered!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Registry sync failed:', error);
        process.exit(1);
    }
}

syncRegistry();
