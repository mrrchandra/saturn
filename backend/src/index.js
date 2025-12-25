const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const errorHandler = require('./middleware/error');
const projectContext = require('./middleware/projectContext');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - required for rate limiting behind proxies
app.set('trust proxy', 1);

// CORS - allow credentials from frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Project Context Middleware (Phase 1 - Control Plane)
app.use(projectContext);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Saturn Platform API is running' });
});

// Modular Routes
app.use('/api/auth', require('./routes/auth'));
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
