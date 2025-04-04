import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

interface UsageMeterProps {
  onUpgradeClick: () => void;
}

export default function UsageMeter({ onUpgradeClick }: UsageMeterProps) {
  const { user } = useAuth();
  
  // Set default values if user is not logged in
  const currentUsage = user?.currentUsage || 0;
  const tier = user?.tier || "free";
  
  // Calculate total limit based on tier
  let totalLimit = 3; // Default for free tier
  if (tier === "basic") {
    totalLimit = 10;
  } else if (tier === "pro") {
    totalLimit = 999; // Effectively unlimited
  }
  
  // Calculate usage percentage (max 100%)
  const usagePercentage = Math.min((currentUsage / totalLimit) * 100, 100);
  
  // Determine color based on usage percentage
  const getProgressColor = () => {
    if (usagePercentage > 90) return "bg-red-500";
    if (usagePercentage > 75) return "bg-amber-500";
    return "";
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Monthly Usage</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          tier === "free" 
            ? "bg-blue-100 text-blue-800" 
            : tier === "basic" 
              ? "bg-green-100 text-green-800" 
              : "bg-purple-100 text-purple-800"
        }`}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
        </span>
      </div>
      <Progress 
        value={usagePercentage} 
        className={`h-2 mb-1 ${getProgressColor()}`} 
      />
      <div className="flex justify-between text-xs text-gray-600">
        <span>
          {currentUsage}/{tier === "pro" ? "Unlimited" : totalLimit} invoices used
        </span>
        {tier !== "pro" && (
          <button 
            onClick={onUpgradeClick}
            className="text-primary-600 hover:underline"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
