// A minimal Express server to test that the environment is working correctly
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Basic routes
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>InvoiceLyticsBot Test Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #2563eb; }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            background-color: #f9fafb;
          }
          .success { color: #059669; }
          .danger { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>InvoiceLyticsBot Test Server</h1>
        <div class="card">
          <h2>Server Status</h2>
          <p><strong class="success">✓</strong> Express server is running</p>
          <p>Server time: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="card">
          <h2>Environment Variables</h2>
          <p>NODE_ENV: ${process.env.NODE_ENV || 'not set'}</p>
          <p>Database: ${process.env.DATABASE_URL ? '<strong class="success">✓ Connected</strong>' : '<strong class="danger">✗ Not configured</strong>'}</p>
          <p>Telegram Token: ${process.env.TELEGRAM_TOKEN ? '<strong class="success">✓ Available</strong>' : '<strong class="danger">✗ Not configured</strong>'}</p>
          <p>Stripe Keys: ${process.env.STRIPE_SECRET_KEY ? '<strong class="success">✓ Available</strong>' : '<strong class="danger">✗ Not configured</strong>'}</p>
        </div>
        
        <div class="card">
          <h2>API Test Endpoints</h2>
          <ul>
            <li><a href="/api/ping">/api/ping</a> - Simple API response test</li>
            <li><a href="/api/time">/api/time</a> - Server time JSON response</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Simple API endpoints for testing
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

app.get('/api/time', (req, res) => {
  res.json({ 
    timestamp: Date.now(),
    formatted: new Date().toISOString() 
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${port}`);
});