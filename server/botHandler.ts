import { Telegraf, Context } from "telegraf";
import { ZodError } from "zod";
import { invoiceCommandSchema } from "@shared/schema";
import Stripe from "stripe";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import http from "http";

// Define a custom context type that includes user ID
type BotContext = Context & {
  userId?: number;
};

// Ensure temporary directory exists
const TEMP_DIR = path.join(process.cwd(), "tmp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Bot instance lock file path
const LOCK_FILE_PATH = path.join(TEMP_DIR, "telegram_bot.lock");
const LOCK_CHECK_PORT = 47123; // Use a unique port for lock checking

// Helper function to parse the invoice command arguments
function parseInvoiceCommand(text: string) {
  // Remove the /invoice command part
  const args = text.replace(/^\/invoice\s+/i, "").trim();
  
  // Split by spaces but preserve quotes
  const matches = args.match(/(?:[^\s"]+|"[^"]*")+/g);
  
  if (!matches || matches.length < 3) {
    throw new Error("Invalid command format. Use: /invoice [name] [amount] [description]");
  }
  
  // The name might contain spaces and be quoted
  let name = matches[0].replace(/"/g, "");
  
  // Amount should be a number
  const amount = parseFloat(matches[1]);
  if (isNaN(amount)) {
    throw new Error("Amount must be a valid number");
  }
  
  // Description is everything else
  const description = matches.slice(2).join(" ").replace(/"/g, "");
  
  return { name, amount, description };
}

// Generate a PDF invoice
async function generateInvoicePDF(invoiceId: string, name: string, amount: number, description: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TEMP_DIR, `invoice_${invoiceId}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);
    
    // Add company info
    doc.fontSize(20).text("InvoiceLyticsBot", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #${invoiceId}`, { align: "center" });
    doc.moveDown(2);
    
    // Add billing details
    doc.fontSize(14).text("Billed To:", { underline: true });
    doc.fontSize(12).text(name);
    doc.moveDown(2);
    
    // Add invoice details
    doc.fontSize(14).text("Invoice Details:", { underline: true });
    doc.fontSize(12).text(`Description: ${description}`);
    doc.fontSize(12).text(`Amount: $${amount.toFixed(2)}`);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);
    
    // Add footer
    doc.fontSize(10).text("Thank you for your business!", { align: "center" });
    
    // Finalize the PDF
    doc.end();
    
    writeStream.on("finish", () => {
      resolve(filePath);
    });
    
    writeStream.on("error", (err) => {
      reject(err);
    });
  });
}

// Create a class to handle bot functionality
export class TelegramBotHandler {
  private bot: Telegraf<BotContext> | null = null;
  private stripe: Stripe | null = null;
  private isRunning: boolean = false;
  
  constructor() {
    // Initialize instance variables
  }
  
  // Maintain a lock server to prevent multiple bot instances
  private lockServer: http.Server | null = null;
  
  // Start a lock server that will hold the port as long as this instance is running
  private startLockServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.lockServer) {
        console.log("Lock server already running");
        resolve();
        return;
      }
      
      this.lockServer = http.createServer();
      
      this.lockServer.on('error', (err: any) => {
        console.error("Failed to start lock server:", err);
        reject(err);
      });
      
      this.lockServer.on('listening', () => {
        console.log(`Bot lock server running on port ${LOCK_CHECK_PORT}`);
        
        // Create lock file
        try {
          fs.writeFileSync(LOCK_FILE_PATH, `${process.pid}:${Date.now()}`);
          console.log("Bot lock file created");
        } catch (err) {
          console.error("Error creating lock file:", err);
        }
        
        resolve();
      });
      
      this.lockServer.listen(LOCK_CHECK_PORT);
    });
  }
  
  // Stop any running bot instance and clean up
  async stop(): Promise<void> {
    try {
      console.log("Stopping existing Telegram bot instance...");
      
      // Stop the bot if it's running
      if (this.bot && this.isRunning) {
        try {
          await this.bot.stop();
          console.log("Bot polling stopped");
        } catch (err) {
          console.error("Error stopping Telegram bot polling:", err);
        }
      }
      
      // Close the lock server if it exists
      if (this.lockServer) {
        try {
          await new Promise<void>((resolve) => {
            this.lockServer!.close(() => {
              console.log("Bot lock server closed");
              resolve();
            });
          });
        } catch (err) {
          console.error("Error closing bot lock server:", err);
        }
        this.lockServer = null;
      }
      
      // Remove lock file if it exists
      try {
        if (fs.existsSync(LOCK_FILE_PATH)) {
          fs.unlinkSync(LOCK_FILE_PATH);
          console.log("Bot lock file removed");
        }
      } catch (err) {
        console.error("Error removing lock file:", err);
      }
      
      // Reset instance state
      this.isRunning = false;
      this.bot = null;
      
      // Wait a moment to ensure everything is fully stopped
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Telegram bot cleanup completed successfully");
    } catch (err) {
      console.error("Error during bot cleanup:", err);
    }
  }
  
  // Check if another bot instance is already running (using port)
  private async checkForExistingBot(): Promise<boolean> {
    return new Promise((resolve) => {
      // Try to start a server on the lock port
      const server = http.createServer();
      
      // Handle server errors (port in use = another instance is running)
      server.on('error', () => {
        console.log("Lock check: Another bot instance appears to be running");
        resolve(true); // Another instance exists
      });
      
      // If we can start the server, no other instance is running
      server.on('listening', () => {
        console.log("Lock check: No other bot instance detected");
        server.close(() => {
          resolve(false); // No other instance
        });
      });
      
      // Try to listen on the lock port
      server.listen(LOCK_CHECK_PORT);
    });
  }
  
  // Clean up any stale lock files across the system
  private async killAllTelegramBots(): Promise<void> {
    try {
      // On Linux systems, we can attempt to find and kill any running Telegraf processes
      // This is a more aggressive approach, but it can help clear stuck bots
      const killCommand = `
        # Try to find and kill any running Telegraf bot processes
        if command -v pkill > /dev/null 2>&1; then
          pkill -f "node.*telegraf" || true
        fi
        
        # Also try to kill any Node.js processes that might be running telegram bots
        if command -v ps > /dev/null 2>&1 && command -v grep > /dev/null 2>&1 && command -v awk > /dev/null 2>&1; then
          ps aux | grep "[t]elegraf" | awk '{print $2}' | xargs kill -9 2>/dev/null || true
        fi
      `;
      
      // Execute the cleanup command (non-blocking)
      const exec = require('child_process').exec;
      exec(killCommand, (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log("Warning: Could not kill existing bot processes:", error);
        } else {
          console.log("Attempted to kill any existing Telegram bot processes");
        }
      });
      
      // Wait for processes to terminate
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err) {
      console.error("Error during bot cleanup:", err);
    }
  }
  
  // Start a new bot instance
  async start(token: string, stripeInstance: Stripe | null): Promise<void> {
    // Ensure any existing bot is stopped first
    await this.stop();
    
    // First, check if another bot instance is running
    const anotherInstanceRunning = await this.checkForExistingBot();
    
    if (anotherInstanceRunning) {
      console.log("Detected another bot instance running, attempting to forcefully kill it");
      await this.killAllTelegramBots();
      
      // Wait some time for processes to fully terminate
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check again
      const stillRunning = await this.checkForExistingBot();
      if (stillRunning) {
        throw new Error("Unable to start bot: another instance is still running despite cleanup attempts");
      }
    }
    
    try {
      console.log("Creating new Telegram bot instance...");
      this.stripe = stripeInstance;
      this.bot = new Telegraf<BotContext>(token);
      
      // Register middleware to find or create user
      this.bot.use(async (ctx, next) => {
        if (ctx.from) {
          const telegramId = ctx.from.id.toString();
          let user = await storage.getUserByTelegramId(telegramId);
          
          if (!user) {
            // Create a new user
            user = await storage.createUser({
              username: ctx.from.username || `user_${telegramId}`,
              password: "telegram", // Default password for Telegram users
              telegramId,
              telegramUsername: ctx.from.username,
            });
          }
          
          ctx.userId = user.id;
        }
        
        return next();
      });
      
      // Welcome message command
      this.bot.command("start", async (ctx) => {
        await ctx.reply(
          "Welcome to InvoiceLyticsBot! Use /invoice [name] [amount] [description] to create an invoice."
        );
      });
      
      // Invoice creation command
      this.bot.command("invoice", async (ctx) => {
        try {
          if (!ctx.userId) {
            return await ctx.reply("You need to start a conversation with me first using /start");
          }
          
          const user = await storage.getUser(ctx.userId);
          if (!user) {
            return await ctx.reply("User not found. Please try again.");
          }
          
          // Check usage limits
          if (user.tier === "free" && user.currentUsage >= 3) {
            return await ctx.reply("You've reached your free tier limit (3 invoices/month). Use /upgrade for more.");
          }
          
          if (user.tier === "basic" && user.currentUsage >= 10) {
            return await ctx.reply("You've reached your basic tier limit (10 invoices/month). Use /upgrade for unlimited invoices.");
          }
          
          // Parse command
          const commandData = parseInvoiceCommand(ctx.message.text);
          
          try {
            // Validate with Zod
            const validData = invoiceCommandSchema.parse(commandData);
            
            // Generate unique invoice ID
            const invoiceId = Date.now().toString();
            
            // Generate PDF
            const pdfPath = await generateInvoicePDF(
              invoiceId,
              validData.name,
              validData.amount,
              validData.description
            );
            
            // Send PDF to user
            await ctx.replyWithDocument({ source: pdfPath, filename: `invoice_${invoiceId}.pdf` });
            
            // Create payment link if Stripe is available
            let paymentLink = null;
            if (this.stripe) {
              try {
                console.log("Creating Stripe checkout session for invoice...");
                
                // Using type assertion to bypass TypeScript errors with Stripe API
                const session = await this.stripe.checkout.sessions.create({
                  payment_method_types: ['card'],
                  line_items: [
                    {
                      // Had to use type assertion to fix TypeScript errors
                      // @ts-ignore - Stripe types are not correctly matching the API
                      price_data: {
                        currency: 'usd',
                        product_data: {
                          name: `Invoice #${invoiceId}`,
                          description: validData.description,
                        },
                        unit_amount: Math.round(validData.amount * 100), // Convert to cents
                      },
                      quantity: 1,
                    },
                  ],
                  mode: 'payment',
                  success_url: `${process.env.APP_URL || 'https://invoicelytics.repl.co'}/dashboard?status=paid&id=${invoiceId}`,
                  cancel_url: `${process.env.APP_URL || 'https://invoicelytics.repl.co'}/dashboard?status=canceled&id=${invoiceId}`,
                  metadata: {
                    invoiceId: invoiceId
                  }
                });
                
                paymentLink = session.url;
                console.log("Checkout session created, URL:", paymentLink);
                
                // Send payment link
                if (paymentLink) {
                  await ctx.reply(`Pay here: ${paymentLink}`);
                  console.log("Payment link sent to user");
                } else {
                  console.error("Payment link is undefined");
                  await ctx.reply("Sorry, I couldn't generate a payment link at this time.");
                }
              } catch (error) {
                console.error("Stripe error:", error);
                // Log more detailed error information
                if (error instanceof Error) {
                  console.error("Error message:", error.message);
                  console.error("Error stack:", error.stack);
                }
                await ctx.reply("Sorry, there was an error creating the payment link. Please try again later.");
              }
            }
            
            // Store invoice in database
            await storage.createInvoice({
              invoiceId,
              userId: ctx.userId,
              clientName: validData.name,
              amount: validData.amount,
              description: validData.description,
              stripePaymentLink: paymentLink,
              pdfPath: pdfPath,
            });
            
            // Increment user usage
            await storage.incrementUserUsage(ctx.userId);
            
            // Clean up PDF file
            setTimeout(() => {
              fs.unlink(pdfPath, (err) => {
                if (err) console.error("Error deleting temp PDF:", err);
              });
            }, 60000); // Delete after 1 minute
          } catch (validationError) {
            if (validationError instanceof ZodError) {
              const errors = validationError.errors.map(e => e.message).join(", ");
              await ctx.reply(`Validation error: ${errors}`);
            } else {
              throw validationError;
            }
          }
        } catch (error: any) {
          console.error("Error handling invoice command:", error);
          await ctx.reply(`Error: ${error.message || "An unknown error occurred"}`);
        }
      });
      
      // Status command
      this.bot.command("status", async (ctx) => {
        try {
          const args = ctx.message.text.split(" ");
          if (args.length !== 2) {
            return await ctx.reply("Usage: /status [invoice_id]");
          }
          
          const invoiceId = args[1];
          const invoice = await storage.getInvoiceById(invoiceId);
          
          if (!invoice) {
            return await ctx.reply("Invoice not found");
          }
          
          await ctx.reply(`Status: ${invoice.status}, Amount: $${invoice.amount.toFixed(2)}`);
        } catch (error: any) {
          console.error("Error handling status command:", error);
          await ctx.reply(`Error: ${error.message || "An unknown error occurred"}`);
        }
      });
      
      // Upgrade command
      this.bot.command("upgrade", async (ctx) => {
        await ctx.reply(
          "InvoiceLyticsBot Premium Plans:\n\n" +
          "• BASIC PLAN: $5/mo (10 invoices/month)\n" +
          "Subscribe here: https://buy.stripe.com/cN23eh5UD0Tah1e7st\n\n" +
          "• PRO PLAN: $15/mo (unlimited invoices)\n" +
          "Subscribe here: https://buy.stripe.com/aEU1692IrdFWdP25kk\n\n" +
          "More info at https://invoicelytics.repl.co"
        );
      });
      
      // Handle errors
      this.bot.catch((err, ctx) => {
        console.error(`Telegram Bot Error: ${err}`);
        ctx.reply("An error occurred. Please try again later.");
      });
      
      // Start the lock server to prevent other instances
      try {
        await this.startLockServer();
      } catch (error) {
        console.error("Failed to start bot lock server:", error);
        throw new Error("Could not start bot lock server. Another instance may be running.");
      }
      
      // Start the bot
      console.log("Launching new Telegram bot instance...");
      try {
        // Enable graceful shutdown
        process.once('SIGINT', () => this.stop());
        process.once('SIGTERM', () => this.stop());
        
        // Launch with default options (using long polling)
        // Note: Telegraf v4 handles webhooks differently, we're just using the default long polling
        await this.bot.launch();
        
        this.isRunning = true;
        console.log("Telegram bot launched successfully");
      } catch (error: any) {
        console.error("Error launching Telegram bot:", error?.message || error);
        await this.stop(); // Clean up lock server on failure
        throw error; // Rethrow to be handled by caller
      }
    } catch (error) {
      console.error("Failed to start Telegram bot:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const botHandler = new TelegramBotHandler();