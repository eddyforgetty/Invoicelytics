import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pkg;

let pool: pkg.Pool;
let db: ReturnType<typeof drizzle>;

try {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Database features will be disabled.");
    // Create a dummy pool that will reject all queries
    pool = new Pool({
      connectionString: 'postgresql://localhost:5432/dummy',
      max: 1, // Minimize connection attempts
    });
  } else {
    // Create a real pool with the database URL
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      // Configure connection pool
      max: 20,              // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait for a connection
    });
    
    // Add event handlers for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
    
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database');
    });
    
    // Test the connection early
    pool.query('SELECT NOW()').then(() => {
      console.log('PostgreSQL database connection confirmed working');
    }).catch(err => {
      console.error('Error connecting to PostgreSQL database:', err);
    });
  }
  
  // Initialize Drizzle ORM
  db = drizzle({ client: pool, schema });
  console.log('Drizzle ORM initialized with PostgreSQL');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  // Create fallback objects that will gracefully fail
  pool = new Pool({
    connectionString: 'postgresql://localhost:5432/dummy',
    max: 1,
  });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
