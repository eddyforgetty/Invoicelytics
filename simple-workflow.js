// This is a simplified workflow script that just runs our server
const { spawn } = require('child_process');

// Create a simple timestamp function for logging
function getTimestamp() {
  return new Date().toLocaleTimeString();
}

console.log(`${getTimestamp()} Starting server application...`);

// Create the server process
const serverProcess = spawn('node', ['--experimental-specifier-resolution=node', '--es-module-specifier-resolution=node', 'server/index.js'], {
  stdio: 'inherit',
  env: process.env
});

// Log process exit
serverProcess.on('exit', (code) => {
  console.log(`${getTimestamp()} Server process exited with code ${code}`);
});

// Handle process signals
process.on('SIGINT', () => {
  console.log(`${getTimestamp()} Received SIGINT signal, shutting down...`);
  serverProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`${getTimestamp()} Received SIGTERM signal, shutting down...`);
  serverProcess.kill();
  process.exit(0);
});