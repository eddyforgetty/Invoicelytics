import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  telegramId: text("telegram_id").unique(),
  telegramUsername: text("telegram_username"),
  currentUsage: integer("current_usage").default(0).notNull(),
  resetDate: timestamp("reset_date"),
  tier: text("tier").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id")
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  clientName: text("client_name").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stripePaymentLink: text("stripe_payment_link"),
  pdfPath: text("pdf_path")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  telegramId: true,
  telegramUsername: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceId: true,
  userId: true,
  clientName: true,
  amount: true,
  description: true,
  stripePaymentLink: true,
  pdfPath: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// API types
export const createInvoiceSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
});

export type CreateInvoiceRequest = z.infer<typeof createInvoiceSchema>;

export const invoiceCommandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
});

export type InvoiceCommand = z.infer<typeof invoiceCommandSchema>;
