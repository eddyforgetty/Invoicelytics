// Enhanced store for managing global app state with invoice sync
import { create } from 'zustand';

type StoreState = {
  lastInvoiceUpdate: number;
  triggerRefresh: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
};

// Poll interval in milliseconds
const POLL_INTERVAL = 5000;
let pollTimer: number | null = null;

export const useStore = create<StoreState>((set, get) => ({
  lastInvoiceUpdate: Date.now(),
  isPolling: false,
  
  triggerRefresh: () => set({ lastInvoiceUpdate: Date.now() }),
  
  startPolling: () => {
    const { isPolling } = get();
    
    // Don't start polling if already polling
    if (isPolling) return;
    
    console.log("Starting invoice timestamp polling");
    set({ isPolling: true });
    
    // Function to check for updates
    const checkForUpdates = async () => {
      try {
        const response = await fetch(`/api/last-invoice-timestamp?_=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const data = await response.json();
          const serverTimestamp = data.timestamp;
          const currentTimestamp = get().lastInvoiceUpdate;
          
          // If server has a newer timestamp, update local timestamp
          if (serverTimestamp > currentTimestamp) {
            console.log(`New invoice detected: Server timestamp ${serverTimestamp} > Current timestamp ${currentTimestamp}`);
            set({ lastInvoiceUpdate: serverTimestamp });
          }
        }
      } catch (error) {
        console.error("Error polling for invoice updates:", error);
      }
      
      // Continue polling if still active
      if (get().isPolling) {
        pollTimer = window.setTimeout(checkForUpdates, POLL_INTERVAL);
      }
    };
    
    // Start the polling process
    checkForUpdates();
  },
  
  stopPolling: () => {
    if (pollTimer) {
      window.clearTimeout(pollTimer);
      pollTimer = null;
    }
    set({ isPolling: false });
    console.log("Stopped invoice timestamp polling");
  }
}));