// This file is no longer used, we're using db.ts instead
// Keeping this file to avoid breaking imports that might reference it elsewhere

import { db } from './db';

// Export the database instance from db.ts for anyone importing from this file
export const pgConnect = async () => db;
export const initDb = async () => db;
export const closeDb = async () => {};