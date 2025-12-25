-- Phase 1: Function Registry Schema
-- Date: 2025-12-25

-- Function Registry: Single source of truth for all functions
CREATE TABLE IF NOT EXISTS FunctionRegistry (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(50) NOT NULL,
    function_name VARCHAR(100) NOT NULL,
    description TEXT,
    handler_path VARCHAR(255),
    is_public BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    rate_limit_tier VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(domain, function_name)
);

-- Project Functions: Which functions are enabled per project
CREATE TABLE IF NOT EXISTS ProjectFunctions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES Projects(id) ON DELETE CASCADE,
    function_id INTEGER REFERENCES FunctionRegistry(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    custom_rate_limit INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, function_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_function_registry_domain ON FunctionRegistry(domain);
CREATE INDEX IF NOT EXISTS idx_function_registry_name ON FunctionRegistry(function_name);
CREATE INDEX IF NOT EXISTS idx_project_functions_project ON ProjectFunctions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_functions_enabled ON ProjectFunctions(is_enabled);

-- Add feature_flags to Projects if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='projects' AND column_name='feature_flags'
    ) THEN 
        ALTER TABLE Projects ADD COLUMN feature_flags JSONB DEFAULT '{}';
    END IF; 
END $$;
