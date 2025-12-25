const db = require('../src/config/db');

async function fixMaintenanceMode() {
    try {
        console.log('🔧 Fixing maintenance mode...\n');

        // Turn off maintenance for all projects
        const result = await db.query(`
            UPDATE Projects 
            SET is_maintenance = false 
            WHERE is_maintenance = true
            RETURNING id, name, is_maintenance
        `);

        if (result.rows.length === 0) {
            console.log('✅ No projects in maintenance mode');
        } else {
            console.log(`✅ Fixed ${result.rows.length} project(s):\n`);
            result.rows.forEach(project => {
                console.log(`  - ${project.name} (ID: ${project.id}) - Maintenance: ${project.is_maintenance}`);
            });
        }

        // Show all projects status
        const all = await db.query('SELECT id, name, is_maintenance FROM Projects ORDER BY id');
        console.log('\n📊 All Projects Status:');
        all.rows.forEach(p => {
            console.log(`  ${p.id}. ${p.name} - Maintenance: ${p.is_maintenance ? '🔴 ON' : '✅ OFF'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixMaintenanceMode();
