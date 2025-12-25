const db = require('../src/config/db');

async function testFunctionToggle() {
    try {
        console.log('🧪 Testing function toggle...\n');

        // Get Saturn Dashboard project
        const project = await db.query(`
            SELECT id, name FROM Projects WHERE name = 'Saturn Dashboard'
        `);

        if (project.rows.length === 0) {
            console.log('❌ Saturn Dashboard project not found');
            process.exit(1);
        }

        const projectId = project.rows[0].id;
        console.log(`Project: ${project.rows[0].name} (ID: ${projectId})\n`);

        // Get auth.login function
        const func = await db.query(`
            SELECT id, function_name FROM FunctionRegistry WHERE function_name = 'auth.login'
        `);

        if (func.rows.length === 0) {
            console.log('❌ auth.login function not found in registry');
            process.exit(1);
        }

        const functionId = func.rows[0].id;
        console.log(`Function: ${func.rows[0].function_name} (ID: ${functionId})\n`);

        // Check current status
        const current = await db.query(`
            SELECT is_enabled FROM ProjectFunctions 
            WHERE project_id = $1 AND function_id = $2
        `, [projectId, functionId]);

        if (current.rows.length === 0) {
            console.log('📝 No entry in ProjectFunctions - function is enabled by default\n');

            // Disable it
            await db.query(`
                INSERT INTO ProjectFunctions (project_id, function_id, is_enabled)
                VALUES ($1, $2, false)
            `, [projectId, functionId]);

            console.log('✅ Disabled auth.login for Saturn Dashboard');
        } else {
            const isEnabled = current.rows[0].is_enabled;
            console.log(`Current status: ${isEnabled ? '✅ ENABLED' : '🔴 DISABLED'}\n`);

            // Toggle it
            await db.query(`
                UPDATE ProjectFunctions 
                SET is_enabled = $1 
                WHERE project_id = $2 AND function_id = $3
            `, [!isEnabled, projectId, functionId]);

            console.log(`✅ Toggled to: ${!isEnabled ? '✅ ENABLED' : '🔴 DISABLED'}`);
        }

        // Verify
        const verify = await db.query(`
            SELECT is_enabled FROM ProjectFunctions 
            WHERE project_id = $1 AND function_id = $2
        `, [projectId, functionId]);

        console.log(`\n🔍 Verified status: ${verify.rows[0].is_enabled ? '✅ ENABLED' : '🔴 DISABLED'}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testFunctionToggle();
