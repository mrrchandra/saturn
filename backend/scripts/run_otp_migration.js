const db = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running OTP table migration...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'add_otp_table_migration.sql'),
            'utf8'
        );

        await db.query(migrationSQL);

        console.log('✅ OTP table migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
