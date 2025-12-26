const systemService = require('./system.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success } = require('../../core/utils/response');

/**
 * Get global stats
 */
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await systemService.getGlobalStats();
    return success(res, stats);
});

/**
 * Get recent activity
 */
exports.getRecentActivity = asyncHandler(async (req, res) => {
    const activity = await systemService.getRecentActivity();
    return success(res, activity);
});/**
 * Get function registry for documentation
 */
exports.getRegistry = asyncHandler(async (req, res) => {
    const { FUNCTION_REGISTRY } = require('../../registry');
    return success(res, FUNCTION_REGISTRY);
});
