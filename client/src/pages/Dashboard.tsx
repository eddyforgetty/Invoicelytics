import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BotInterface from "@/components/BotInterface";
import InvoicesList from "@/components/InvoicesList";
import UsageMeter from "@/components/UsageMeter";
import UpgradeModal from "@/components/UpgradeModal";
import type { Invoice } from "@shared/schema";

export default function Dashboard() {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const toggleUpgradeModal = () => {
    setIsUpgradeModalOpen(!isUpgradeModalOpen);
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
              <a href="https://t.me/your_bot_name" target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send mr-2">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  Open in Telegram
                </Button>
              </a>
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
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} InvoiceLyticsBot. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
}
