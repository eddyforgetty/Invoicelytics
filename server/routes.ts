import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { createInvoiceSchema } from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { initBot } from "./bot";
import { setupAuth } from "./auth";

// Type definitions for Stripe expanded objects
interface ExpandedPaymentIntent {
  client_secret?: string;
}

interface ExpandedInvoice {
  payment_intent?: ExpandedPaymentIntent;
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

if (!process.env.TELEGRAM_TOKEN) {
  console.warn('Missing required Telegram token: TELEGRAM_TOKEN');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any, // Type assertion to bypass version check
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Telegram bot if token exists (non-blocking)
  if (process.env.TELEGRAM_TOKEN) {
    console.log("Starting Telegram bot initialization...");
    // Start bot initialization without awaiting to prevent blocking server startup
    initBot(process.env.TELEGRAM_TOKEN, stripe)
      .then(() => console.log("Telegram bot initialized successfully"))
      .catch(error => console.error("Failed to initialize Telegram bot:", error));
  }
  
  // Set up authentication with session middleware and auth endpoints
  setupAuth(app, storage, stripe);

  // Get all invoices for a user
  app.get("/api/invoices", async (req, res) => {
    try {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // For demo purposes, get all invoices
      const invoices = await storage.getAllInvoices();
      return res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get invoice by ID
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoiceId = req.params.id;
      
      console.log(`GET /api/invoices/${invoiceId} direct fetch request received`);
      
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const invoice = await storage.getInvoiceById(invoiceId);
      if (!invoice) {
        console.log(`Invoice with ID ${invoiceId} not found`);
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      console.log(`Successfully retrieved invoice ${invoiceId} with status: ${invoice.status}`);
      return res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // Create a new invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      const parsedData = createInvoiceSchema.parse(req.body);
      
      // In a real app, we would get the user ID from the authenticated session
      // For this demo, we'll use a default user ID
      const userId = 1;
      
      // Check if user has exceeded their invoice limit
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check usage limits based on tier
      if (user.tier === "free" && user.currentUsage >= 3) {
        return res.status(403).json({ 
          message: "Free tier limit reached (3 invoices/month). Please upgrade for more." 
        });
      }
      
      if (user.tier === "basic" && user.currentUsage >= 10) {
        return res.status(403).json({ 
          message: "Basic tier limit reached (10 invoices/month). Please upgrade for unlimited invoices." 
        });
      }
      
      // Create a unique invoice ID
      const invoiceId = Date.now().toString();
      
      // Create a Stripe payment link if Stripe is available
      let paymentLink = null;
      if (stripe) {
        try {
          // Implement retry mechanism for Stripe payment link creation
          const createStripePaymentLink = async (retryAttempt = 0): Promise<string | null> => {
            try {
              const product = await stripe.products.create({
                name: `Invoice ${invoiceId} - ${parsedData.description}`,
              });
              
              const price = await stripe.prices.create({
                unit_amount: Math.round(parsedData.amount * 100), // Convert to cents
                currency: 'usd',
                product: product.id,
              });
              
              // Generate absolute URLs for success and cancel callbacks
              const baseUrl = process.env.NODE_ENV === 'production'
                ? `https://${req.get('host')}`
                : `${req.protocol}://${req.get('host')}`;
              
              const successUrl = `${baseUrl}/invoice-paid?id=${invoiceId}`;
              const cancelUrl = `${baseUrl}/invoice-canceled?id=${invoiceId}`;
                
              console.log(`Creating payment session with success URL: ${successUrl}`);
              
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    price: price.id,
                    quantity: 1,
                  },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
              });
              
              return session.url;
            } catch (error) {
              // If we've retried 3 times, rethrow the error
              if (retryAttempt >= 2) {
                throw error;
              }
              
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              return createStripePaymentLink(retryAttempt + 1);
            }
          };
          
          // Try to create payment link with retry mechanism
          paymentLink = await createStripePaymentLink();
          
          if (paymentLink) {
            console.log(`Payment link created successfully for invoice ${invoiceId}: ${paymentLink}`);
          } else {
            console.error(`Failed to create payment link for invoice ${invoiceId} after retries`);
          }
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
        }
      }
      
      // Generate a PDF (in a real implementation, we'd use PDFKit here)
      const pdfPath = `/invoices/${invoiceId}.pdf`;
      
      // Create the invoice in the database
      const invoice = await storage.createInvoice({
        invoiceId,
        userId,
        clientName: parsedData.clientName,
        amount: parsedData.amount,
        description: parsedData.description,
        stripePaymentLink: paymentLink,
        pdfPath,
      });
      
      // Increment the user's current usage
      await storage.incrementUserUsage(userId);
      
      return res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating invoice:", error);
      return res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Update invoice status
  app.put("/api/invoices/:id/status", async (req, res) => {
    try {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const { status } = req.body;
      if (!status || !["pending", "paid", "canceled"].includes(status)) {
        console.error(`Invalid status received: ${status}`);
        return res.status(400).json({ message: "Invalid status" });
      }
      
      console.log(`Updating invoice ${req.params.id} status to ${status}`);
      
      const invoice = await storage.updateInvoiceStatus(req.params.id, status);
      if (!invoice) {
        console.error(`Invoice not found for ID: ${req.params.id}`);
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      console.log(`Invoice ${req.params.id} status updated successfully to ${status}`);
      
      // Get the freshest invoice data to ensure we're returning the updated version
      const updatedInvoice = await storage.getInvoiceById(req.params.id);
      console.log(`Fresh invoice data:`, JSON.stringify(updatedInvoice));
      
      return res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      return res.status(500).json({ message: "Failed to update invoice status" });
    }
  });
  
  // Direct API endpoint to update invoice status - used by frontend to force-refresh status
  app.post('/api/force-update-invoice-status', async (req, res) => {
    try {
      const { invoiceId, status } = req.body;
      
      if (!invoiceId || !status) {
        return res.status(400).json({ error: "Missing invoiceId or status" });
      }
      
      if (!['pending', 'paid', 'canceled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be pending, paid, or canceled" });
      }
      
      console.log(`Force update invoice ${invoiceId} status to ${status}`);
      
      // Check if invoice exists first
      const existingInvoice = await storage.getInvoiceById(invoiceId);
      if (!existingInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Update invoice status
      const updatedInvoice = await storage.updateInvoiceStatus(invoiceId, status);
      
      if (!updatedInvoice) {
        return res.status(500).json({ error: "Failed to update invoice status" });
      }
      
      return res.json({ 
        success: true, 
        invoice: updatedInvoice,
        message: `Invoice status updated to ${status}`
      });
    } catch (error) {
      console.error("Error in force-update-invoice-status:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Handle invoice payment success
  app.get('/invoice-paid', async (req, res) => {
    try {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const { id } = req.query;
      
      if (!id) {
        console.error("Missing invoice ID in request");
        return res.status(400).send("Missing invoice ID");
      }
      
      const invoiceId = id as string;
      console.log(`Payment success for invoice ${invoiceId}`);
      
      // Check if invoice exists first
      const existingInvoice = await storage.getInvoiceById(invoiceId);
      if (!existingInvoice) {
        console.error(`Invoice not found for ID: ${invoiceId}`);
        return res.redirect('/dashboard?error=invoice-not-found');
      }
      
      // Update invoice status
      console.log(`Updating invoice ${invoiceId} status to paid`);
      const invoice = await storage.updateInvoiceStatus(invoiceId, 'paid');
      
      if (!invoice) {
        console.error(`Failed to update invoice ${invoiceId} status`);
        return res.redirect('/dashboard?error=invoice-update-failed');
      }
      
      console.log(`Invoice ${invoiceId} updated successfully to paid, redirecting to dashboard`);
      
      // Use special sync flag to force frontend to immediately check status
      const timestamp = Date.now();
      return res.redirect(`/dashboard?success=payment-complete&id=${invoiceId}&sync=true&t=${timestamp}`);
    } catch (error) {
      console.error("Error handling payment success:", error);
      return res.redirect('/dashboard?error=payment-processing');
    }
  });

  // Handle invoice payment cancellation
  app.get('/invoice-canceled', async (req, res) => {
    try {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const { id } = req.query;
      
      if (!id) {
        console.error("Missing invoice ID in request");
        return res.status(400).send("Missing invoice ID");
      }
      
      const invoiceId = id as string;
      console.log(`Payment canceled for invoice ${invoiceId}`);
      
      // Check if invoice exists first
      const existingInvoice = await storage.getInvoiceById(invoiceId);
      if (!existingInvoice) {
        console.error(`Invoice not found for ID: ${invoiceId}`);
        return res.redirect('/dashboard?error=invoice-not-found');
      }
      
      // Update invoice status
      console.log(`Updating invoice ${invoiceId} status to canceled`);
      const invoice = await storage.updateInvoiceStatus(invoiceId, 'canceled');
      
      if (!invoice) {
        console.error(`Failed to update invoice ${invoiceId} status`);
        return res.redirect('/dashboard?error=invoice-update-failed');
      }
      
      console.log(`Invoice ${invoiceId} updated successfully to canceled, redirecting to dashboard`);
      
      // Use special sync flag to force frontend to immediately check status
      const timestamp = Date.now();
      return res.redirect(`/dashboard?canceled=true&id=${invoiceId}&sync=true&t=${timestamp}`);
    } catch (error) {
      console.error("Error handling payment cancellation:", error);
      return res.redirect('/dashboard?error=cancel-processing');
    }
  });

  // Stripe webhook for payment notifications
  app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
      // In a real implementation, we would verify the webhook signature
      // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      const rawBody = req.body.toString('utf8');
      event = JSON.parse(rawBody);
      console.log("Webhook received:", event.type);
    } catch (err: any) {
      console.error("Webhook parsing error:", err);
      return res.status(400).send(`Webhook Error: ${err.message || 'Unknown error'}`);
    }
    
    // Handle the event
    // Handle checkout.session.completed (for legacy checkout links)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log("Checkout session completed:", session.id);
      
      // Extract the invoice ID from the success URL
      const successUrl = session.success_url;
      console.log("Success URL from webhook:", successUrl);
      
      // Try multiple regex patterns to extract the invoice ID
      let invoiceId = null;
      
      // Check the standard pattern
      let match = successUrl?.match(/invoice-paid\?id=([^&]+)/);
      if (match && match[1]) {
        invoiceId = match[1];
      } 
      // Check for other possible patterns if needed
      else if (successUrl?.includes('id=')) {
        match = successUrl.match(/id=([^&]+)/);
        if (match && match[1]) {
          invoiceId = match[1];
        }
      }
      
      if (invoiceId) {
        await updateInvoiceStatus(invoiceId, 'paid', res);
      } else {
        console.error("Webhook: Could not extract invoice ID from success URL:", successUrl);
        return res.status(400).json({ error: "Could not extract invoice ID from success URL" });
      }
    }
    
    // Handle payment_intent.succeeded (for direct PaymentElement with 3D Secure)
    else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log("Payment intent succeeded:", paymentIntent.id);
      
      // Get invoice ID from metadata - this is our primary way to identify the invoice
      const invoiceId = paymentIntent.metadata?.invoiceId;
      
      if (invoiceId) {
        console.log(`Found invoice ID ${invoiceId} in payment intent metadata`);
        
        // Verify the invoice exists before updating
        const invoice = await storage.getInvoiceById(invoiceId);
        if (invoice) {
          console.log(`Webhook: Invoice ${invoiceId} found, updating status to paid`);
          await updateInvoiceStatus(invoiceId, 'paid', res);
        } else {
          console.error(`Webhook: Invoice ${invoiceId} from payment intent metadata not found in database`);
          return res.json({
            received: true,
            processed: false,
            reason: "Invoice ID in metadata not found in database"
          });
        }
      } else {
        console.log("No invoice ID found in payment intent metadata");
        return res.json({
          received: true,
          processed: false,
          reason: "No invoice ID in metadata"
        });
      }
    }
    
    // Handle invoice.payment_succeeded (for subscriptions)
    else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      console.log("Invoice payment succeeded:", invoice.id);
      
      // Check if this is a subscription-related invoice
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription;
        console.log(`Subscription ${subscriptionId} payment succeeded`);
        
        try {
          // Find user with this subscription ID and update their tier
          // This would require a new method in storage.ts
          // For now, we'll just log this event
          console.log(`Subscription ${subscriptionId} was paid successfully`);
          
          return res.json({
            received: true,
            processed: true,
            subscriptionId: subscriptionId
          });
        } catch (error) {
          console.error(`Error handling subscription payment:`, error);
          return res.status(500).json({ error: "Internal server error" });
        }
      }
    }
    
    // Utility function to update invoice status and handle responses
    async function updateInvoiceStatus(invoiceId: string, status: string, response: any) {
      console.log(`Updating invoice ${invoiceId} to ${status} via webhook`);
      
      try {
        // First check if invoice exists
        const existingInvoice = await storage.getInvoiceById(invoiceId);
        if (!existingInvoice) {
          console.error(`Webhook: Invoice not found for ID: ${invoiceId}`);
          return response.status(404).json({ error: "Invoice not found" });
        }
        
        // Update invoice status
        const updatedInvoice = await storage.updateInvoiceStatus(invoiceId, status);
        if (!updatedInvoice) {
          console.error(`Webhook: Failed to update invoice ${invoiceId}`);
          return response.status(500).json({ error: "Failed to update invoice" });
        }
        
        console.log(`Webhook: Invoice ${invoiceId} successfully updated to ${status}`);
        
        // Return success with invoice data for debugging
        return response.json({
          received: true,
          updated: true,
          invoiceId: invoiceId,
          currentStatus: updatedInvoice.status,
        });
      } catch (error) {
        console.error(`Webhook: Error updating invoice ${invoiceId}:`, error);
        return response.status(500).json({ error: "Internal server error" });
      }
    }
    
    // Return a response to acknowledge receipt of the event
    res.json({received: true, processed: false});
  });

  // Create Payment Intent API endpoint with 3D Secure support
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      const { amount, invoiceId } = req.body;
      
      // Create a PaymentIntent with 3D Secure authentication support
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            request_three_d_secure: 'any' // This ensures 3D Secure will be requested if available
          }
        },
        metadata: {
          invoiceId: invoiceId || '' // Store invoice ID in metadata for webhook processing
        }
      });
      
      console.log(`Payment intent created: ${paymentIntent.id} for amount ${amount} with 3D Secure enabled`);
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create or get subscription API endpoint
  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    if (!req.body.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userId = req.body.userId;
    let user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user already has a subscription, retrieve it
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent']
        });

        // Access the payment intent through the expanded latest_invoice
        const expandedInvoice = typeof subscription.latest_invoice === 'object' ? 
          subscription.latest_invoice as unknown as ExpandedInvoice : null;
          
        const clientSecret = expandedInvoice?.payment_intent?.client_secret || null;

        res.send({
          subscriptionId: subscription.id,
          clientSecret: clientSecret,
        });
        return;
      } catch (error: any) {
        console.error("Error retrieving subscription:", error);
        // Continue to create a new subscription if retrieval fails
      }
    }
    
    // Create a new customer and subscription
    try {
      // Default to 'testuser@example.com' for demo purposes
      const email = user.telegramUsername ? `${user.telegramUsername}@example.com` : 'testuser@example.com';
      
      const customer = await stripe.customers.create({
        email: email,
        name: user.username,
      });

      user = await storage.updateStripeCustomerId(user.id, customer.id);
      
      // For demo purposes, we'll use a fixed price ID
      // In production, this would be stored in environment variables
      const priceId = "price_1OudFPQiDTPYTfNOv4e3q6A5"; 

      // Ensure user is defined before proceeding
      if (!user) {
        return res.status(500).json({ message: "User data was lost during processing" });
      }

      // Create subscription with improved payment settings for 3D Secure
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: priceId, 
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
          payment_method_options: {
            card: {
              request_three_d_secure: 'any'  // Ensure 3D Secure is used when available
            }
          }
        },
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: customer.id, 
        stripeSubscriptionId: subscription.id
      });

      // Also update user tier based on the subscription
      await storage.updateUserTier(user.id, 'premium');
      
      // Access the payment intent through the expanded latest_invoice
      const expandedInvoice = typeof subscription.latest_invoice === 'object' ? 
        subscription.latest_invoice as unknown as ExpandedInvoice : null;
        
      const clientSecret = expandedInvoice?.payment_intent?.client_secret || null;
  
      res.send({
        subscriptionId: subscription.id,
        clientSecret: clientSecret,
      });
    } catch (error: any) {
      return res.status(400).send({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
