const { spawn } = require('child_process');
const { PATHS } = require('../config');

const runPythonScript = (scriptPath, args, isJson = true) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(PATHS.PYTHON_BIN, [scriptPath, ...args]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            process.stderr.write(data); // Log progress to server console
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0 && !outputData) {
                reject(new Error(`Python script exited with code ${code}: ${errorData}`));
            } else {
                if (isJson) {
                    try {
                        // Sometimes there's noise before JSON, take the last line if multiple
                        const lines = outputData.trim().split('\n');
                        const jsonStr = lines[lines.length - 1];
                        resolve(JSON.parse(jsonStr));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON: ${e.message}\nOutput: ${outputData}`));
                    }
                } else {
                    resolve(outputData);
                }
            }
        });

        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
};

module.exports = { runPythonScript };
