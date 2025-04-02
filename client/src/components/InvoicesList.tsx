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

interface InvoicesListProps {
  invoices: Invoice[] | undefined;
  isLoading: boolean;
  filter: 'all' | 'pending' | 'paid' | 'canceled';
}

export default function InvoicesList({ invoices, isLoading, filter }: InvoicesListProps) {
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.invoiceId}>
                <TableCell className="font-mono">{invoice.invoiceId}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={invoice.description}>
                  {invoice.description}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      invoice.status === "paid" 
                        ? "success" 
                        : invoice.status === "pending" 
                          ? "warning" 
                          : "destructive"
                    }
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
                <TableCell className="text-gray-500">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/invoice/${invoice.invoiceId}`}>
                      <button className="text-gray-500 hover:text-gray-700" title="View Invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </Link>
                    {invoice.stripePaymentLink && (
                      <button 
                        className="text-gray-500 hover:text-gray-700" 
                        title="Copy Payment Link"
                        onClick={() => {
                          navigator.clipboard.writeText(invoice.stripePaymentLink!);
                          // Could add a toast notification here
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
