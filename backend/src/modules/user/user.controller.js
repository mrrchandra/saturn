const userService = require('./user.service');
const asyncHandler = require('../../core/utils/asyncHandler');
const { success, error } = require('../../core/utils/response');

/**
 * Get basic request info
 */
exports.getUserInfo = asyncHandler(async (req, res) => {
    const user = await userService.getUserInfo(req.params.id);
    if (!user) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }
    return success(res, user);
});

/**
 * Get detailed request info
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
    const user = await userService.getUserDetails(req.params.id);
    if (!user) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }
    return success(res, user);
});

/**
 * Get user avatar
 */
exports.getAvatar = asyncHandler(async (req, res) => {
    const avatarUrl = await userService.getAvatar(req.params.id);
    if (avatarUrl === undefined) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }
    return success(res, { avatar_url: avatarUrl });
});

/**
 * Get user metadata
 */
exports.getMetadata = asyncHandler(async (req, res) => {
    const metadata = await userService.getMetadata(req.params.id);
    if (metadata === undefined) {
        return error(res, 'User not found', 'Account does not exist', 404);
    }
    return success(res, metadata);
});
