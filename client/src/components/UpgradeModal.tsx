import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    free: false,
    basic: false,
    pro: false
  });

  const handleSubscribe = (plan: string) => {
    setIsLoading(prev => ({ ...prev, [plan]: true }));
    
    // Close the modal first
    onClose();
    
    // Navigate to subscription page with plan type
    setLocation(`/subscribe?plan=${plan}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Get more invoices and premium features with our paid plans.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Free Plan</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">Current</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-3 min-h-[8rem]">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>3 invoices per month</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Basic PDF templates</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Stripe payment links</span>
              </li>
            </ul>
            <div className="flex flex-col items-center space-y-3 mt-auto">
              <div>
                <span className="text-gray-800 font-medium">$0</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubscribe('free')}
                disabled={isLoading.free}
              >
                {isLoading.free ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Free Tier"}
              </Button>
            </div>
          </div>
          
          {/* Basic Plan */}
          <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Basic Plan</h3>
              <span className="text-xs bg-primary-100 px-2 py-1 rounded-full text-primary-700">Popular</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-3 min-h-[8rem]">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>10 invoices per month</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Premium PDF templates</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Stripe payment links</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Invoice reminders</span>
              </li>
            </ul>
            <div className="flex flex-col items-center space-y-3 mt-auto">
              <div>
                <span className="text-gray-800 font-medium">$5</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleSubscribe('basic')}
                disabled={isLoading.basic}
              >
                {isLoading.basic ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Upgrade to Basic"}
              </Button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Pro Plan</h3>
              <span className="text-xs bg-violet-100 px-2 py-1 rounded-full text-violet-700">Ultimate</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-3 min-h-[8rem]">
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Unlimited invoices</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Custom branding</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 h-4 w-4" />
                <span>Priority support</span>
              </li>
            </ul>
            <div className="flex flex-col items-center space-y-3 mt-auto">
              <div>
                <span className="text-gray-800 font-medium">$15</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading.pro}
              >
                {isLoading.pro ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
