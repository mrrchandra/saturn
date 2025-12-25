/**
 * Function Gate Middleware
 * Controls access to functions based on project configuration
 */
const functionGate = (functionName) => {
    return (req, res, next) => {
        // Project context is required
        if (!req.project) {
            return res.status(401).json({
                success: false,
                message: 'API key required'
            });
        }

        // Check if function is enabled for this project
        const functionConfig = req.project.enabledFunctions[functionName];

        if (!functionConfig) {
            // Function not in registry - deny
            return res.status(404).json({
                success: false,
                message: `Function '${functionName}' not found in registry`
            });
        }

        if (!functionConfig.enabled) {
            // Function disabled for this project
            return res.status(403).json({
                success: false,
                message: `Function '${functionName}' is disabled for this project`,
                function: functionName,
                project: req.project.name
            });
        }

        // Function is enabled - attach function name to request for analytics
        req.functionName = functionName;

        next();
    };
};

module.exports = functionGate;
