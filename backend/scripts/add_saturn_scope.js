const db = require('../src/config/db');

async function addSaturnScope() {
    try {
        console.log('🔧 Adding Saturn Platform scope...\n');

        // Add is_saturn_platform column
        console.log('1. Adding is_saturn_platform column to Projects...');
        await db.query(`
            ALTER TABLE Projects 
            ADD COLUMN IF NOT EXISTS is_saturn_platform BOOLEAN DEFAULT false
        `);
        console.log('   ✅ Column added\n');

        // Mark Saturn Dashboard as the platform
        console.log('2. Marking Saturn Dashboard as platform project...');
        const result = await db.query(`
            UPDATE Projects 
            SET is_saturn_platform = true 
            WHERE name = 'Saturn Dashboard'
            RETURNING id, name, is_saturn_platform
        `);

        if (result.rows.length > 0) {
            console.log('   ✅ Saturn Dashboard marked as platform project\n');
        } else {
            console.log('   ⚠️  Saturn Dashboard not found - you may need to create it\n');
        }

        // Show all projects
        const all = await db.query(`
            SELECT id, name, is_saturn_platform 
            FROM Projects 
            ORDER BY id
        `);

        console.log('📊 All Projects:');
        all.rows.forEach(p => {
            const badge = p.is_saturn_platform ? '🌟 PLATFORM' : '📦 Tenant';
            console.log(`  ${p.id}. ${p.name} - ${badge}`);
        });

        console.log('\n✅ Saturn scope setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addSaturnScope();
