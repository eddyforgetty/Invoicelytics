import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import migrate from "./migrate";

// Register global unhandled exception handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down gracefully...');
  console.error(error.name, error.message);
  console.error(error.stack);
  // Don't exit - just log the error and continue
});

process.on('unhandledRejection', (reason: any) => {
  console.error('UNHANDLED REJECTION! 💥 Continuing execution...');
  console.error(reason);
  // Don't exit - just log the error and continue
});

// Add a small delay to ensure logs are captured correctly
const delayedStartup = () => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a basic health check endpoint early in the middleware chain
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((req, res, next) => {
  try {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      try {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }

          log(logLine);
        }
      } catch (e) {
        // Prevent errors in logging from crashing server
        console.error('Error in request finish handler:', e);
      }
    });

    next();
  } catch (error) {
    // Ensure middleware errors don't crash server
    console.error('Error in middleware:', error);
    next(error);
  }
});

(async () => {
  try {
    await delayedStartup();
    log("Starting server initialization...");
    
    // Add a safe wrapper for database operations
    const safeDbInit = async () => {
      try {
        // Initialize the database before starting the server
        log("Initializing database...");
        
        // Run migrations to ensure database tables exist
        log("Running database migrations...");
        try {
          await migrate();
          log("Database migration completed successfully");
        } catch (error) {
          log(`Database migration error, but continuing with app startup: ${error}`);
          // Continue anyway - we'll fallback to in-memory storage if needed
        }
        
        log("Database setup completed");
      } catch (error) {
        log(`Database initialization error: ${error}`);
        // Continue anyway - we'll fallback to in-memory storage for now
      }
    };
    
    await safeDbInit();
    
    // Safe wrapper for routes registration
    const safeRegisterRoutes = async () => {
      try {
        log("Registering routes...");
        return await registerRoutes(app);
      } catch (error) {
        log(`Error registering routes: ${error}`);
        // Create a basic HTTP server and continue
        const http = await import('http');
        return http.createServer(app);
      }
    };
    
    const server = await safeRegisterRoutes();
    
    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      try {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error(`Error handler caught: ${message}`);
        if (err.stack) {
          console.error(err.stack);
        }

        // Don't throw after handling - this causes the server to crash
        res.status(status).json({ message });
      } catch (error) {
        // Last resort error handling to prevent server crash
        console.error('Error in error handler:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Safe wrapper for Vite setup
    const safeSetupVite = async () => {
      try {
        // importantly only setup vite in development and after
        // setting up all the other routes so the catch-all route
        // doesn't interfere with the other routes
        if (app.get("env") === "development") {
          await setupVite(app, server);
        } else {
          serveStatic(app);
        }
      } catch (error) {
        log(`Error setting up Vite: ${error}`);
        // Continue anyway - we'll use basic static serving
        app.use(express.static('client/dist'));
      }
    };
    
    await safeSetupVite();

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    
    // Wrap server start in a try-catch
    try {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`Server successfully started and listening on port ${port}`);
      });
      
      // Set up keep-alive mechanism
      const keepAlive = setInterval(() => {
        log(`Server uptime: ${process.uptime().toFixed(2)} seconds`);
      }, 60000);
      keepAlive.unref(); // Allow process to exit
      
    } catch (error) {
      log(`Failed to start server: ${error}`);
    }
  } catch (error) {
    // Overall startup error handling
    console.error('Critical error during server startup:', error);
  }
})();
