import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
            <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service for InvoiceLytics Telegram Bot</h1>
            <p className="text-sm text-gray-500 mb-8 text-center">Effective Date: April 08, 2025</p>

            <h2 className="text-xl font-semibold mb-4">1. Welcome</h2>
            <p>
              InvoiceLytics Telegram Bot ("we," "us," or "the Bot") helps freelancers invoice clients fast via Telegram. 
              These Terms of Service ("Terms") govern your use. By sending commands like /invoice, you agree to them. 
              Don't like the rules? Don't use the Bot.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">2. What the Bot Does</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>Create PDF invoices (e.g., /invoice [name] [amount] [description]).</li>
              <li>Generate Stripe payment links.</li>
              <li>Track statuses (e.g., /status [invoice_id]).</li>
              <li>Offer a free tier (3 invoices/month) and paid plans ($5/mo for 10, $15/mo unlimited).</li>
              <li>It's hosted on Replit, tied to Telegram, and uses Stripe for payments.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">3. Who Can Use It</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>You must be 13+ years old.</li>
              <li>You need a Telegram account and, for payments, a Stripe account.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">4. Your Obligations</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Input:</strong> Give accurate invoice details—we're not responsible for typos or errors.</li>
              <li><strong>Use:</strong> Don't abuse the Bot (e.g., spamming, illegal stuff).</li>
              <li><strong>Stripe:</strong> Manage your Stripe account; their Terms apply.</li>
              <li><strong>Laws:</strong> Handle your own taxes and legal stuff—the Bot's just a tool.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">5. Pricing</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Free:</strong> 3 invoices/month.</li>
              <li><strong>Paid:</strong> $5/month (10 invoices), $15/month (unlimited)—see /upgrade.</li>
              <li><strong>Billing:</strong> Via Stripe (manual for now). No refunds after payment.</li>
              <li><strong>Changes:</strong> We can adjust prices with notice via Telegram.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">6. Ownership</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>The Bot's ours (code, concept, etc.). You can use it as intended.</li>
              <li>Your invoice data stays yours—we don't own it.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">7. Privacy</h2>
            <p>
              We collect minimal data to run the Bot. Check our <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link>.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">8. Third Parties</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>Telegram:</strong> Follow their rules—we rely on their platform.</li>
              <li><strong>Stripe:</strong> Payments follow Stripe's terms.</li>
              <li><strong>Replit:</strong> Hosting hiccups aren't on us.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">9. Liability Limits</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>As-Is:</strong> The Bot's provided "as is"—no warranties.</li>
              <li><strong>Risks:</strong> We're not liable for lost payments, downtime, or errors.</li>
              <li><strong>Max Loss:</strong> Our liability caps at what you've paid us (e.g., $15 if on the unlimited plan).</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">10. Ending Use</h2>
            <ul className="list-disc pl-5 mb-4">
              <li><strong>You:</strong> Stop anytime—block the Bot.</li>
              <li><strong>Us:</strong> We can suspend you for breaking Terms or shut down the Bot. No refunds if banned.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 mt-8">11. Service Changes</h2>
            <p>
              We might tweak or discontinue the Bot. We'll try to notify you via Telegram.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">12. Law</h2>
            <p>
              Governed by California, USA laws. Disputes go there.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">13. Contact</h2>
            <p>
              Reach us at <a href="mailto:eddyforgetty@gmail.com" className="text-primary hover:underline">eddyforgetty@gmail.com</a> or message the Bot. We'll reply ASAP.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">14. Agreement</h2>
            <p>
              Using the Bot means you accept these Terms. Happy invoicing!
            </p>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt text-primary-600">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
                <span className="font-semibold">InvoiceLyticsBot</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">A simple way to create and track invoices</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex gap-4 mb-2">
                <Link href="/">
                  <span className="text-sm text-gray-500 hover:text-primary cursor-pointer">Home</span>
                </Link>
                <Link href="/privacy">
                  <span className="text-sm text-gray-500 hover:text-primary cursor-pointer">Privacy Policy</span>
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