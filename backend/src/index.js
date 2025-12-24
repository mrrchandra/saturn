const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
