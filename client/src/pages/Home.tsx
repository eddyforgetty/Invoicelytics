import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { config } from "@/config";

export default function Home() {
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
              <h1 className="text-xl font-bold text-white">InvoiceLyticsBot</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-primary hover:bg-white/90">
                  Register
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/30">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-primary/90 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6 text-white">Create and Send Invoices Directly Through Telegram</h1>
            <p className="text-xl mb-8 text-white/90">A simple way for freelancers to manage invoices and get paid faster</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://t.me/InvoiceLyticsBot" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send mr-2">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  Open in Telegram
                </Button>
              </a>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto border-white/30">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <Link href="/register">
                <Button variant="link" className="text-white hover:text-white/80">
                  Register for free account
                </Button>
              </Link>
              <span className="text-white/50 self-center">or</span>
              <Link href="/login">
                <Button variant="link" className="text-white hover:text-white/80">
                  Login to your account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Invoicing for Freelancers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card">
              <CardHeader>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap text-primary mb-2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <CardTitle>Quick Invoice Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Generate professional invoices with a simple command: <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-sm">/invoice [name] [amount] [description]</code></p>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card text-primary mb-2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <CardTitle>Instant Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Each invoice includes a Stripe payment link so clients can pay immediately with their credit card</p>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart text-primary mb-2">
                  <line x1="12" x2="12" y1="20" y2="10" />
                  <line x1="18" x2="18" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="16" />
                </svg>
                <CardTitle>Invoice Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Keep track of payment status with the <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-sm">/status [invoice_id]</code> command</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="card">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription className="text-slate-600">For getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    3 invoices per month
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Basic PDF templates
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Stripe payment links
                  </li>
                </ul>
                <a href={config.stripeCheckoutLinks.free} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full btn-primary">Get Started Free</Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg">
              <CardHeader>
                <div className="bg-primary/10 text-primary font-medium px-2 py-1 rounded-full w-fit text-xs">
                  POPULAR
                </div>
                <CardTitle className="mt-2">Basic</CardTitle>
                <CardDescription className="text-slate-600">For regular freelancers</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$5</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    10 invoices per month
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Premium PDF templates
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Stripe payment links
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Invoice reminders
                  </li>
                </ul>
                <a href={config.stripeCheckoutLinks.basic} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">Upgrade Now</Button>
                </a>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription className="text-slate-600">For power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$15</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Unlimited invoices
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Custom branding
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check text-green-600 mr-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <a href={config.stripeCheckoutLinks.pro} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">Go Pro</Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">What is Telegram Invoicing Bot?</h3>
                <p className="mt-2 text-gray-600">It's a simple Telegram bot that lets freelancers create, send, and track invoices right in their chats. Type /invoice [name] [amount] [description] to generate a PDF and a Stripe payment link—no bulky apps needed!</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">How do I start using it?</h3>
                <p className="mt-2 text-gray-600">Search for @InvoiceLyticsBot in Telegram (or click <a href="https://t.me/InvoiceLyticsBot" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://t.me/InvoiceLyticsBot</a>), then send /start to get going. Easy!</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">Is it free?</h3>
                <p className="mt-2 text-gray-600">Yes, you get 3 invoices/month for free. Need more? Plans are $5/mo for 10 invoices or $15/mo for unlimited. Check /upgrade for details.</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">How do I create an invoice?</h3>
                <p className="mt-2 text-gray-600">Send /invoice [name] [amount] [description]—like /invoice John Doe 50 logo design. You'll get a PDF invoice and a payment link to share with your client.</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">What's the invoice ID for?</h3>
                <p className="mt-2 text-gray-600">It's a unique number (e.g., 1698765432) in the PDF filename. Use it with /status [invoice_id] to check if your client paid.</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">Can I send the invoice outside Telegram?</h3>
                <p className="mt-2 text-gray-600">Yep! Download the PDF or copy the payment link from the bot's reply and send it via email, WhatsApp, or wherever.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">How do payments work?</h3>
                <p className="mt-2 text-gray-600">The bot creates a Stripe payment link for each invoice. Your client clicks it to pay with a card. You get the money in your Stripe account—set one up at <a href="https://stripe.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">stripe.com</a> if you haven't!</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">Are payments secure?</h3>
                <p className="mt-2 text-gray-600">Yes, Stripe handles all payment processing with top-notch security. We don't store card details—just the invoice info you provide.</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">How do I know if my client paid?</h3>
                <p className="mt-2 text-gray-600">For now, check /status [invoice_id]—it says "pending" until we add auto-updates. Or log into your Stripe Dashboard to see payments in real time.</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">The bot isn't responding—what's up?</h3>
                <p className="mt-2 text-gray-600">Double-check your command (e.g., /invoice John 50 needs a description). If it's still quiet, email us at <a href="mailto:eddyforgetty@gmail.com" className="text-primary hover:underline">eddyforgetty@gmail.com</a>.</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">Will you add more features?</h3>
                <p className="mt-2 text-gray-600">Yep! Email delivery and payment status updates are on the way. Got ideas? Tell us!</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-semibold text-primary">Can I use this for my business?</h3>
                <p className="mt-2 text-gray-600">Totally—it's built for freelancers and small gigs. For bigger needs, let us know what you'd like!</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-block p-6 bg-white rounded-lg border border-gray-100 shadow-sm max-w-xl">
              <h3 className="text-lg font-semibold text-primary mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-4">We're here to help! Contact our support team with any questions or feedback.</p>
              <a href="mailto:eddyforgetty@gmail.com" className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail mr-2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

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
