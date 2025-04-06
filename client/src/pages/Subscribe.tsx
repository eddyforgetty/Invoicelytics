import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'wouter';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Helper function to get price for a plan
const getPlanDetails = (plan?: string) => {
  switch (plan) {
    case 'basic':
      return { name: 'Basic Plan', price: 5, description: 'Up to 10 invoices per month with premium PDF templates' };
    case 'pro':
      return { name: 'Pro Plan', price: 15, description: 'Unlimited invoices with advanced features and priority support' };
    case 'free':
    default:
      return { name: 'Free Plan', price: 0, description: 'Up to 3 invoices per month with basic features' };
  }
};

const SubscribeForm = ({ planType }: { planType: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const planDetails = getPlanDetails(planType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard?subscription=success",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "You are subscribed!",
        });
        setLocation('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">{planDetails.name}</span>
            <span className="font-semibold">${planDetails.price}/month</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{planDetails.description}</p>
        </div>
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? "Processing..." : `Subscribe to ${planDetails.name}`}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Extract plan type from URL parameters
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const planType = searchParams.get('plan') || 'pro';

  useEffect(() => {
    // In a real app, you would use the actual user ID from auth context
    const userId = 1;

    setLoading(true);
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/get-or-create-subscription", { 
      userId,
      planType
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create subscription");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to set up subscription",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [toast, planType]);

  const planDetails = getPlanDetails(planType);

  if (loading) {
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
              <div>
                <a href="/" className="text-white hover:text-white/80 mr-4">Home</a>
                <a href="/dashboard" className="text-white hover:text-white/80">Dashboard</a>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt text-primary-600">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
                <span className="text-sm">© {new Date().getFullYear()} <span className="font-semibold">InvoiceLyticsBot</span>. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!clientSecret) {
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
              <div>
                <a href="/" className="text-white hover:text-white/80 mr-4">Home</a>
                <a href="/dashboard" className="text-white hover:text-white/80">Dashboard</a>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Subscription Error</CardTitle>
              <CardDescription>
                We couldn't set up your subscription. Please try again later.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setLocation('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt text-primary-600">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 17.5v-11" />
                </svg>
                <span className="text-sm">© {new Date().getFullYear()} <span className="font-semibold">InvoiceLyticsBot</span>. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

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
            <div>
              <a href="/" className="text-white hover:text-white/80 mr-4">Home</a>
              <a href="/dashboard" className="text-white hover:text-white/80">Dashboard</a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Subscribe to {planDetails.name}</CardTitle>
            <CardDescription>
              {planDetails.description} for just ${planDetails.price}/month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <SubscribeForm planType={planType} />
            </Elements>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt text-primary-600">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 17.5v-11" />
              </svg>
              <span className="text-sm">© {new Date().getFullYear()} <span className="font-semibold">InvoiceLyticsBot</span>. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};