const db = require('../src/config/db');

async function checkAndFixMaintenance() {
    try {
        console.log('🔍 Checking all projects...\n');

        const result = await db.query(`
            SELECT id, name, api_key, is_maintenance 
            FROM Projects 
            ORDER BY id
        `);

        console.log('📊 Current Projects:\n');
        result.rows.forEach(p => {
            const status = p.is_maintenance ? '🔴 MAINTENANCE' : '✅ ACTIVE';
            console.log(`  ${p.id}. ${p.name}`);
            console.log(`     API Key: ${p.api_key}`);
            console.log(`     Status: ${status}\n`);
        });

        // Turn off maintenance for ALL projects
        await db.query('UPDATE Projects SET is_maintenance = false');

        console.log('✅ Turned off maintenance mode for ALL projects!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAndFixMaintenance();
