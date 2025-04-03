// This script is designed to restart the workflow repeatedly if it crashes
// It's a last resort to keep the server running

import { spawn } from 'child_process';
import fs from 'fs';

// Configuration
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds
const LOG_FILE = 'restart-logs.txt';

// Initialize log file
fs.writeFileSync(LOG_FILE, `Restart script started at ${new Date().toISOString()}\n`);

// Function to log to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Function to start the server process
function startServer(attempt = 1) {
  if (attempt > MAX_RETRIES) {
    log(`Maximum retries (${MAX_RETRIES}) reached. Giving up.`);
    return;
  }

  log(`Starting server attempt ${attempt}/${MAX_RETRIES}...`);
  
  // Use tsx to run the TypeScript server code
  const serverProcess = spawn('node', ['--require=tsx/register', 'server/index.ts'], {
    stdio: 'pipe',
    env: { ...process.env, DEBUG: '*' }
  });
  
  // Log process output
  serverProcess.stdout.on('data', (data) => {
    log(`[SERVER] ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    log(`[ERROR] ${data.toString().trim()}`);
  });
  
  // Handle process exit
  serverProcess.on('close', (code) => {
    log(`Server process exited with code ${code}`);
    
    // Restart after delay
    log(`Will attempt restart in ${RETRY_DELAY/1000} seconds...`);
    setTimeout(() => startServer(attempt + 1), RETRY_DELAY);
  });
  
  // Handle process errors
  serverProcess.on('error', (err) => {
    log(`Failed to start server: ${err.message}`);
  });
}

// Start the server for the first time
startServer();

// Handle script termination
process.on('SIGINT', () => {
  log('Script terminated by user (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Script terminated (SIGTERM)');
  process.exit(0);
});

log('Restart script is running... Press Ctrl+C to exit.');