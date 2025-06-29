const { spawn } = require('child_process');
const path = require('path');

// Start Python Flask server
const pythonProcess = spawn('python', ['ml_models/flare_predictor/app.py'], {
    stdio: 'inherit'
});

pythonProcess.on('error', (err) => {
    console.error('Failed to start Python server:', err);
});

// Start the Express server
const expressServer = spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    shell: true
});

// Log any errors
expressServer.on('error', (err) => {
    console.error('Failed to start Express server:', err);
});

// Handle server exit
expressServer.on('close', (code) => {
    if (code !== 0) {
        console.log(`Express server process exited with code ${code}`);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    pythonProcess.kill();
    expressServer.kill();
    process.exit();
});

process.on('SIGTERM', () => {
    pythonProcess.kill();
    expressServer.kill();
    process.exit();
}); 