import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BotInterface from "@/components/BotInterface";
import InvoicesList from "@/components/InvoicesList";
import UsageMeter from "@/components/UsageMeter";
import UpgradeModal from "@/components/UpgradeModal";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Invoice } from "@shared/schema";

export default function Dashboard() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");
  const lastInvoiceUpdate = useStore(state => state.lastInvoiceUpdate);
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { logoutMutation } = useAuth();
  
  // Query for fetching invoices - defined before being used in effects
  const { data: invoices, isLoading, refetch } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch data every 10 seconds
    refetchOnMount: true,
    staleTime: 0,
    queryFn: async () => {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/invoices?_=${timestamp}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    }
  });
  
  // Function to directly check and update invoice status
  const checkAndUpdateInvoiceStatus = async (invoiceId: string) => {
    if (!invoiceId) return;
    
    try {
      console.log(`Direct API check for invoice ${invoiceId} status`);
      
      // First try to get the invoice directly
      const response = await fetch(`/api/invoices/${invoiceId}?_=${Date.now()}`);
      if (!response.ok) {
        console.error(`Failed to fetch invoice ${invoiceId}`);
        return;
      }
      
      const invoice = await response.json();
      console.log(`Retrieved invoice ${invoiceId} with status: ${invoice.status}`);
      
      // Force the query client to update its cache with this invoice
      queryClient.setQueryData([`/api/invoices/${invoiceId}`], invoice);
      
      // Update the invoice list cache by merging in this updated invoice
      queryClient.setQueryData(["/api/invoices"], (oldData: Invoice[] | undefined) => {
        if (!oldData) return [invoice];
        
        return oldData.map(item => 
          item.invoiceId === invoiceId ? { ...item, ...invoice } : item
        );
      });
      
      // Force a refetch to be sure we have fresh data
      refetch();
      
      return invoice;
    } catch (error) {
      console.error(`Error checking invoice ${invoiceId} status:`, error);
    }
  };

  // Check for URL parameters on mount (for Stripe redirects)
  useEffect(() => {
    // Extract URL parameters
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');
    const canceled = params.get('canceled');
    const invoiceId = params.get('invoice') || params.get('id'); // Support both 'invoice' and 'id' parameters
    const source = params.get('source'); // Check the source (e.g., '3ds' for 3D Secure returns)
    const sync = params.get('sync') === 'true';
    const paymentMethod = params.get('payment_method');
    
    // Clean URL parameters if they exist
    if (window.history && (success || error || canceled || invoiceId || source)) {
      // Create a URL without the query parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Handle 3D Secure returns (these come from Stripe after authentication)
    if (source === '3ds' && invoiceId && success === 'true') {
      console.log(`3D Secure return detected for invoice ${invoiceId}`);
      
      // Show a loading toast
      toast({
        title: "Verifying Payment",
        description: "Please wait while we verify your payment...",
      });
      
      // Set up aggressive polling to check for webhook updates
      console.log(`Aggressively polling invoice ${invoiceId} for status changes after 3D Secure...`);
      
      // Immediate first check
      checkAndUpdateInvoiceStatus(invoiceId).then(invoice => {
        if (invoice?.status === 'paid') {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully and the invoice is marked as paid.",
            variant: "default",
          });
          setActiveTab("paid");
        }
      });
      
      // Continue polling for 15 seconds (webhook processing may take time)
      const pollInterval = setInterval(async () => {
        console.log(`Polling invoice ${invoiceId} status...`);
        const updatedInvoice = await checkAndUpdateInvoiceStatus(invoiceId);
        
        if (updatedInvoice?.status === 'paid') {
          clearInterval(pollInterval);
          console.log("Invoice marked as paid, stopping polling");
          
          toast({
            title: "Payment Successful",
            description: "Your invoice has been updated and marked as paid.",
            variant: "default",
          });
          
          setActiveTab("paid");
        }
      }, 1500);
      
      // Clear polling after 15 seconds regardless of result
      setTimeout(() => {
        clearInterval(pollInterval);
        console.log("3D Secure return polling complete");
      }, 15000);
    }
    // Standard invoice status check with sync flag
    else if (invoiceId && sync) {
      console.log(`Sync flag detected, immediately checking invoice ${invoiceId} status`);
      
      // Initial check
      checkAndUpdateInvoiceStatus(invoiceId).then(invoice => {
        console.log("Direct status check complete, invoice:", invoice);
      });
      
      // Set up polling for 10 seconds
      const pollInterval = setInterval(() => {
        console.log(`Polling invoice ${invoiceId} status...`);
        checkAndUpdateInvoiceStatus(invoiceId);
      }, 1000);
      
      // Clear polling after 10 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        console.log("Status polling complete");
      }, 10000);
    }
    
    // Show appropriate toast message for standard return types
    if (success === 'payment-complete') {
      toast({
        title: "Payment Successful",
        description: "Your invoice has been marked as paid.",
        variant: "default",
      });
      
      // Force immediate full reload of all invoices
      queryClient.removeQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      
      // If we have the invoice ID, also invalidate that specific invoice
      if (invoiceId) {
        queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
        
        // Direct check with server 
        checkAndUpdateInvoiceStatus(invoiceId);
      }
      
      // Force an immediate refetch
      refetch();
      
      // Set active tab to "paid"
      setActiveTab("paid");
      
    } else if (error) {
      toast({
        title: "Payment Error",
        description: error === 'invoice-not-found' 
          ? "Invoice could not be found."
          : "There was an error processing your payment.",
        variant: "destructive",
      });
    } else if (canceled) {
      toast({
        title: "Payment Canceled",
        description: "Your payment has been canceled.",
        variant: "default",
      });
      
      // Force immediate full reload of all invoices
      queryClient.removeQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      
      // If we have the invoice ID, also invalidate that specific invoice
      if (invoiceId) {
        queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
        
        // Direct check with server
        checkAndUpdateInvoiceStatus(invoiceId);
      }
      
      // Force an immediate refetch
      refetch();
      
      // Set active tab to "canceled"
      setActiveTab("canceled");
    }
    
    // Clear URL parameters after processing them
    if (success || error || canceled) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, toast, refetch]);

  // Effect to refetch when store changes
  useEffect(() => {
    if (lastInvoiceUpdate) {
      refetch();
    }
  }, [lastInvoiceUpdate, refetch]);

  const toggleUpgradeModal = () => {
    setIsUpgradeModalOpen(!isUpgradeModalOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/"); // Redirect to the homepage instead of auth page
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt text-primary-600">
                    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 17.5v-11" />
                  </svg>
                  <span className="font-semibold text-lg">InvoiceLyticsBot</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleUpgradeModal}
              >
                Upgrade Plan
              </Button>
              <a href="https://t.me/InvoiceLyticsBot" target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send mr-2">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  Open in Telegram
                </Button>
              </a>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left sidebar */}
            <div className="md:col-span-2 xl:col-span-1">
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <UsageMeter onUpgradeClick={toggleUpgradeModal} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Bot Interface</CardTitle>
                </CardHeader>
                <CardContent>
                  <BotInterface />
                </CardContent>
              </Card>
            </div>

            {/* Main dashboard */}
            <div className="md:col-span-3 xl:col-span-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Link href="/invoice/new">
                  <Button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-2">
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    New Invoice
                  </Button>
                </Link>
              </div>
              
              <Tabs 
                defaultValue="invoices" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList>
                  <TabsTrigger value="invoices">All Invoices</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="canceled">Canceled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="invoices" className="space-y-4">
                  <InvoicesList 
                    invoices={invoices} 
                    isLoading={isLoading} 
                    filter="all" 
                  />
                </TabsContent>
                
                <TabsContent value="pending" className="space-y-4">
                  <InvoicesList 
                    invoices={invoices} 
                    isLoading={isLoading} 
                    filter="pending" 
                  />
                </TabsContent>
                
                <TabsContent value="paid" className="space-y-4">
                  <InvoicesList 
                    invoices={invoices} 
                    isLoading={isLoading} 
                    filter="paid" 
                  />
                </TabsContent>
                
                <TabsContent value="canceled" className="space-y-4">
                  <InvoicesList 
                    invoices={invoices} 
                    isLoading={isLoading} 
                    filter="canceled" 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
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

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
}