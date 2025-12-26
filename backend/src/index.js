const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const projectContext = require('./middleware/projectContext');
const projectCors = require('./middleware/projectCors');

const { syncRegistryToDatabase } = require('./registry');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize System
const startServer = async () => {
    try {
        await syncRegistryToDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Critical failure during startup:', error);
        process.exit(1);
    }
};

startServer();

// Trust proxy - required for rate limiting behind proxies
app.set('trust proxy', 1);


app.use(express.json());
app.use(cookieParser());

// Project Context Middleware (Phase 1 - Control Plane)
app.use(projectContext);

// Per-Project CORS (Phase 1.5 - Security)
app.use(projectCors);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Saturn Platform API is running' });
});

// Modular Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/user', require('./modules/user/user.routes'));
app.use('/api/otp', require('./modules/otp/otp.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/notify', require('./modules/notify/notify.routes'));
app.use('/api/integrations', require('./modules/integrations/integrations.routes'));
app.use('/api', require('./modules/system/system.routes'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler (MUST BE LAST)
app.use(errorHandler);

