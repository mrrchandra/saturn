const integrationsService = require('./integrations.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success, error } = require('../../core/utils/response');

/**
 * Get all projects
 */
exports.getProjects = asyncHandler(async (req, res) => {
    const projects = await integrationsService.getProjects();
    return success(res, projects);
});

/**
 * Add a new project
 */
exports.addProject = asyncHandler(async (req, res) => {
    try {
        const project = await integrationsService.addProject(req.body.name);
        return success(res, project, 'Project created', 201);
    } catch (err) {
        return error(res, err.message, 'Project creation failed', 400);
    }
});

/**
 * Toggle maintenance mode
 */
exports.toggleMaintenance = asyncHandler(async (req, res) => {
    const project = await integrationsService.toggleMaintenance(req.params.id, req.body.is_maintenance);
    if (!project) {
        return error(res, 'Project not found', 'Project does not exist', 404);
    }
    return success(res, project, 'Maintenance mode updated');
});

/**
 * Delete a project
 */
exports.deleteProject = asyncHandler(async (req, res) => {
    const deleted = await integrationsService.deleteProject(req.params.id);
    if (!deleted) {
        return error(res, 'Project not found', 'Project does not exist', 404);
    }
    return success(res, null, 'Project deleted successfully');
});
