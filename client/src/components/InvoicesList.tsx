import { Link } from "wouter";
import { Invoice } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface InvoicesListProps {
  invoices: Invoice[] | undefined;
  isLoading: boolean;
  filter: 'all' | 'pending' | 'paid' | 'canceled';
}

export default function InvoicesList({ invoices, isLoading, filter }: InvoicesListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);

  // Function to manually update invoice status for testing
  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    console.log(`Manually updating invoice ${invoiceId} to ${status}`);
    setUpdatingInvoiceId(invoiceId);
    
    try {
      const response = await fetch('/api/force-update-invoice-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          invoiceId, 
          status 
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update invoice status');
      }
      
      const result = await response.json();
      
      // Force UI update
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
      
      // Force refetch
      queryClient.refetchQueries({ queryKey: ['/api/invoices'] });
      
      toast({
        title: 'Status Updated',
        description: `Invoice #${invoiceId.substring(0, 6)}... has been marked as ${status}`,
        variant: 'default',
      });
      
      console.log(`Manual status update successful:`, result);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Update Failed',
        description: (error as Error).message || 'Failed to update invoice status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingInvoiceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter invoices based on the selected filter
  const filteredInvoices = !invoices ? [] : filter === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === filter);

  if (filteredInvoices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text mx-auto text-gray-300 mb-4">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
        <p className="text-gray-600 mb-6">
          {filter === 'all' 
            ? "You haven't created any invoices yet." 
            : `You don't have any ${filter} invoices.`}
        </p>
        <Link href="/invoice/new">
          <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Create Invoice
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-sm overflow-x-auto">
      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        {filteredInvoices.map((invoice) => {
          // Check if invoice belongs to current user
          const isCurrentUserInvoice = user?.id === invoice.userId;
          
          return (
            <div 
              key={invoice.invoiceId}
              className={`border-b border-gray-100 p-3 ${isCurrentUserInvoice ? "bg-blue-50" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  {isCurrentUserInvoice && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1" title="Your invoice" />
                  )}
                  <span className="font-mono text-xs">{invoice.invoiceId.substring(0, 6)}...</span>
                </div>
                <Badge 
                  variant={invoice.status === "paid" ? "default" : "destructive"}
                  className={
                    invoice.status === "paid" 
                      ? "bg-green-100 text-green-800" 
                      : invoice.status === "pending" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-red-100 text-red-800"
                  }
                >
                  {invoice.status === "paid" 
                    ? "Paid" 
                    : invoice.status === "pending" 
                      ? "Pending" 
                      : "Canceled"
                  }
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                <div>
                  <div className="text-gray-500">Client:</div>
                  <div className="font-medium truncate">{invoice.clientName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Amount:</div>
                  <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500">Description:</div>
                  <div className="truncate">{invoice.description}</div>
                </div>
                <div>
                  <div className="text-gray-500">Date:</div>
                  <div>{new Date(invoice.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex space-x-1">
                  <Link href={`/invoice/${invoice.invoiceId}`}>
                    <button className="p-1 text-gray-500 hover:text-gray-700 rounded" title="View Invoice">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </Link>
                  
                  {invoice.stripePaymentLink && (
                    <button 
                      className="p-1 text-gray-500 hover:text-gray-700 rounded" 
                      title="Copy Payment Link"
                      onClick={() => {
                        navigator.clipboard.writeText(invoice.stripePaymentLink!);
                        toast({
                          title: "Payment Link Copied",
                          description: "Payment link has been copied to clipboard.",
                          variant: "default"
                        });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-6 w-6 p-0 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    disabled={invoice.status === 'paid' || updatingInvoiceId === invoice.invoiceId}
                    onClick={() => updateInvoiceStatus(invoice.invoiceId, 'paid')}
                    title="Mark as Paid"
                  >
                    <span className="sm:hidden">✓</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-6 w-6 p-0 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    disabled={invoice.status === 'canceled' || updatingInvoiceId === invoice.invoiceId}
                    onClick={() => updateInvoiceStatus(invoice.invoiceId, 'canceled')}
                    title="Cancel Invoice"
                  >
                    <span className="sm:hidden">✕</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">ID</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">Client</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">Amount</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">Description</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">Status</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">Date</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                // Check if invoice belongs to current user
                const isCurrentUserInvoice = user?.id === invoice.userId;
                
                return (
                  <TableRow 
                    key={invoice.invoiceId} 
                    className={isCurrentUserInvoice ? "bg-blue-50" : ""}
                  >
                    <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap p-1 sm:p-4">
                      <div className="flex items-center">
                        {isCurrentUserInvoice && (
                          <span 
                            className="w-2 h-2 rounded-full bg-blue-500 mr-1 sm:mr-2" 
                            title="Your invoice"
                          />
                        )}
                        {invoice.invoiceId.substring(0, 6)}...
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap p-1 sm:p-4 max-w-[60px] sm:max-w-none truncate">
                      {invoice.clientName}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap p-1 sm:p-4">${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs sm:text-sm p-1 sm:p-4" title={invoice.description}>
                      {invoice.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap p-1 sm:p-4">
                      <Badge 
                        variant={invoice.status === "paid" ? "default" : "destructive"}
                        className={
                          invoice.status === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : invoice.status === "pending" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {invoice.status === "paid" 
                          ? "Paid" 
                          : invoice.status === "pending" 
                            ? "Pending" 
                            : "Canceled"
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs sm:text-sm whitespace-nowrap p-1 sm:p-4">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap p-1 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 sm:w-auto sm:px-2 p-1 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          disabled={invoice.status === 'paid' || updatingInvoiceId === invoice.invoiceId}
                          onClick={() => updateInvoiceStatus(invoice.invoiceId, 'paid')}
                          title="Mark as Paid"
                        >
                          <span>Set Paid</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 sm:w-auto sm:px-2 p-1 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                          disabled={invoice.status === 'canceled' || updatingInvoiceId === invoice.invoiceId}
                          onClick={() => updateInvoiceStatus(invoice.invoiceId, 'canceled')}
                          title="Cancel Invoice"
                        >
                          <span>Cancel</span>
                        </Button>
                        
                        <Link href={`/invoice/${invoice.invoiceId}`}>
                          <button className="p-1 text-gray-500 hover:text-gray-700 rounded" title="View Invoice">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </Link>
                        
                        {invoice.stripePaymentLink && (
                          <button 
                            className="p-1 text-gray-500 hover:text-gray-700 rounded" 
                            title="Copy Payment Link"
                            onClick={() => {
                              navigator.clipboard.writeText(invoice.stripePaymentLink!);
                              toast({
                                title: "Payment Link Copied",
                                description: "Payment link has been copied to clipboard.",
                                variant: "default"
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
