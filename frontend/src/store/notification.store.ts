import { create } from 'zustand';
import { type IExpense, getPendingRequests } from '../api/expense';

interface NotificationStore {
  pendingRequests: IExpense[];

  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (request: IExpense) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  pendingRequests: [],

  // Fetch initial list
  fetchNotifications: async () => {
    const data = await getPendingRequests();
    set({ pendingRequests: data || [] });
  },

  // Add one instantly
  addNotification: (request) => {
    const current = get().pendingRequests;
    // Avoid duplicates
    if (!current.find((r) => r._id === request._id)) {
      set({ pendingRequests: [request, ...current] });
    }
  },

  // Remove one (when User accepts/declines)
  removeNotification: (id) => {
    set({
      pendingRequests: get().pendingRequests.filter((req) => req._id !== id),
    });
  },
}));
