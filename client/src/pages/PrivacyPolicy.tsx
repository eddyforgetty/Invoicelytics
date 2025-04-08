import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary py-6 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
                <h1 className="text-xl font-bold text-white">InvoiceLyticsBot</h1>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-8">Last Updated: April 08, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
              <p className="mb-4 text-gray-600">
                Welcome to Telegram Invoicing Bot ("we," "us," or "the Bot")—a tool built to help freelancers invoice clients 
                quickly via Telegram. We value your privacy and keep data collection to the bare minimum. This Privacy Policy 
                outlines what we collect, how we use it, and your options. Using the Bot means you're cool with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">What We Collect</h2>
              <p className="mb-4 text-gray-600">We only grab what's needed to make invoices happen:</p>
              
              <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">Telegram Info:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li>Your Telegram User ID (a unique number) to recognize you and manage usage limits.</li>
                <li>Commands you send (e.g., /invoice John Doe 50 design work) to process your requests.</li>
              </ul>
              
              <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">Invoice Details:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li>Client name, amount, and description you provide (e.g., "John Doe," "$50," "design work").</li>
                <li>Invoice IDs and status (e.g., "pending").</li>
              </ul>
              
              <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">Payment Info:</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li>Nothing directly—Stripe handles all card details via payment links. We don't see or store them.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Use It</h2>
              <p className="mb-4 text-gray-600">Your data powers the Bot's features:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li>Generate PDF invoices and Stripe payment links.</li>
                <li>Track invoice statuses and enforce the free tier (3 invoices/month).</li>
                <li>Respond to your commands (e.g., /status, /upgrade).</li>
                <li>Tweak the Bot based on anonymized usage stats.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Where It's Stored</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li><strong>Location:</strong> Replit's key-value database, hosted in the U.S.</li>
                <li><strong>Duration:</strong> We keep your data while you use the Bot or until you ask us to delete it. PDFs are temporary and vanish after sending.</li>
                <li><strong>Security:</strong> Replit's encryption protects API keys, but no system's perfect—use at your own risk.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Who We Share With</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li><strong>Telegram:</strong> Your ID and messages go through Telegram's API to run the Bot.</li>
                <li><strong>Stripe:</strong> Amount and description are sent to Stripe for payment links. Check their Privacy Policy.</li>
                <li><strong>Nobody Else:</strong> We don't sell or share your data, unless legally required.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Choices</h2>
              <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                <li><strong>See Your Data:</strong> Use /status [invoice_id] to peek at stored invoices, or ask us directly.</li>
                <li><strong>Delete It:</strong> Email <a href="mailto:eddyforgetty@gmail.com" className="text-primary hover:underline">eddyforgetty@gmail.com</a> to wipe your User ID, invoices, and usage records.</li>
                <li><strong>Stop Using:</strong> Block the Bot in Telegram to end data collection.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tracking</h2>
              <p className="mb-4 text-gray-600">
                No cookies or web trackers here—just Telegram chats. If we add a website later, we'll update this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Kids</h2>
              <p className="mb-4 text-gray-600">
                The Bot's not for users under 13. We don't collect kids' data knowingly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact</h2>
              <p className="mb-4 text-gray-600">
                Got questions? Email <a href="mailto:eddyforgetty@gmail.com" className="text-primary hover:underline">eddyforgetty@gmail.com</a> or 
                ping the Bot. We'll get back to you soon—small team, big hustle!
              </p>
            </section>
          </div>
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
            <div className="flex flex-col items-end md:items-center">
              <div className="text-sm text-gray-500 mb-2">
                © {new Date().getFullYear()} <span className="font-semibold">InvoiceLyticsBot</span>. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <Link href="/privacy-policy" className="text-sm text-primary hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-sm text-primary hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}