import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface InvoicePaymentFormProps {
  amount: number;
  invoiceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const InvoicePaymentForm = ({ amount, invoiceId, onSuccess, onCancel }: InvoicePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Stripe has not been properly initialized.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Add return_url to redirect back after 3D Secure authentication
          return_url: `${window.location.origin}/dashboard?invoice=${invoiceId}&success=true`,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>
      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading} 
          className="flex-1"
        >
          {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

interface InvoicePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    invoiceId: string;
    clientName: string;
    amount: number;
    description: string;
  };
  onPaymentSuccess: () => void;
}

export default function InvoicePayment({ isOpen, onClose, invoice, onPaymentSuccess }: InvoicePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && invoice) {
      setIsLoading(true);
      setError(null);
      
      // Create a new payment intent when the modal opens
      apiRequest("POST", "/api/create-payment-intent", {
        amount: invoice.amount,
        invoiceId: invoice.invoiceId,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to create payment intent");
          }
          return res.json();
        })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error("Payment intent creation error:", err);
          setError(err.message || "Failed to initialize payment");
          toast({
            title: "Payment Setup Failed",
            description: err.message || "Could not connect to payment service",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, invoice, toast]);

  const handleSuccess = () => {
    onPaymentSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
          <DialogDescription>
            Complete payment for invoice #{invoice?.invoiceId} - {invoice?.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <InvoicePaymentForm 
                amount={invoice.amount} 
                invoiceId={invoice.invoiceId}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </Elements>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Payment system is initializing...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}