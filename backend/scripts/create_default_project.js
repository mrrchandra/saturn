const db = require('../src/config/db');

async function createDefaultProject() {
    try {
        console.log('🚀 Creating default test project...');

        // Check if project already exists
        const existing = await db.query(
            "SELECT id FROM Projects WHERE name = 'Saturn Dashboard'"
        );

        if (existing.rows.length > 0) {
            console.log('✅ Default project already exists!');
            console.log(`   Project ID: ${existing.rows[0].id}`);
            console.log(`   API Key: saturn-dashboard-key-2024`);
            process.exit(0);
            return;
        }

        // Create default project
        const result = await db.query(`
            INSERT INTO Projects (name, api_key, is_maintenance, feature_flags, config)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, api_key
        `, [
            'Saturn Dashboard',
            'saturn-dashboard-key-2024',
            false,
            JSON.stringify({}),
            JSON.stringify({})
        ]);

        const project = result.rows[0];

        console.log('✅ Default project created!');
        console.log(`   Project ID: ${project.id}`);
        console.log(`   Name: ${project.name}`);
        console.log(`   API Key: ${project.api_key}`);
        console.log('\n📝 Add to frontend .env:');
        console.log(`   VITE_API_KEY=saturn-dashboard-key-2024`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create default project:', error);
        process.exit(1);
    }
}

createDefaultProject();
