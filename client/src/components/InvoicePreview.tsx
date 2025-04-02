import { Invoice } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <div>
      {/* PDF Header */}
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-gray-500">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
          </svg>
          <span className="font-medium">invoice_{invoice.invoiceId}.pdf</span>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-500 hover:text-gray-700" title="Download PDF">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700" title="Share Invoice">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Content Preview */}
      <div className="px-8 py-8 bg-white border-b border-gray-200">
        <div className="aspect-[1/1.414] bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm mx-auto max-w-md">
          <div className="p-8 h-full flex flex-col">
            {/* PDF Header */}
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                <p className="text-gray-500 text-sm">#{invoice.invoiceId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date:</p>
                <p className="font-medium">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-6">
              <p className="text-gray-500 text-sm mb-1">Invoice To:</p>
              <p className="font-medium text-gray-800">{invoice.clientName}</p>
            </div>

            {/* Invoice Details */}
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Description</span>
                <span className="text-gray-600">Amount</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{invoice.description}</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between text-lg font-bold mb-8">
              <span>Total:</span>
              <span>${invoice.amount.toFixed(2)}</span>
            </div>

            {/* Footer with payment instructions */}
            <div className="mt-auto text-center text-sm text-gray-500">
              <p>Please use the payment link provided to complete payment.</p>
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Link Section */}
      <div className="px-6 py-4 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-3 md:mb-0">
          <p className="text-sm text-gray-600 mb-1">
            Payment Status: 
            <span className={`font-medium ml-1 ${
              invoice.status === "paid" 
                ? "text-green-600" 
                : invoice.status === "pending" 
                  ? "text-amber-600" 
                  : "text-red-600"
            }`}>
              {invoice.status === "paid" 
                ? "Paid" 
                : invoice.status === "pending" 
                  ? "Pending" 
                  : "Canceled"
              }
            </span>
          </p>
          <p className="text-xs text-gray-500">Send this link to your client to receive payment</p>
        </div>
        {invoice.stripePaymentLink && invoice.status !== "paid" && invoice.status !== "canceled" && (
          <a 
            href={invoice.stripePaymentLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary-600 text-white py-2 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-primary-700 transition duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <span>Pay Invoice</span>
          </a>
        )}
        {invoice.status === "paid" && (
          <div className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Paid</span>
          </div>
        )}
        {invoice.status === "canceled" && (
          <div className="bg-gray-600 text-white py-2 px-4 rounded-md flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            <span>Canceled</span>
          </div>
        )}
      </div>
    </div>
  );
}
