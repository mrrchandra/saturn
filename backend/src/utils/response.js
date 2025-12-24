/**
 * Consistent API Response Helper
 */
exports.success = (res, data, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data,
        error: null
    });
};

exports.error = (res, error, message = 'Error', status = 500) => {
    return res.status(status).json({
        success: false,
        message,
        data: null,
        error: error || message
    });
};
