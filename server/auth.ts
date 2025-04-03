import { Express } from "express";
import session from "express-session";
import MemoryStore from 'memorystore';
import { storage } from "./storage";
import { User } from "@shared/schema";

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string; email: string; };
    authenticated?: boolean;
  }
}

export function setupAuth(app: Express) {
  // Set up session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: 'invoicelyticsbot-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }, // 24 hours
    store: new SessionStore({ checkPeriod: 86400000 }) // prune expired entries every 24h
  }));

  // Login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      // Compare password (in a real app, we'd use bcrypt to hash and compare)
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      // Store user info in session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
      };
      req.session.authenticated = true;
      
      return res.json({ 
        success: true, 
        username: user.username,
        email: user.email,
        tier: user.tier
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Register endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }
      
      if (username.length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password,
        telegramId: null,
        telegramUsername: null,
      });
      
      // Store user info in session
      req.session.user = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email || '',
      };
      req.session.authenticated = true;
      
      return res.status(201).json({ 
        success: true, 
        username: newUser.username,
        email: newUser.email,
        tier: newUser.tier
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get current user
  app.get('/api/user', (req, res) => {
    if (req.session.authenticated && req.session.user) {
      return res.json({ 
        success: true, 
        authenticated: true,
        user: req.session.user 
      });
    } else {
      return res.json({ 
        success: true, 
        authenticated: false 
      });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to logout' });
      }
      res.json({ success: true });
    });
  });
}