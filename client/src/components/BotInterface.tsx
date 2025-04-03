import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CommandHistory from "@/components/CommandHistory";

export default function BotInterface() {
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([
    {
      command: "/start",
      response: "Welcome! Use /invoice [name] [amount] [description] to create an invoice.",
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      command: "/status 1698765432",
      response: "Status: pending, Amount: $150",
      timestamp: new Date(Date.now() - 2700000) // 45 mins ago
    },
    {
      command: "/invoice John Smith 150 Logo design",
      response: "Invoice created! Invoice ID: 1698765432",
      timestamp: new Date(Date.now() - 1800000) // 30 mins ago
    }
  ]);

  const handleSendCommand = () => {
    if (!commandInput.trim()) return;
    
    // Process the command (in a real app, this would send to the API)
    let response = "Command not recognized. Try /start, /invoice, /status, or /upgrade.";
    
    if (commandInput.startsWith("/start")) {
      response = "Welcome! Use /invoice [name] [amount] [description] to create an invoice.";
    } else if (commandInput.startsWith("/invoice")) {
      response = "To create an invoice via the bot, please use Telegram directly. This is just a simulation.";
    } else if (commandInput.startsWith("/status")) {
      const parts = commandInput.split(" ");
      if (parts.length === 2) {
        response = `Status retrieved. You can check invoice details in the dashboard.`;
      } else {
        response = "Usage: /status [invoice_id]";
      }
    } else if (commandInput.startsWith("/upgrade")) {
      response = "Plans: $0/mo (Free), $5/mo (Basic - 10 invoices), $15/mo (Pro - unlimited). Visit the dashboard to upgrade or use these direct links: Free: https://buy.stripe.com/test_5kAeXG6FN4D07TieV0, Basic: https://buy.stripe.com/test_aEUdTCe8f1qO8Xm28f, Pro: https://buy.stripe.com/test_7sIeXG8NV7Pc3D2dQY";
    }
    
    // Add to history
    setCommandHistory([
      ...commandHistory,
      {
        command: commandInput,
        response,
        timestamp: new Date()
      }
    ]);
    
    // Clear input
    setCommandInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendCommand();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex">
        <Input
          type="text"
          placeholder="/invoice [name] [amount] [description]"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <Button 
          onClick={handleSendCommand} 
          size="sm"
          type="submit"
          disabled={!commandInput.trim()}
          className="ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <CommandHistory history={commandHistory} />
      
      <Separator className="my-4" />
      
      <div className="text-xs text-gray-500">
        <p className="font-medium mb-1">Available Commands:</p>
        <ul className="space-y-1">
          <li><span className="font-mono text-primary-600">/start</span> - Get welcome message</li>
          <li><span className="font-mono text-primary-600">/invoice</span> - Create new invoice</li>
          <li><span className="font-mono text-primary-600">/status</span> - Check invoice status</li>
          <li><span className="font-mono text-primary-600">/upgrade</span> - View paid plans</li>
        </ul>
      </div>
    </div>
  );
}
