console.log('Starting server with custom bootstrap process...');
import { exec } from 'child_process';

// Start the server using tsx directly
exec('npx tsx server/index.ts', { stdio: 'inherit' }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Execution error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});