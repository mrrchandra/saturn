const analyticsService = require('./analytics.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success } = require('../../core/utils/response');

/**
 * Get authentication attempts
 */
exports.getAuthAttempts = asyncHandler(async (req, res) => {
    const attempts = await analyticsService.getAuthAttempts(req.query.site_name);
    return success(res, attempts);
});

/**
 * Get users registered
 */
exports.getUsersRegistered = asyncHandler(async (req, res) => {
    const registrations = await analyticsService.getUsersRegistered(req.query.site_name);
    return success(res, registrations);
});
