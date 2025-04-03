// Simple store for managing global app state
import { create } from 'zustand';

type StoreState = {
  lastInvoiceUpdate: number;
  triggerRefresh: () => void;
};

export const useStore = create<StoreState>((set) => ({
  lastInvoiceUpdate: Date.now(),
  triggerRefresh: () => set({ lastInvoiceUpdate: Date.now() }),
}));