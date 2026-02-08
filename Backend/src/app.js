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

// DEBUG: Check Database File Size
app.get('/debug-db', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const dbPath = process.env.DB_SONGS || '/app/Databases/songs.db';

    try {
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            res.json({
                exists: true,
                path: dbPath,
                sizeBytes: stats.size,
                sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                lastModified: stats.mtime
            });
        } else {
            res.json({ exists: false, path: dbPath });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// global error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
    });
});

// Startup Logs
console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------');
console.log('\x1b[35m%s\x1b[0m', '🚀 Viltrumite API Initialization...');
console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------');
console.log('Available Endpoints:');
console.log('\x1b[32m%s\x1b[0m', '  ✅ POST /api/auth/register - User registration');
console.log('\x1b[32m%s\x1b[0m', '  ✅ POST /api/auth/login    - User login');
console.log('\x1b[32m%s\x1b[0m', '  ✅ GET  /api/auth/me       - Get current user info');
console.log('\x1b[32m%s\x1b[0m', '  ✅ GET  /api/stats         - Database statistics');
console.log('\x1b[32m%s\x1b[0m', '  ✅ GET  /api/songs         - List all indexed songs');
console.log('\x1b[32m%s\x1b[0m', '  ✅ POST /api/recognize     - Song recognition (Multipart)');
console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------');

module.exports = app;
