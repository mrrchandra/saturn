const db = require('../src/config/db');
require('dotenv').config();

const migrate = async () => {
    try {
        console.log('Starting migration...');

        // 1. Create Users Table FIRST (Fresh Install Support)
        await db.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                oauth_provider VARCHAR(50),
                oauth_id VARCHAR(255),
                avatar_url TEXT,
                metadata JSONB DEFAULT '{}',
                site_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created Users table');

        // 2. Add role column to Users if it (somehow) exists but missing column (Legacy Support)
        await db.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users') AND 
                   NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN 
                    ALTER TABLE Users ADD COLUMN role VARCHAR(20) DEFAULT 'user'; 
                END IF; 
            END $$;
        `);
        console.log('Verified Users table schema');

        // 3. Create Projects table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                api_key VARCHAR(255) UNIQUE NOT NULL,
                is_maintenance BOOLEAN DEFAULT FALSE,
                config JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created Projects table');

        // 4. Create SiteSettings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS SiteSettings (
                id SERIAL PRIMARY KEY,
                project_name VARCHAR(255) DEFAULT 'Saturn Platform',
                maintenance_mode BOOLEAN DEFAULT FALSE,
                config_json JSONB DEFAULT '{}',
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created SiteSettings table');

        // 5. Create AuthTokens table
        await db.query(`
            CREATE TABLE IF NOT EXISTS AuthTokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                expires_at TIMESTAMP
            );
        `);
        console.log('Checked/Created AuthTokens table');

        // 6. Create Analytics Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Analytics (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
                event_type VARCHAR(100) NOT NULL,
                site_name VARCHAR(100),
                timestamp TIMESTAMP DEFAULT NOW(),
                meta JSONB DEFAULT '{}'
            );
        `);
        console.log('Checked/Created Analytics table');

        // 7. Create Notifications Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS Notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL, -- 'push', 'email'
                status VARCHAR(20) NOT NULL, -- 'sent', 'failed'
                payload JSONB,
                timestamp TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created Notifications table');

        // 8. Create AdminLogs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS AdminLogs (
                id SERIAL PRIMARY KEY,
                admin_user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
                action_type VARCHAR(100) NOT NULL,
                target_user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
                meta JSONB DEFAULT '{}',
                timestamp TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Checked/Created AdminLogs table');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
