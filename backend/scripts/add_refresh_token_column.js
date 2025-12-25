const db = require('../src/config/db');

async function addRefreshTokenColumn() {
    try {
        console.log('🔧 Adding refresh_token column to Users table...\n');

        // Add refresh_token column
        await db.query(`
            ALTER TABLE Users 
            ADD COLUMN IF NOT EXISTS refresh_token TEXT
        `);

        console.log('✅ refresh_token column added successfully!\n');

        // Verify
        const result = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'refresh_token'
        `);

        if (result.rows.length > 0) {
            console.log('✅ Verified: refresh_token column exists');
            console.log(`   Type: ${result.rows[0].data_type}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addRefreshTokenColumn();
