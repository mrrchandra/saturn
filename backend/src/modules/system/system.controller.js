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
});
