import { db } from "./db";
import { users, invoices } from "@shared/schema";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    console.log("Starting database migration...");

    try {
      // Check if tables already exist
      await db.execute(sql`SELECT * FROM users LIMIT 1`);
      console.log("Users table already exists, skipping creation");
    } catch (error) {
      // Create the users table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "telegram_id" TEXT UNIQUE,
          "telegram_username" TEXT,
          "current_usage" INTEGER NOT NULL DEFAULT 0,
          "reset_date" TIMESTAMP,
          "tier" TEXT NOT NULL DEFAULT 'free',
          "stripe_customer_id" TEXT,
          "stripe_subscription_id" TEXT
        )
      `);
      console.log("Users table created");
    }

    try {
      // Check if invoices table already exists
      await db.execute(sql`SELECT * FROM invoices LIMIT 1`);
      console.log("Invoices table already exists, skipping creation");
    } catch (error) {
      // Create the invoices table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "invoices" (
          "id" SERIAL PRIMARY KEY,
          "invoice_id" TEXT NOT NULL UNIQUE,
          "user_id" INTEGER NOT NULL,
          "client_name" TEXT NOT NULL,
          "amount" REAL NOT NULL,
          "description" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
          "stripe_payment_link" TEXT,
          "pdf_path" TEXT
        )
      `);
      console.log("Invoices table created");
    }

    // Create default admin user if it doesn't exist
    try {
      const adminExists = await db.select().from(users).where(sql`username = 'admin'`);
      
      if (adminExists.length === 0) {
        // In production, you'd use a proper password hashing library
        await db.insert(users).values({
          username: "admin",
          password: "admin123", // This should be hashed in production
          tier: "premium"
        });
        console.log("Created default admin user");
      } else {
        console.log("Admin user already exists");
      }
    } catch (error) {
      console.error("Error handling admin user:", error);
    }

    // Seed test data if needed (for development purposes)
    try {
      if (process.env.NODE_ENV !== 'production') {
        const testUserExists = await db.select().from(users).where(sql`username = 'testuser'`);
        
        if (testUserExists.length === 0) {
          await db.insert(users).values({
            username: "testuser",
            password: "password", // This should be hashed in production
            telegramId: "123456789",
            telegramUsername: "testuser",
            tier: "free"
          });
          console.log("Created test user");
        } else {
          console.log("Test user already exists");
        }
      }
    } catch (error) {
      console.error("Error handling test user:", error);
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    // Don't exit process when running as part of the application
    if (import.meta.url.endsWith('/migrate.ts') || import.meta.url.endsWith('/migrate.js')) {
      process.exit(1);
    }
    throw error;
  }
}

// Run the migration when this script is executed directly
// Use import.meta.url to check if this is the main module for ESM
if (import.meta.url.endsWith('/migrate.ts') || import.meta.url.endsWith('/migrate.js')) {
  migrate()
    .then(() => {
      console.log("Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export default migrate;