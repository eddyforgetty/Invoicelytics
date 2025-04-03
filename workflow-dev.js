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
