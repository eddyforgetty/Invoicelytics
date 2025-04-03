// Use ES module syntax
import express from 'express';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());

// Basic middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the client/dist directory
app.use(express.static(join(__dirname, 'client', 'dist')));

// Add a catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

// Create and start the server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep the server running
process.stdin.resume();