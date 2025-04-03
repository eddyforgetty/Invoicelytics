#!/bin/bash
# Script to update the workflow configuration

# Check if the workflow file exists
if [ ! -f "workflow-dev.js" ]; then
  echo "Error: workflow-dev.js not found!"
  exit 1
fi

# Create a backup of the original file
cp workflow-dev.js workflow-dev.js.backup

# Update the file to use our resilient server startup script
cat > workflow-dev.js << 'EOL'
import { spawn } from "child_process";

function timestamp() {
  return new Date().toLocaleTimeString();
}

function createOutputHandler(prefix, isError = false) {
  const stream = isError ? process.stderr : process.stdout;
  return data => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        stream.write(`${timestamp()} [${prefix}] ${line}\n`);
      }
    }
  };
}

function startServer() {
  console.log(`${timestamp()} Starting server with resilient startup script...`);
  
  const serverProcess = spawn('node', ['server-start.cjs'], {
    stdio: 'pipe',
    env: { ...process.env }
  });
  
  serverProcess.stdout.on('data', createOutputHandler('server'));
  serverProcess.stderr.on('data', createOutputHandler('server', true));
  
  serverProcess.on('close', code => {
    console.log(`${timestamp()} Server process exited with code ${code}`);
    process.exit(code);
  });
  
  return serverProcess;
}

function main() {
  const server = startServer();
  
  function cleanup() {
    console.log(`${timestamp()} Shutting down server...`);
    server.kill();
  }
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();
EOL

echo "Workflow script updated to use the resilient server startup script."
echo "The original file has been backed up as workflow-dev.js.backup"