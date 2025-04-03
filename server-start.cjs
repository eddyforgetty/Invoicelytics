// This is a CommonJS module that can be run directly with Node.js
// It's designed to start the server with proper error handling and automatic retries
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
const LOG_FILE = path.join(__dirname, 'server-logs.txt');
const SERVER_SCRIPT = path.join(__dirname, 'server', 'index.ts');

// Initialize log file
fs.writeFileSync(LOG_FILE, `Server startup script initialized at ${new Date().toISOString()}\n`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Check if required environment variables are present
function checkEnvironment() {
  const requiredVars = ['DATABASE_URL', 'TELEGRAM_TOKEN', 'STRIPE_SECRET_KEY'];
  const missingVars = requiredVars.filter(variable => !process.env[variable]);
  
  if (missingVars.length > 0) {
    log(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  } else {
    log('All required environment variables are present');
  }
}

// Function to start the server
function startServer(attempt = 1) {
  if (attempt > MAX_RETRIES) {
    log(`Maximum retries (${MAX_RETRIES}) reached. Exiting.`);
    process.exit(1);
  }
  
  log(`Starting server attempt ${attempt}/${MAX_RETRIES}`);
  checkEnvironment();
  
  // Set enhanced debugging
  const env = {
    ...process.env,
    DEBUG: '*',
    NODE_OPTIONS: '--trace-warnings --trace-uncaught'
  };
  
  // Start the server using tsx (TypeScript executor)
  const serverProcess = spawn('npx', ['tsx', SERVER_SCRIPT], {
    stdio: 'pipe',
    env,
    detached: false
  });
  
  // Handle process output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    log(`[stdout] ${output}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    log(`[stderr] ${output}`);
  });
  
  // Handle process exit
  serverProcess.on('close', (code) => {
    log(`Server process exited with code ${code}`);
    
    if (code !== 0) {
      log(`Will retry in ${RETRY_DELAY_MS/1000} seconds...`);
      setTimeout(() => startServer(attempt + 1), RETRY_DELAY_MS);
    } else {
      log('Server shutdown cleanly. Not restarting.');
    }
  });
  
  // Handle process errors
  serverProcess.on('error', (err) => {
    log(`Failed to start server process: ${err.message}`);
    log(`Will retry in ${RETRY_DELAY_MS/1000} seconds...`);
    setTimeout(() => startServer(attempt + 1), RETRY_DELAY_MS);
  });
  
  // Set up a watchdog timer to detect if the server is hanging
  const watchdog = setTimeout(() => {
    log('Server startup watchdog timer expired. Killing process and retrying...');
    try {
      // Kill the process group
      process.kill(-serverProcess.pid, 'SIGKILL');
    } catch (error) {
      log(`Error killing server process: ${error.message}`);
    }
    
    // Restart the server
    startServer(attempt + 1);
  }, 60000); // 60 second watchdog
  
  // Clear the watchdog if the server exits normally
  serverProcess.on('close', () => {
    clearTimeout(watchdog);
  });
  
  // Return the process for reference
  return serverProcess;
}

// Start the server
try {
  log('Starting server wrapper script');
  startServer();
  
  // Handle script termination signals
  process.on('SIGINT', () => {
    log('Received SIGINT. Shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM. Shutting down gracefully...');
    process.exit(0);
  });
  
  // Handle uncaught exceptions in this script
  process.on('uncaughtException', (error) => {
    log(`Uncaught exception in wrapper script: ${error.message}`);
    log(error.stack);
  });
  
  process.on('unhandledRejection', (reason) => {
    log(`Unhandled promise rejection in wrapper script: ${reason}`);
  });
  
} catch (error) {
  log(`Critical error in wrapper script: ${error.message}`);
  log(error.stack);
  process.exit(1);
}