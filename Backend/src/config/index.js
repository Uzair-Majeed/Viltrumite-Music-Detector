const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'viltrumite_secret_key_123',
    PATHS: {
        UPLOADS_DIR: path.join(__dirname, '../../../uploads'),
        DB_SONGS: path.join(__dirname, '../../../Databases/songs.db'),
        DB_USERS: path.join(__dirname, '../../../Databases/users.db'),
        PYTHON_BIN: path.join(__dirname, '../../../AI-Module/venv/bin/python3'),
        AI_MODULE_CORE: path.join(__dirname, '../../../AI-Module/Core'),
        PYTHON_SCRIPTS: {
            FALLBACK: path.join(__dirname, '../../../AI-Module/Inference/fallback.py'),
            USER_ADDER: path.join(__dirname, '../../../AI-Module/Training/user_adder.py'),
        }
    }
};
