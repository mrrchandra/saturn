const { error } = require('../utils/response');

/**
 * Global Error Handling Middleware
 */
module.exports = (err, req, res, next) => {
    console.error('Stack Trace:', err.stack);

    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return error(res, err.errors || message, message, status);
};
