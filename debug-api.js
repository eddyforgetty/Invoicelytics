// Direct debug API server to avoid Vite proxy issues
import express from 'express';
import { storage } from './server/storage.js';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: "Debug API server is running", timestamp: new Date().toISOString() });
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    console.log("Fetched all users:", users);
    
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      tier: user.tier,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      currentUsage: user.currentUsage,
      resetDate: user.resetDate,
      password: user.password ? '[REDACTED]' : null,
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

// Get user by email with password debug info
app.get('/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Include password hash for debugging purposes
    const userDetails = {
      ...user,
      passwordFormat: user.password ? {
        format: user.password.includes(':') ? 'salt:hash' : 'unknown',
        length: user.password.length,
        hashParts: user.password.split(':').map(part => ({ part: part.substring(0, 10) + '...', length: part.length }))
      } : null
    };
    
    res.json(userDetails);
  } catch (error) {
    console.error(`Error getting user details:`, error);
    res.status(500).json({ error: "Failed to retrieve user details" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Debug API server running on port ${PORT}`);
});