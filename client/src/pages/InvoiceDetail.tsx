import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InvoicePreview } from "@/components/InvoicePreview";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Invoice } from "@shared/schema";

export default function InvoiceDetail() {
  const [, params] = useRoute("/invoice/:id");
  const invoiceId = params?.id;
  const [copied, setCopied] = useState(false);

  const { data: invoice, isLoading, error } = useQuery<Invoice, Error, Invoice>({
    queryKey: [`/api/invoices/${invoiceId}`],
    enabled: !!invoiceId,
  });

  const copyPaymentLink = () => {
    if (invoice?.stripePaymentLink) {
      navigator.clipboard.writeText(invoice.stripePaymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateStatus = async (status: string) => {
    if (!invoiceId) return;
    
    try {
      await apiRequest("PUT", `/api/invoices/${invoiceId}/status`, { status });
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/invoices/${invoiceId}`] });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left mr-1">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back
              </Button>
            </Link>
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left mr-1">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle mx-auto text-red-500 mb-4">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
                <p className="text-gray-600 mb-4">We couldn't find the invoice you're looking for.</p>
                <Link href="/dashboard">
                  <Button>Return to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left mr-1">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Invoice #{invoice.invoiceId}</h1>
          </div>
          <div className={
              invoice.status === "paid" 
                ? "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800" 
                : invoice.status === "pending" 
                  ? "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800" 
                  : "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800"
            }>
            {invoice.status === "paid" 
              ? "Paid" 
              : invoice.status === "pending" 
                ? "Pending" 
                : "Canceled"
            }
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-0">
            <InvoicePreview invoice={invoice} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-medium">Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Link</h3>
                <div className="flex">
                  <Button 
                    variant="outline" 
                    onClick={copyPaymentLink}
                    disabled={!invoice.stripePaymentLink}
                    className="w-full mr-2"
                  >
                    {copied ? "Copied!" : "Copy Payment Link"}
                  </Button>
                  {invoice.stripePaymentLink && (
                    <Button asChild>
                      <a href={invoice.stripePaymentLink} target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Update Status</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => updateStatus("pending")}
                    disabled={invoice.status === "pending"}
                  >
                    Mark Pending
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                    onClick={() => updateStatus("paid")}
                    disabled={invoice.status === "paid"}
                  >
                    Mark Paid
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => updateStatus("canceled")}
                    disabled={invoice.status === "canceled"}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Invoice Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between md:block">
                  <dt className="text-gray-500">Client Name</dt>
                  <dd className="font-medium">{invoice.clientName}</dd>
                </div>
                <div className="flex justify-between md:block">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-medium">${invoice.amount.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between md:block">
                  <dt className="text-gray-500">Description</dt>
                  <dd className="font-medium">{invoice.description}</dd>
                </div>
                <div className="flex justify-between md:block">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="font-medium">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
