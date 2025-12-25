const db = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🚀 Running Phase 1 migration...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'phase1_function_registry.sql'),
            'utf8'
        );

        await db.query(migrationSQL);

        console.log('✅ Phase 1 migration completed successfully!');
        console.log('   - FunctionRegistry table created');
        console.log('   - ProjectFunctions table created');
        console.log('   - Indexes created');
        console.log('   - Projects.feature_flags added');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
