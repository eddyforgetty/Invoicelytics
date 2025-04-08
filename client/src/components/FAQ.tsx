import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqData = [
  {
    category: "General Questions",
    questions: [
      {
        question: "What is Telegram Invoicing Bot?",
        answer: "It's a simple Telegram bot that lets freelancers create, send, and track invoices right in their chats. Type /invoice [name] [amount] [description] to generate a PDF and a Stripe payment link—no bulky apps needed!"
      },
      {
        question: "How do I start using it?",
        answer: "Search for @InvoiceLyticsBot in Telegram (or click https://t.me/InvoiceLyticsBot), then send /start to get going. Easy!"
      },
      {
        question: "Is it free?",
        answer: "Yes, you get 3 invoices/month for free. Need more? Plans are $5/mo for 10 invoices or $15/mo for unlimited. Check /upgrade for details."
      }
    ]
  },
  {
    category: "Using the Bot",
    questions: [
      {
        question: "How do I create an invoice?",
        answer: "Send /invoice [name] [amount] [description]—like /invoice John Doe 50 logo design. You'll get a PDF invoice and a payment link to share with your client."
      },
      {
        question: "What's the invoice ID for?",
        answer: "It's a unique number (e.g., 1698765432) in the PDF filename. Use it with /status [invoice_id] to check if your client paid."
      },
      {
        question: "Can I send the invoice outside Telegram?",
        answer: "Yep! Download the PDF or copy the payment link from the bot's reply and send it via email, WhatsApp, or wherever."
      },
      {
        question: "Why am I getting \"Upgrade for more\" after a few invoices?",
        answer: "The free tier limits you to 3 invoices/month. Send /upgrade to see paid plans and keep invoicing."
      }
    ]
  },
  {
    category: "Payments",
    questions: [
      {
        question: "How do payments work?",
        answer: "The bot creates a Stripe payment link for each invoice. Your client clicks it to pay with a card. You get the money in your Stripe account—set one up at stripe.com if you haven't!"
      },
      {
        question: "Are payments secure?",
        answer: "Yes, Stripe handles all payment processing with top-notch security. We don't store card details—just the invoice info you provide."
      },
      {
        question: "Why does the payment page ask for extra verification?",
        answer: "Some cards use 3D Secure (3DS) for added security. Your client might need to enter a code from their bank. It's normal and keeps things safe."
      },
      {
        question: "How do I know if my client paid?",
        answer: "For now, check /status [invoice_id]—it says \"pending\" until we add auto-updates. Or log into your Stripe Dashboard to see payments in real time."
      }
    ]
  },
  {
    category: "Troubleshooting",
    questions: [
      {
        question: "The bot isn't responding—what's up?",
        answer: "Double-check your command (e.g., /invoice John 50 needs a description). If it's still quiet, email us at eddyforgetty@gmail.com."
      },
      {
        question: "I got an error message—what do I do?",
        answer: "If it says \"Oops, try: /invoice [name] [amount] [description]\", fix your input (e.g., use a number for amount). Still stuck? Reach out to us."
      },
      {
        question: "The payment link doesn't work—help!",
        answer: "Test it yourself with Stripe's test card (4242 4242 4242 4242, any future date/CVC). If it's broken, let us know—we're in test mode for now."
      }
    ]
  },
  {
    category: "Privacy & Support",
    questions: [
      {
        question: "What data do you collect?",
        answer: "Just your Telegram ID, invoice details (name, amount, description), and usage count. Stripe handles payments separately."
      },
      {
        question: "How do I delete my data?",
        answer: "Email us at eddyforgetty@gmail.com, and we'll wipe your info from our database."
      },
      {
        question: "Who can I contact for help?",
        answer: "Drop us a line at eddyforgetty@gmail.com or message the bot. We're a small team, so give us a day or two to reply."
      }
    ]
  },
  {
    category: "Future Stuff",
    questions: [
      {
        question: "Will you add more features?",
        answer: "Yep! Email delivery and payment status updates are on the way. Got ideas? Tell us!"
      },
      {
        question: "Can I use this for my business?",
        answer: "Totally—it's built for freelancers and small gigs. For bigger needs, let us know what you'd like!"
      }
    ]
  }
];

export function FAQ() {
  return (
    <div className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id="faq">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need to know about InvoiceLyticsBot
        </p>
      </div>
      
      <div className="space-y-10">
        {faqData.map((category, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className="text-xl font-medium text-primary">{category.category}</h3>
            <Accordion type="single" collapsible className="space-y-4">
              {category.questions.map((item, index) => (
                <AccordionItem key={index} value={`item-${idx}-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-lg font-medium py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;