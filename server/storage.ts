import { invoices, users, type User, type InsertUser, type Invoice, type InsertInvoice } from "@shared/schema";
import Database from "@replit/database";

// Initialize the Replit Database
const db = new Database();

// Helper functions for dealing with Replit Database
async function getFromDB<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await db.get(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    
    // Handle Replit DB nested response structure with ok/value pattern
    if (value && typeof value === 'object' && 'ok' in value && 'value' in value) {
      // Unwrap the nested structure
      const nestedValue = (value as any).value;
      // If we have another level of nesting, unwrap again
      if (nestedValue && typeof nestedValue === 'object' && 'ok' in nestedValue && 'value' in nestedValue) {
        return nestedValue.value as T;
      }
      return nestedValue as T;
    }
    
    // Handle arrays and objects that need to be hydrated
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      if (Array.isArray(defaultValue)) {
        // Ensure we're returning an array
        return Array.isArray(value) ? (value as T) : defaultValue;
      }
    }
    
    return value as T;
  } catch (error) {
    console.error(`Error retrieving ${key} from database:`, error);
    return defaultValue;
  }
}

async function setToDB<T>(key: string, value: T): Promise<void> {
  try {
    await db.set(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in database:`, error);
    throw error;
  }
}

// Event emitter for real-time updates
import { EventEmitter } from 'events';

export const storageEvents = new EventEmitter();

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllInvoices(): Promise<Invoice[]>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  getInvoiceById(invoiceId: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice | undefined>;
  incrementUserUsage(userId: number): Promise<User | undefined>;
  resetUserUsage(userId: number): Promise<User | undefined>;
  updateUserTier(userId: number, tier: string): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }): Promise<User | undefined>;
}

// Storage implementation using Replit Database for persistence
export class ReplitDBStorage implements IStorage {
  private userIdKey = "userIdCounter";
  private invoiceIdKey = "invoiceIdCounter";
  private userPrefix = "user_";
  private invoicePrefix = "invoice_";
  private usersListKey = "usersList";
  private invoicesListKey = "invoicesList";

  constructor() {
    // Ensure counters exist
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Initialize counters and lists if they don't exist
      const userId = await getFromDB<number>(this.userIdKey, 1);
      await setToDB(this.userIdKey, userId);
      
      const invoiceId = await getFromDB<number>(this.invoiceIdKey, 1);
      await setToDB(this.invoiceIdKey, invoiceId);
      
      const usersList = await getFromDB<number[]>(this.usersListKey, []);
      await setToDB(this.usersListKey, usersList);
      
      const invoicesList = await getFromDB<string[]>(this.invoicesListKey, []);
      await setToDB(this.invoicesListKey, invoicesList);

      console.log("Database initialization complete");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  private async getNextUserId(): Promise<number> {
    try {
      const userId = await getFromDB<number>(this.userIdKey, 1);
      await setToDB(this.userIdKey, userId + 1);
      return userId;
    } catch (error) {
      console.error("Error getting next user ID:", error);
      return Math.floor(Date.now() / 1000); // Fallback to timestamp-based ID
    }
  }

  private async getNextInvoiceId(): Promise<number> {
    try {
      const invoiceId = await getFromDB<number>(this.invoiceIdKey, 1);
      await setToDB(this.invoiceIdKey, invoiceId + 1);
      return invoiceId;
    } catch (error) {
      console.error("Error getting next invoice ID:", error);
      return Math.floor(Date.now() / 1000); // Fallback to timestamp-based ID
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await getFromDB<User | undefined>(`${this.userPrefix}${id}`, undefined);
      return user;
    } catch (error) {
      console.error(`Error retrieving user ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersList = await getFromDB<number[]>(this.usersListKey, []);
      
      for (const userId of usersList) {
        const user = await this.getUser(userId);
        if (user && user.username.toLowerCase() === username.toLowerCase()) {
          return user;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error retrieving user by username ${username}:`, error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const usersList = await getFromDB<number[]>(this.usersListKey, []);
      
      for (const userId of usersList) {
        const user = await this.getUser(userId);
        if (user && user.email?.toLowerCase() === email.toLowerCase()) {
          return user;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error retrieving user by email ${email}:`, error);
      return undefined;
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    try {
      const usersList = await getFromDB<number[]>(this.usersListKey, []);
      
      for (const userId of usersList) {
        const user = await this.getUser(userId);
        if (user && user.telegramId === telegramId) {
          return user;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error retrieving user by telegramId ${telegramId}:`, error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const usersList = await getFromDB<number[]>(this.usersListKey, []);
      const users: User[] = [];
      
      for (const userId of usersList) {
        const user = await this.getUser(userId);
        if (user) {
          users.push(user);
        }
      }
      
      return users;
    } catch (error) {
      console.error("Error retrieving all users:", error);
      return [];
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = await this.getNextUserId();
      
      const user: User = { 
        ...insertUser, 
        id, 
        currentUsage: 0, 
        resetDate: new Date(),
        tier: "free",
        email: insertUser.email || null,
        telegramId: insertUser.telegramId || null,
        telegramUsername: insertUser.telegramUsername || null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      };
      
      // Save the user
      await setToDB(`${this.userPrefix}${id}`, user);
      
      // Update the users list
      const usersList = await getFromDB<number[]>(this.usersListKey, []);
      usersList.push(id);
      await setToDB(this.usersListKey, usersList);
      
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const invoicesList = await getFromDB<string[]>(this.invoicesListKey, []);
      const invoices: Invoice[] = [];
      
      for (const invoiceId of invoicesList) {
        const invoice = await this.getInvoiceById(invoiceId);
        if (invoice) {
          invoices.push(invoice);
        }
      }
      
      return invoices;
    } catch (error) {
      console.error("Error retrieving all invoices:", error);
      return [];
    }
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    try {
      const allInvoices = await this.getAllInvoices();
      return allInvoices.filter(invoice => invoice.userId === userId);
    } catch (error) {
      console.error(`Error retrieving invoices for user ${userId}:`, error);
      return [];
    }
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    try {
      const invoice = await getFromDB<Invoice | undefined>(`${this.invoicePrefix}${invoiceId}`, undefined);
      return invoice;
    } catch (error) {
      console.error(`Error retrieving invoice ${invoiceId}:`, error);
      return undefined;
    }
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    try {
      const id = await this.getNextInvoiceId();
      const now = new Date();
      
      const invoice: Invoice = {
        ...insertInvoice,
        id,
        status: "pending",
        createdAt: now,
        stripePaymentLink: insertInvoice.stripePaymentLink || null,
        pdfPath: insertInvoice.pdfPath || null
      };

      // Save the invoice
      await setToDB(`${this.invoicePrefix}${insertInvoice.invoiceId}`, invoice);
      
      // Update the invoices list
      const invoicesList = await getFromDB<string[]>(this.invoicesListKey, []);
      invoicesList.push(insertInvoice.invoiceId);
      await setToDB(this.invoicesListKey, invoicesList);
      
      // Increment user usage when creating a new invoice
      if (invoice.userId) {
        await this.incrementUserUsage(invoice.userId);
      }
      
      // Emit event for real-time updates
      storageEvents.emit('invoice-created', invoice);
      console.log(`Event emitted: invoice-created for invoice ${invoice.invoiceId}`);
      
      return invoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw new Error("Failed to create invoice");
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice | undefined> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        return undefined;
      }

      const updatedInvoice = {
        ...invoice,
        status
      };

      await setToDB(`${this.invoicePrefix}${invoiceId}`, updatedInvoice);
      
      // Emit event for real-time updates
      storageEvents.emit('invoice-updated', updatedInvoice);
      console.log(`Event emitted: invoice-updated for invoice ${invoiceId}`);
      
      return updatedInvoice;
    } catch (error) {
      console.error(`Error updating invoice status for ${invoiceId}:`, error);
      return undefined;
    }
  }

  async incrementUserUsage(userId: number): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return undefined;
      }

      const updatedUser = {
        ...user,
        currentUsage: (user.currentUsage || 0) + 1
      };

      await setToDB(`${this.userPrefix}${userId}`, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Error incrementing usage for user ${userId}:`, error);
      return undefined;
    }
  }

  async resetUserUsage(userId: number): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return undefined;
      }

      const updatedUser = {
        ...user,
        currentUsage: 0,
        resetDate: new Date()
      };

      await setToDB(`${this.userPrefix}${userId}`, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Error resetting usage for user ${userId}:`, error);
      return undefined;
    }
  }

  async updateUserTier(userId: number, tier: string): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return undefined;
      }

      const updatedUser = {
        ...user,
        tier
      };

      await setToDB(`${this.userPrefix}${userId}`, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Error updating tier for user ${userId}:`, error);
      return undefined;
    }
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return undefined;
      }

      const updatedUser = {
        ...user,
        stripeCustomerId
      };

      await setToDB(`${this.userPrefix}${userId}`, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Error updating Stripe customer ID for user ${userId}:`, error);
      return undefined;
    }
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return undefined;
      }

      const updatedUser = {
        ...user,
        stripeCustomerId: stripeInfo.stripeCustomerId,
        stripeSubscriptionId: stripeInfo.stripeSubscriptionId
      };

      await setToDB(`${this.userPrefix}${userId}`, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Error updating Stripe info for user ${userId}:`, error);
      return undefined;
    }
  }
}

// Export a singleton instance of the storage implementation
export const storage = new ReplitDBStorage();
