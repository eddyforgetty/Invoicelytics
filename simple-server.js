// Simple static server without complex dependencies
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Parse JSON bodies
app.use(express.json());

// Set up request logging
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: {
      node: process.version,
      platform: process.platform
    }
  });
});

// API routes for diagnostic information
app.get('/api/status', (req, res) => {
  const databaseStatus = process.env.DATABASE_URL ? 'configured' : 'not configured';
  const stripeStatus = process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured';
  const telegramStatus = process.env.TELEGRAM_TOKEN ? 'configured' : 'not configured';
  
  res.json({
    serverStatus: 'running',
    services: {
      database: databaseStatus,
      stripe: stripeStatus,
      telegram: telegramStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Serve static files if they exist
const staticPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(staticPath));

// Simple fallback handler for all other requests
app.use((req, res) => {
  res.send(`
    <html>
      <head>
        <title>InvoiceLyticsBot</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #0066cc; }
          .status { 
            background: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
          }
          .endpoints {
            margin-top: 20px;
          }
          .endpoint {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>InvoiceLyticsBot - Server Running</h1>
        <div class="status">
          <p>Server: <strong>Online</strong></p>
          <p>Path: ${req.path} (Static file not found)</p>
          <p>Current time: ${new Date().toISOString()}</p>
        </div>
        <div class="endpoints">
          <h2>Available Endpoints:</h2>
          <div class="endpoint">
            <a href="/api/health">/api/health</a> - Server health status
          </div>
          <div class="endpoint">
            <a href="/api/status">/api/status</a> - Service configuration status
          </div>
        </div>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error in request processing:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Create and start the server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple diagnostic server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}/api/health - Health check endpoint`);
  console.log(`http://0.0.0.0:${PORT}/api/status - Service status endpoint`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep the process alive
const keepAlive = setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server uptime: ${process.uptime().toFixed(2)} seconds`);
}, 60000);
keepAlive.unref(); // Don't let this timer prevent the process from exiting

process.stdin.resume(); // Keep the process running