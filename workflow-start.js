const { spawn } = require('child_process');
const path = require('path');

// Record start time
const startTime = new Date();
console.log(`Starting application at ${startTime.toISOString()}`);

// Helper function to create formatted timestamps
function timestamp() {
  return new Date().toLocaleTimeString();
}

// Create a function to handle process output with prefixes
function createOutputHandler(prefix, isError = false) {
  return function(data) {
    const stream = isError ? process.stderr : process.stdout;
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        stream.write(`[${timestamp()}] [${prefix}] ${line}\n`);
      }
    }
  };
}

// Function to start a process with proper output handling
function startProcess(command, args, name) {
  console.log(`[${timestamp()}] Starting ${name}...`);
  
  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: true }
  });
  
  proc.stdout.on('data', createOutputHandler(name));
  proc.stderr.on('data', createOutputHandler(name, true));
  
  proc.on('close', (code) => {
    if (code !== 0) {
      console.error(`[${timestamp()}] ${name} process exited with code ${code}`);
    } else {
      console.log(`[${timestamp()}] ${name} process exited normally`);
    }
  });
  
  proc.on('error', (err) => {
    console.error(`[${timestamp()}] Failed to start ${name}: ${err.message}`);
  });
  
  return proc;
}

// Start server with a retry mechanism
let serverAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

function startServer() {
  if (serverAttempts >= MAX_RETRY_ATTEMPTS) {
    console.error(`[${timestamp()}] Server failed to start after ${MAX_RETRY_ATTEMPTS} attempts. Giving up.`);
    return;
  }
  
  serverAttempts++;
  console.log(`[${timestamp()}] Starting server (attempt ${serverAttempts}/${MAX_RETRY_ATTEMPTS})...`);
  
  const serverProcess = startProcess('node', ['--require=tsx/register', 'server/index.ts'], 'SERVER');
  
  serverProcess.on('close', (code) => {
    if (code !== 0 && serverAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`[${timestamp()}] Server exited with code ${code}. Retrying in 5 seconds...`);
      setTimeout(startServer, 5000);
    }
  });
}

// Setup a basic health check to keep the process alive
function setupHealthCheck() {
  const healthCheck = setInterval(() => {
    const uptime = Math.floor((new Date() - startTime) / 1000);
    console.log(`[${timestamp()}] Health check: Application running for ${uptime} seconds`);
  }, 30000); // Log every 30 seconds
  
  // Prevent the script from exiting while healthCheck is running
  healthCheck.unref();
}

// Start the server
startServer();

// Setup health check to keep the process alive
setupHealthCheck();

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log(`[${timestamp()}] Received SIGINT. Shutting down...`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[${timestamp()}] Received SIGTERM. Shutting down...`);
  process.exit(0);
});

// Keep the main process running
console.log(`[${timestamp()}] Main process running with PID ${process.pid}`);