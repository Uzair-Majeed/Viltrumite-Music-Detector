const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'viltrumite_secret_key_123',
    PATHS: {
        UPLOADS_DIR: process.env.UPLOADS_DIR || path.join(__dirname, '../../../uploads'),
        DB_SONGS: process.env.DB_SONGS || path.join(__dirname, '../../../Databases/songs.db'),
        DB_USERS: process.env.DB_USERS || path.join(__dirname, '../../../Databases/users.db'),
        PYTHON_BIN: process.env.PYTHON_BIN || path.join(__dirname, '../../../AI-Module/venv/bin/python3'),
        AI_MODULE_CORE: process.env.AI_MODULE_CORE || path.join(__dirname, '../../../AI-Module/Core'),
        PYTHON_SCRIPTS: {
            FALLBACK: process.env.PYTHON_FALLBACK || path.join(__dirname, '../../../AI-Module/Inference/fallback.py'),
            USER_ADDER: process.env.PYTHON_USER_ADDER || path.join(__dirname, '../../../AI-Module/Training/user_adder.py'),
        }
    }
};
