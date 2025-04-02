import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandHistoryItem {
  command: string;
  response: string;
  timestamp: Date;
}

interface CommandHistoryProps {
  history: CommandHistoryItem[];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

export default function CommandHistory({ history }: CommandHistoryProps) {
  return (
    <ScrollArea className="h-56 pr-4">
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            No command history yet. Try typing a command like <code className="text-primary-600">/start</code>
          </div>
        ) : (
          history.map((item, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="font-mono text-primary-600">{item.command}</span>
                <span className="text-gray-500 text-xs">{formatRelativeTime(item.timestamp)}</span>
              </div>
              <div className="mt-2 text-gray-700">{item.response}</div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
