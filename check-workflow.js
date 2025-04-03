// This is a diagnostic script to check the workflow status
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple Express server to report diagnostics
const app = express();

// Check package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('✅ package.json loaded successfully');
} catch (error) {
  console.error('❌ Error loading package.json:', error.message);
  packageJson = { dependencies: {}, scripts: {} };
}

// Check environment variables
console.log('\nEnvironment Variables Check:');
const requiredEnvVars = [
  'DATABASE_URL', 
  'TELEGRAM_TOKEN', 
  'STRIPE_SECRET_KEY', 
  'VITE_STRIPE_PUBLIC_KEY'
];
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} is set`);
  } else {
    console.log(`❌ ${envVar} is missing`);
  }
}

// Check project structure
console.log('\nProject Structure Check:');
const requiredDirs = ['client', 'server', 'shared'];
for (const dir of requiredDirs) {
  if (fs.existsSync(path.join(__dirname, dir))) {
    console.log(`✅ ${dir} directory exists`);
  } else {
    console.log(`❌ ${dir} directory missing`);
  }
}

// Check critical files
console.log('\nCritical Files Check:');
const criticalFiles = [
  'server/index.ts',
  'server/routes.ts',
  'server/bot.ts',
  'server/storage.ts',
  'shared/schema.ts'
];
for (const file of criticalFiles) {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
}

// Display routes diagnostic endpoint
app.get('/api/diagnostics', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'not set'
    },
    modules: {
      packageJsonValid: !!packageJson,
      dependencies: Object.keys(packageJson.dependencies || {})
    },
    requiredEnvVars: requiredEnvVars.map(envVar => ({
      name: envVar, 
      set: !!process.env[envVar]
    }))
  });
});

// Start the server
const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nDiagnostic server running at http://0.0.0.0:${PORT}/api/diagnostics`);
  console.log('Press Ctrl+C to exit');
});

// Keep process alive
process.stdin.resume();