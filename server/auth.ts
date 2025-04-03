import { Express } from "express";
import session from "express-session";
import MemoryStore from 'memorystore';
import { IStorage } from "./storage";
import { User } from "@shared/schema";
import Stripe from "stripe";
import CryptoJS from "crypto-js";
import rateLimit from "express-rate-limit";

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    user?: { id: number; username: string; email: string; };
    authenticated?: boolean;
  }
}

// Password hashing functions
// Updated hash function with consistent salt
const hashPassword = (password: string): string => {
  // Use a fixed salt for testing purposes to ensure consistency
  // In production, this should be a random salt
  const salt = "testSalt123"; // Fixed salt for debugging
  
  // Hash the password with the salt
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 512 / 32,
    iterations: 1000
  }).toString();
  
  console.log(`Hashing password - Salt: ${salt}, Hash: ${hash.substring(0, 20)}..., Hash length: ${hash.length}`);
  
  // Return the salt and hash together
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  try {
    // Split stored hash into parts
    const [salt, storedHash] = hashedPassword.split(':');
    
    if (!salt || !storedHash) {
      console.error("Invalid hashed password format, missing salt or hash part");
      return false;
    }
    
    // Hash the provided password with the stored salt
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 512 / 32,
      iterations: 1000
    }).toString();
    
    // Debug output
    console.log("\n======= PASSWORD VERIFICATION DETAILS =======");
    console.log(`Input password: ${password}`);
    console.log(`Stored salt: ${salt}`);
    console.log(`Stored hash (first 20): ${storedHash.substring(0, 20)}...`);
    console.log(`Computed hash (first 20): ${hash.substring(0, 20)}...`);
    
    const isMatch = hash === storedHash;
    console.log(`Match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`Hash length comparison: stored=${storedHash.length}, computed=${hash.length}`);
      
      // Character-by-character comparison for the first 10 characters
      console.log("\nCharacter comparison (first 10):");
      for (let i = 0; i < 10; i++) {
        console.log(`  Pos ${i}: stored=${storedHash[i]} (${storedHash.charCodeAt(i)}), computed=${hash[i]} (${hash.charCodeAt(i)}), match=${storedHash[i] === hash[i]}`);
      }
    }
    console.log("=======================================\n");
    
    // Compare the new hash with the stored hash
    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

export function setupAuth(app: Express, storageService: IStorage, stripeClient: Stripe | null = null) {
  // Set up session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'invoicelyticsbot-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 86400000 // 24 hours
    },
    store: new SessionStore({ checkPeriod: 86400000 }) // prune expired entries every 24h
  }));

  // Rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.'
    }
  });

  // Login endpoint (rate limiting temporarily disabled for debugging)
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }
      
      // Find user by email
      const user = await storageService.getUserByEmail(email);
      
      if (!user) {
        // Use a constant time comparison to prevent timing attacks
        // We still do a fake verification even if user doesn't exist
        verifyPassword(password, "dummy:dummy");
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      // Compare password using secure verification
      const isPasswordValid = verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      // Store user info in session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
      };
      req.session.authenticated = true;
      
      // Log the login
      console.log(`User ${user.username} (ID: ${user.id}) logged in successfully`);
      
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

  // Register endpoint (rate limiting temporarily disabled for debugging)
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
      const existingUsername = await storageService.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      
      // Check if email already exists
      const existingEmail = await storageService.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      
      // Hash the password before storing
      const hashedPassword = hashPassword(password);
      console.log(`Registration - Password: ${password}, Hashed Password: ${hashedPassword}`);
      
      // Create new user with hashed password
      const newUser = await storageService.createUser({
        username,
        email,
        password: hashedPassword,
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
      
      // Log the registration
      console.log(`New user registered: ${newUser.username} (ID: ${newUser.id})`);
      
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
    const username = req.session.user?.username;
    const userId = req.session.user?.id;
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to logout' });
      }
      
      if (username && userId) {
        console.log(`User ${username} (ID: ${userId}) logged out`);
      }
      
      res.json({ success: true });
    });
  });
}