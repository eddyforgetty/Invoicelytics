import { invoices, users, type User, type InsertUser, type Invoice, type InsertInvoice } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
      email: "test@example.com",
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
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
      email: insertUser.email || null,
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

export const storage = new MemStorage();
