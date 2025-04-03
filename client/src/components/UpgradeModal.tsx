import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Get more invoices and premium features with our paid plans.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Free Plan</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">Current</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-3">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                3 invoices per month
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Basic PDF templates
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Stripe payment links
              </li>
            </ul>
            <div className="flex flex-col items-center space-y-3">
              <div>
                <span className="text-gray-800 font-medium">$0</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.open('https://buy.stripe.com/test_7sI4j24xF3yW5La4gl', '_blank');
                  onClose();
                }}
              >
                Free Tier
              </Button>
            </div>
          </div>
          
          {/* Basic Plan */}
          <div className="border border-primary-200 rounded-lg p-4 bg-primary-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Basic Plan</h3>
              <span className="text-xs bg-primary-100 px-2 py-1 rounded-full text-primary-700">Popular</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-3">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                10 invoices per month
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Premium PDF templates
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Stripe payment links
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Invoice reminders
              </li>
            </ul>
            <div className="flex flex-col items-center space-y-3">
              <div>
                <span className="text-gray-800 font-medium">$5</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <Button 
                size="sm"
                className="w-full"
                onClick={() => {
                  window.open('https://buy.stripe.com/test_9AQ9Dm0hp6L8c9y28b', '_blank');
                  onClose();
                }}
              >
                Upgrade to Basic
              </Button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Pro Plan</h3>
              <span className="text-xs bg-violet-100 px-2 py-1 rounded-full text-violet-700">Ultimate</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-3">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Unlimited invoices
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Custom branding
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle text-green-500 mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Priority support
              </li>
            </ul>
            <div className="flex flex-col items-center space-y-3">
              <div>
                <span className="text-gray-800 font-medium">$15</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <Button 
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  window.open('https://buy.stripe.com/test_3cs6ra2pxglI3D2aEI', '_blank');
                  onClose();
                }}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-1/2"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
