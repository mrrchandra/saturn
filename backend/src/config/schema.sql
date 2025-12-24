-- Saturn Platform Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user'
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}',
    site_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AuthTokens Table
CREATE TABLE IF NOT EXISTS AuthTokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'access', 'refresh', 'fcm_token'
    expires_at TIMESTAMP
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS Analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    site_name VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW(),
    meta JSONB DEFAULT '{}'
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'push', 'email'
    status VARCHAR(20) NOT NULL, -- 'sent', 'failed'
    payload JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- AdminLogs Table
CREATE TABLE IF NOT EXISTS AdminLogs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    target_user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    meta JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS Projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    is_maintenance BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- SiteSettings Table
CREATE TABLE IF NOT EXISTS SiteSettings (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) DEFAULT 'Saturn Platform',
    maintenance_mode BOOLEAN DEFAULT FALSE, -- Platform-wide maintenance
    config_json JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);
