const db = require('../src/config/db');

async function setupProjectCors() {
    try {
        console.log('🔧 Setting up per-project CORS...\n');

        // Add default allowed origins for Saturn Dashboard
        console.log('1. Adding default origins for Saturn Dashboard...');
        const defaultOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000'
        ];

        await db.query(`
            UPDATE Projects 
            SET config = jsonb_set(
                COALESCE(config, '{}'),
                '{allowed_origins}',
                $1::jsonb
            )
            WHERE name = 'Saturn Dashboard'
        `, [JSON.stringify(defaultOrigins)]);

        console.log('   ✅ Default origins added\n');

        // Verify
        const result = await db.query(`
            SELECT id, name, config->'allowed_origins' as allowed_origins
            FROM Projects
            WHERE name = 'Saturn Dashboard'
        `);

        console.log('📊 Saturn Dashboard CORS Config:');
        console.log(`   Origins: ${JSON.stringify(result.rows[0].allowed_origins, null, 2)}`);

        console.log('\n✅ Per-project CORS setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupProjectCors();
