// ESM module compatible workflow script for Telegram Invoicing Bot
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// Helper for consistent timestamp formatting
function timestamp() {
  return new Date().toLocaleTimeString();
}

// Output handler generator
function createOutputHandler(prefix, isError = false) {
  const stream = isError ? process.stderr : process.stdout;
  return (data) => {
    const text = data.toString().trim();
    if (text) {
      const lines = text.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          stream.write(`${timestamp()} [${prefix}] ${line}\n`);
        }
      });
    }
  };
}

// Main server starter function with retry logic
function startServer(attempt = 1) {
  if (attempt > MAX_RETRIES) {
    console.error(`${timestamp()} Maximum retries (${MAX_RETRIES}) reached. Exiting.`);
    process.exit(1);
  }
  
  console.log(`${timestamp()} Starting server attempt ${attempt}/${MAX_RETRIES}`);
  
  // Start the server using tsx for TypeScript execution
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'pipe',
    env: { ...process.env }
  });
  
  // Set up output handlers
  serverProcess.stdout.on('data', createOutputHandler('server'));
  serverProcess.stderr.on('data', createOutputHandler('server', true));
  
  // Handle server process exit
  serverProcess.on('close', (code) => {
    console.log(`${timestamp()} Server process exited with code ${code}`);
    
    if (code !== 0 && code !== null) {
      console.log(`${timestamp()} Will retry in ${RETRY_DELAY_MS/1000} seconds...`);
      setTimeout(() => startServer(attempt + 1), RETRY_DELAY_MS);
    }
  });
  
  // Handle process errors
  serverProcess.on('error', (err) => {
    console.error(`${timestamp()} Failed to start server process: ${err.message}`);
    console.log(`${timestamp()} Will retry in ${RETRY_DELAY_MS/1000} seconds...`);
    setTimeout(() => startServer(attempt + 1), RETRY_DELAY_MS);
  });
  
  return serverProcess;
}

// Start the server and set up graceful shutdown
function main() {
  console.log(`${timestamp()} Starting Telegram Invoicing Bot workflow`);
  const server = startServer();
  
  function cleanup() {
    console.log(`${timestamp()} Shutting down server...`);
    server.kill();
  }
  
  // Handle termination signals
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Handle uncaught errors in this script
  process.on('uncaughtException', (error) => {
    console.error(`${timestamp()} Uncaught exception in workflow script: ${error.message}`);
    console.error(error.stack);
    cleanup();
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error(`${timestamp()} Unhandled promise rejection in workflow script: ${reason}`);
    cleanup();
  });
}

// Start everything
main();