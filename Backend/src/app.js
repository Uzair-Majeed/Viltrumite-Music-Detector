const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const recognitionRoutes = require('./routes/recognition');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', songRoutes);
app.use('/api', recognitionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Viltrumite API is running',
        timestamp: new Date().toISOString()
    });
});

// global error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
    });
});

module.exports = app;
