const db = require('../src/config/db');

async function checkProjects() {
    try {
        console.log('📊 Checking Projects in database...\n');

        const result = await db.query('SELECT id, name, api_key, is_maintenance, created_at FROM Projects ORDER BY id');

        if (result.rows.length === 0) {
            console.log('❌ No projects found in database!');
        } else {
            console.log(`✅ Found ${result.rows.length} project(s):\n`);
            result.rows.forEach(project => {
                console.log(`  ID: ${project.id}`);
                console.log(`  Name: ${project.name}`);
                console.log(`  API Key: ${project.api_key}`);
                console.log(`  Maintenance: ${project.is_maintenance}`);
                console.log(`  Created: ${project.created_at}`);
                console.log('  ---');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkProjects();
