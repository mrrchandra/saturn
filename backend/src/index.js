const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const projectContext = require('./middleware/projectContext');
const projectCors = require('./middleware/projectCors');

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/user', require('./routes/user'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notify', require('./routes/notify'));
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api', require('./routes/api'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global Error Handler (MUST BE LAST)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
