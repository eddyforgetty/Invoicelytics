import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
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

      <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md mx-4 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center mb-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-gray-600">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="mt-2 text-sm text-gray-500">
              Return to InvoiceLyticsBot dashboard to continue managing your invoices.
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Link href="/">
              <Button className="mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">
                Dashboard
              </Button>
            </Link>
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
