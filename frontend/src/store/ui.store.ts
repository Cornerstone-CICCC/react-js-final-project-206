import { create } from 'zustand';

interface UIStore {
  isAddExpenseModalOpen: boolean;
  openAddExpenseModal: () => void;
  closeAddExpenseModal: () => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  refreshKey: number;
  triggerRefresh: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAddExpenseModalOpen: false,
  openAddExpenseModal: () => set({ isAddExpenseModalOpen: true }),
  closeAddExpenseModal: () => set({ isAddExpenseModalOpen: false }),

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
