import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary py-6 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 17.5v-11" />
              </svg>
              <Link href="/">
                <span className="text-xl font-bold text-white cursor-pointer">InvoiceLyticsBot</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="prose prose-slate lg:prose-lg mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy for InvoiceLytics Telegram Bot</h1>
            <p className="text-sm text-gray-500 mb-8 text-center">Last Updated: April 08, 2025</p>

            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p>
              Welcome to Telegram Invoicing Bot ("we," "us," or "the Bot")—a tool built to help freelancers invoice clients quickly via Telegram. 
              We value your privacy and keep data collection to the bare minimum. This Privacy Policy outlines what we collect, how we use it, 
              and your options. Using the Bot means you're cool with this policy.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">What We Collect</h2>
            <p>
              We only grab what's needed to make invoices happen:
            </p>
            <h3 className="text-lg font-medium mb-2">Telegram Info:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Your Telegram User ID (a unique number) to recognize you and manage usage limits.</li>
              <li>Commands you send (e.g., /invoice John Doe 50 design work) to process your requests.</li>
            </ul>
            <h3 className="text-lg font-medium mb-2">Invoice Details:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Client name, amount, and description you provide (e.g., "John Doe," "$50," "design work").</li>
              <li>Invoice IDs and status (e.g., "pending").</li>
            </ul>
            <h3 className="text-lg font-medium mb-2">Payment Info:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Nothing directly—Stripe handles all card details via payment links. We don't see or store them.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">How We Use It</h2>
            <p>
              Your data powers the Bot's features:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Generate PDF invoices and Stripe payment links.</li>
              <li>Track invoice statuses and enforce the free tier (3 invoices/month).</li>
              <li>Respond to your commands (e.g., /status, /upgrade).</li>
              <li>Tweak the Bot based on anonymized usage stats.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">Where It's Stored</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Location:</strong> Replit's key-value database, hosted in the U.S.</li>
              <li><strong>Duration:</strong> We keep your data while you use the Bot or until you ask us to delete it. PDFs are temporary and vanish after sending.</li>
              <li><strong>Security:</strong> Replit's encryption protects API keys, but no system's perfect—use at your own risk.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">Who We Share With</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Telegram:</strong> Your ID and messages go through Telegram's API to run the Bot.</li>
              <li><strong>Stripe:</strong> Amount and description are sent to Stripe for payment links. Check their Privacy Policy.</li>
              <li><strong>Nobody Else:</strong> We don't sell or share your data, unless legally required.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">Your Choices</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>See Your Data:</strong> Use /status [invoice_id] to peek at stored invoices, or ask us directly.</li>
              <li><strong>Delete It:</strong> Email <a href="mailto:eddyforgetty@gmail.com" className="text-primary hover:underline">eddyforgetty@gmail.com</a> to wipe your User ID, invoices, and usage records.</li>
              <li><strong>Stop Using:</strong> Block the Bot in Telegram to end data collection.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">Tracking</h2>
            <p>
              No cookies or web trackers here—just Telegram chats. If we add a website later, we'll update this policy.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">Kids</h2>
            <p>
              The Bot's not for users under 13. We don't collect kids' data knowingly.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">Contact</h2>
            <p>
              Got questions? Email <a href="mailto:eddyforgetty@gmail.com" className="text-primary hover:underline">eddyforgetty@gmail.com</a> or ping the Bot. 
              We'll get back to you soon—small team, big hustle!
            </p>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
                <span className="font-semibold">InvoiceLyticsBot</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">A simple way to create and track invoices</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 mb-3">
                <Link href="/">
                  <span className="text-sm text-gray-500 hover:text-primary cursor-pointer">Home</span>
                </Link>
                <Link href="/terms">
                  <span className="text-sm text-gray-500 hover:text-primary cursor-pointer">Terms of Service</span>
                </Link>
                <a href="https://t.me/InvoiceLyticsBot" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-primary">Telegram</a>
                <a href="mailto:eddyforgetty@gmail.com" className="text-sm text-gray-500 hover:text-primary">Support</a>
              </div>
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} <span className="font-semibold">InvoiceLyticsBot</span>. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}