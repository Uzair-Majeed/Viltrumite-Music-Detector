const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PATHS } = require('../config');

// Ensure uploads directory exists
if (!fs.existsSync(PATHS.UPLOADS_DIR)) {
    fs.mkdirSync(PATHS.UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PATHS.UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
            'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4',
            'audio/x-m4a', 'video/mp4'
        ];

        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|m4a|webm|mp4)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

module.exports = upload;
