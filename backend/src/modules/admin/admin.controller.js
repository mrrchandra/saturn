const adminService = require('./admin.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success, error } = require('../../core/utils/response');

/**
 * List all users
 */
exports.listUsers = asyncHandler(async (req, res) => {
    const users = await adminService.listUsers(req.query.site_name);
    return success(res, users);
});

/**
 * Update user (Admin action)
 */
exports.updateUser = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, req.body, req.user?.id);
    if (!user) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }
    return success(res, { user }, 'User updated successfully');
});

/**
 * Delete user (Admin action)
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const deleted = await adminService.deleteUser(req.params.id, req.user?.id);
    if (!deleted) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }
    return success(res, null, 'User deleted successfully');
});

/**
 * Get site settings
 */
exports.getSiteSettings = asyncHandler(async (req, res) => {
    const settings = await adminService.getSiteSettings();
    return success(res, { settings });
});

/**
 * Update site settings
 */
exports.updateSiteSettings = asyncHandler(async (req, res) => {
    const settings = await adminService.updateSiteSettings(req.body);
    return success(res, { settings }, 'Site settings updated');
});

/**
 * Functions & Registry
 */
exports.getAllFunctions = asyncHandler(async (req, res) => {
    const functions = await adminService.getAllFunctions();
    return success(res, functions);
});

exports.getProjectFunctions = asyncHandler(async (req, res) => {
    const functions = await adminService.getProjectFunctions(req.params.projectId);
    return success(res, functions);
});

exports.toggleProjectFunction = asyncHandler(async (req, res) => {
    const result = await adminService.toggleProjectFunction(req.params.projectId, req.params.functionId, req.body.is_enabled);
    return success(res, result, 'Function status updated');
});

exports.updateProjectOrigins = asyncHandler(async (req, res) => {
    const project = await adminService.updateProjectOrigins(req.params.projectId, req.body.origins);
    if (!project) {
        return error(res, 'Project not found', 'The requested project does not exist', 404);
    }
    return success(res, project, 'Allowed origins updated');
});
