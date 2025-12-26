module.exports = {
    domain: 'integrations',
    functions: {
        'integrations.list-projects': {
            description: 'List all registered projects',
            handler: 'integrationsController.getProjects',
            requiresAuth: true,
            rateLimitTier: 'low'
        },
        'integrations.add-project': {
            description: 'Create a new project integration',
            handler: 'integrationsController.addProject',
            requiresAuth: true,
            rateLimitTier: 'medium'
        },
        'integrations.toggle-maintenance': {
            description: 'Toggle maintenance mode for a project',
            handler: 'integrationsController.toggleMaintenance',
            requiresAuth: true,
            rateLimitTier: 'medium'
        },
        'integrations.delete-project': {
            description: 'Delete a project integration',
            handler: 'integrationsController.deleteProject',
            requiresAuth: true,
            rateLimitTier: 'medium'
        }
    }
};
