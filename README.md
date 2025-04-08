InvoiceLytics Telegram Bot

A micro SaaS tool to invoice clients fast via Telegram
Overview
Telegram Invoicing Bot lets freelancers create, send, and track invoices directly in Telegram chats. Built with Node.js on Replit, it generates PDF invoices and Stripe payment links with a few simple commands. Free for 3 invoices/month, with paid plans at $5/mo (10 invoices) and $15/mo (unlimited). Perfect for gig workers who want speed without the bloat.
Features
Invoice Creation: /invoice [name] [amount] [description] → PDF + Stripe link.

Status Tracking: /status [invoice_id] → Check if paid (manual for now).

Usage Limits: 3 free invoices/mo, upgrade with /upgrade.

Simple UX: Runs in Telegram, no app-switching needed.

Tech Stack
Language: Node.js

Platform: Replit (hosting + key-value database)

Dependencies: 
telegraf (Telegram Bot API)

stripe (Payment links)

pdfkit (PDF generation)

dotenv (Environment variables)

@replit/database (Data storage)

Setup
Prerequisites
Node.js (pre-installed on Replit)

A Telegram account

A Stripe account (test mode for dev)

Installation
Clone or Fork:
In Replit, create a new Node.js project or fork this one.

Install Dependencies:
Run in Replit’s Shell:
bash

npm install telegraf stripe pdfkit dotenv @replit/database

Set Environment Variables:
In Replit’s “Secrets” tab or .env:
env

TELEGRAM_TOKEN=your_bot_token_from_botfather
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key

Get TELEGRAM_TOKEN from BotFather.

Get STRIPE_SECRET_KEY from Stripe Dashboard (test mode).

Run the Bot:
Click “Run” in Replit. Console should log “Bot started.”

Add the bot in Telegram (e.g., @YourInvoiceBot) and send /start.

Usage
Commands
/start: Welcome message and instructions.

/invoice [name] [amount] [description]: Creates a PDF invoice and payment link (e.g., /invoice John Doe 50 design work).

/status [invoice_id]: Checks invoice status (e.g., /status 1698765432).

/upgrade: Shows pricing plans.

Example
Send: /invoice Jane Smith 75 logo design

Get: A PDF (invoice_1698765432.pdf) and “Pay here: [stripe_url]”

Check: /status 1698765432 → “Status: pending, Amount: $75”

Limits
Free tier: 3 invoices/month per user.

Paid plans unlock more—manual upgrades for now.

Testing
Basic Functionality:
Send /start, /invoice, /status in Telegram.

Verify PDF downloads and Stripe links open.

Stripe Payments:
Use test card 4242 4242 4242 4242 (any future date/CVC) for success.

Test 3DS with 4000 0000 0000 0127 (authenticate/fail in modal).

Check Stripe Dashboard (test mode) for payments.

Limits: Send /invoice 4 times—4th should prompt /upgrade.

Debug: Use Replit console logs (e.g., console.log('Payment URL:', url)).

Deployment
Replit: Runs natively—keep alive with “Always On” (Hacker plan, ~$7/mo) or an uptime ping (e.g., UptimeRobot).

Public: Share the bot’s Telegram link (e.g., https://t.me/InvoiceLyticsBot).

Project Structure

├── index.js          # Main bot logic
├── .env             # Environment variables (optional, use Secrets instead)
├── package.json     # Dependencies and scripts
└── README.md        # This file

Contributing
Ideas: Suggest features (e.g., email delivery, webhooks) via [eddyforgetty@gmail.com].

Bugs: Report issues in Telegram or email—include error messages.

Code: Fork on Replit, tweak, and share back (no formal PR process yet).

Roadmap
Auto-update invoice status via Stripe webhooks.

Email invoice delivery option.

Web dashboard for invoice analytics.

Legal
Privacy Policy: https://invoicelytics.com/privacy

Terms of Service: https://invoicelytics.com/terms

Contact
Email: [your-email@example.com (mailto:your-email@example.com)]

Telegram: Message @InvoiceLyticsBot

