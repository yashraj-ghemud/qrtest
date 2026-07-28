// Wrapper for standalone server with proper port binding
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log(`🚀 Starting server on ${HOSTNAME}:${PORT}`);
console.log(`📁 Working directory: ${process.cwd()}`);

// Set environment variables for standalone server
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

// Start standalone server
const serverPath = path.join(__dirname, '.next/standalone/server.js');
console.log(`📄 Server path: ${serverPath}`);

const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: {
        ...process.env,
        PORT,
        HOSTNAME,
    },
});

server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down...');
    server.kill('SIGINT');
});
