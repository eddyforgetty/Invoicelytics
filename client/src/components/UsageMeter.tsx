import { Progress } from "@/components/ui/progress";

interface UsageMeterProps {
  onUpgradeClick: () => void;
}

export default function UsageMeter({ onUpgradeClick }: UsageMeterProps) {
  // Hard-coded for demo purposes
  const usedInvoices = 2;
  const totalInvoices = 3;
  const tier = "free";
  
  const usagePercentage = (usedInvoices / totalInvoices) * 100;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Monthly Usage</h3>
        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
          {tier === "free" ? "Free Tier" : tier === "basic" ? "Basic Tier" : "Pro Tier"}
        </span>
      </div>
      <Progress value={usagePercentage} className="h-2 mb-1" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {usedInvoices}/{totalInvoices} invoices used
        </span>
        <button 
          onClick={onUpgradeClick}
          className="text-primary-600 hover:underline"
        >
          Upgrade
        </button>
      </div>
    </div>
  );
}
