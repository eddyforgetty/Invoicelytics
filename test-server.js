import express from 'express';
import http from 'http';

const app = express();

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('<html><body><h1>InvoiceLyticsBot Test Server</h1><p>Server is running correctly</p></body></html>');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start the server on port 5000
const server = http.createServer(app);
server.listen(5000, '0.0.0.0', () => {
  console.log('Test server is running on port 5000');
});