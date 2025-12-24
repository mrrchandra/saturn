const db = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running username migration...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'add_username_migration.sql'),
            'utf8'
        );

        await db.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
