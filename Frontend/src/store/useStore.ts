import { create } from 'zustand';
import type { AppState, Toast } from '@/types';

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  session: null,
  authLoading: true,

  // UI
  sidebarOpen: true,
  theme: 'light',
  toasts: [],

  // Data
  dashboardData: null,
  transactions: [],
  budgets: [],
  conversations: [],
  currentConversation: null,

  // Loading states
  dashboardLoading: false,
  transactionsLoading: false,
  budgetsLoading: false,
  chatLoading: false,

  // Actions
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts.slice(-2), newToast] }));
    
    const duration = toast.type === 'error' ? 0 : toast.duration || (toast.type === 'warning' ? 8000 : 5000);
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setDashboardData: (dashboardData) => set({ dashboardData }),
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  setCurrentConversation: (currentConversation) => set({ currentConversation }),
  setDashboardLoading: (dashboardLoading) => set({ dashboardLoading }),
  setTransactionsLoading: (transactionsLoading) => set({ transactionsLoading }),
  setBudgetsLoading: (budgetsLoading) => set({ budgetsLoading }),
  setChatLoading: (chatLoading) => set({ chatLoading }),
}));
