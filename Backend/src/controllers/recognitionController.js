const fs = require('fs');
const { runPythonScript } = require('../services/pythonService');
const { PATHS } = require('../config');

const recognize = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const audioFilePath = req.file.path;

    try {
        const result = await runPythonScript(PATHS.PYTHON_SCRIPTS.FALLBACK, [
            audioFilePath, '--json', '--top', '3', '--db', PATHS.DB_SONGS
        ]);

        // Clean up uploaded file
        if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);

        res.json(result);
    } catch (error) {
        if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { recognize };
