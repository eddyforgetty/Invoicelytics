import { invoices, users, type User, type InsertUser, type Invoice, type InsertInvoice } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private invoicesMap: Map<string, Invoice>;
  private currentUserId: number;
  private currentInvoiceId: number;

  constructor() {
    this.users = new Map();
    this.invoicesMap = new Map();
    this.currentUserId = 1;
    this.currentInvoiceId = 1;

    // Add a default user for testing
    this.users.set(1, {
      id: 1,
      username: "testuser",
      password: "password",
      telegramId: "123456789",
      telegramUsername: "testuser",
      currentUsage: 0,
      resetDate: new Date(),
      tier: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      currentUsage: 0, 
      resetDate: new Date(),
      tier: "free",
      telegramId: insertUser.telegramId || null,
      telegramUsername: insertUser.telegramUsername || null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(id, user);
    return user;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoicesMap.values());
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoicesMap.values()).filter(
      (invoice) => invoice.userId === userId,
    );
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    return Array.from(this.invoicesMap.values()).find(
      (invoice) => invoice.invoiceId === invoiceId,
    );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const now = new Date();
    
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      status: "pending",
      createdAt: now,
      stripePaymentLink: insertInvoice.stripePaymentLink || null,
      pdfPath: insertInvoice.pdfPath || null
    };
    
    this.invoicesMap.set(insertInvoice.invoiceId, invoice);
    return invoice;
  }

  async updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice | undefined> {
    const invoice = await this.getInvoiceById(invoiceId);
    
    if (!invoice) {
      return undefined;
    }
    
    const updatedInvoice = { ...invoice, status };
    this.invoicesMap.set(invoiceId, updatedInvoice);
    
    return updatedInvoice;
  }

  async incrementUserUsage(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { 
      ...user, 
      currentUsage: user.currentUsage + 1 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async resetUserUsage(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { 
      ...user, 
      currentUsage: 0,
      resetDate: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserTier(userId: number, tier: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, tier };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId
    };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }
}

export class PostgresStorage implements IStorage {
  constructor() {
    // Initialize the database connection if needed
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error in getUserByTelegramId:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(userData).returning();
      return result[0];
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getAllInvoices(): Promise<Invoice[]> {
    try {
      return await db.select().from(invoices);
    } catch (error) {
      console.error('Error in getAllInvoices:', error);
      throw error;
    }
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    try {
      return await db.select().from(invoices).where(eq(invoices.userId, userId));
    } catch (error) {
      console.error('Error in getInvoicesByUserId:', error);
      throw error;
    }
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    try {
      const result = await db.select().from(invoices).where(eq(invoices.invoiceId, invoiceId)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error in getInvoiceById:', error);
      throw error;
    }
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    try {
      const result = await db.insert(invoices).values(invoiceData).returning();
      return result[0];
    } catch (error) {
      console.error('Error in createInvoice:', error);
      throw error;
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: string): Promise<Invoice | undefined> {
    try {
      const result = await db
        .update(invoices)
        .set({ status })
        .where(eq(invoices.invoiceId, invoiceId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateInvoiceStatus:', error);
      throw error;
    }
  }

  async incrementUserUsage(userId: number): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) return undefined;
      
      const result = await db
        .update(users)
        .set({ currentUsage: user.currentUsage + 1 })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error in incrementUserUsage:', error);
      throw error;
    }
  }

  async resetUserUsage(userId: number): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ currentUsage: 0, resetDate: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error in resetUserUsage:', error);
      throw error;
    }
  }

  async updateUserTier(userId: number, tier: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ tier })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateUserTier:', error);
      throw error;
    }
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateStripeCustomerId:', error);
      throw error;
    }
  }

  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string; stripeSubscriptionId: string }): Promise<User | undefined> {
    try {
      const result = await db
        .update(users)
        .set({
          stripeCustomerId: stripeInfo.stripeCustomerId,
          stripeSubscriptionId: stripeInfo.stripeSubscriptionId
        })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateUserStripeInfo:', error);
      throw error;
    }
  }
}

// Factory function to create the appropriate storage implementation
const createStorage = async (): Promise<IStorage> => {
  try {
    // Try to create a PostgreSQL storage instance
    const pgStorage = new PostgresStorage();
    
    // Test the connection by getting a user
    // If this succeeds, the database is working
    await pgStorage.getUser(1);
    
    console.log("Using PostgreSQL database for storage");
    return pgStorage;
  } catch (error) {
    console.warn("Failed to initialize PostgreSQL storage, falling back to in-memory storage:", error);
    return new MemStorage();
  }
};

// Start with memory storage and try to switch to PostgreSQL
let storage: IStorage = new MemStorage();

// Try to initialize PostgreSQL storage in the background
createStorage()
  .then(s => {
    storage = s;
  })
  .catch(error => {
    console.error("Error switching to PostgreSQL storage:", error);
  });

export { storage };
