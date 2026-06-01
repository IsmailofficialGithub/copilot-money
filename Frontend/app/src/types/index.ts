// ========== User & Auth ==========
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

// ========== Dashboard ==========
export interface DashboardSummary {
  totalSpent: number;
  previousMonthSpent: number;
  percentChange: number;
  topCategory: {
    name: string;
    amount: number;
  };
  subscriptions: {
    count: number;
    monthlyTotal: number;
  };
  budgetStatus: {
    onTrack: number;
    warning: number;
    over: number;
  };
}

export interface CategorySpending {
  category: string;
  amount: number;
  color?: string;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
}

export interface Anomaly {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category?: string;
}

export interface DashboardData extends DashboardSummary {
  spendingByCategory: CategorySpending[];
  monthlyTrend: MonthlyTrend[];
  anomalies: Anomaly[];
}

// ========== Transactions ==========
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  merchantName: string;
  category: string;
  isRecurring: boolean;
  isAnomaly: boolean;
  source: 'csv' | 'manual' | 'receipt';
  createdAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  category?: string;
  from?: string;
  to?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface CSVUploadResult {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: number;
  categoriesFound: string[];
}

// ========== Budgets ==========
export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly';
  percentUsed: number;
  active: boolean;
  createdAt: string;
}

export type BudgetPeriod = 'monthly' | 'weekly';

export interface BudgetCreateInput {
  category: string;
  amount: number;
  period: BudgetPeriod;
}

// ========== Chat ==========
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  receiptData?: ReceiptData;
  toolsUsed?: string[];
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string | null;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  toolsUsed?: string[];
}

// ========== Receipts ==========
export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  confidence: number;
}

export interface ReceiptUploadResult {
  id: string;
  extractedData: ReceiptData;
  status: 'processing' | 'processed' | 'error';
}

// ========== Settings ==========
export interface UserSettings {
  displayName: string;
  email: string;
  currency: string;
  payDate: number;
  notifications: {
    budgetAlerts: boolean;
    anomalyAlerts: boolean;
    weeklySummary: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

// ========== Toast ==========
export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

// ========== App State ==========
export interface AppState {
  // Auth
  user: User | null;
  session: any | null;
  authLoading: boolean;
  
  // UI
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toasts: Toast[];
  
  // Data
  dashboardData: DashboardData | null;
  transactions: Transaction[];
  budgets: Budget[];
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  
  // Loading states
  dashboardLoading: boolean;
  transactionsLoading: boolean;
  budgetsLoading: boolean;
  chatLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setAuthLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setDashboardData: (data: DashboardData | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  setCurrentConversation: (conv: ChatConversation | null) => void;
  setDashboardLoading: (loading: boolean) => void;
  setTransactionsLoading: (loading: boolean) => void;
  setBudgetsLoading: (loading: boolean) => void;
  setChatLoading: (loading: boolean) => void;
}

// Category colors for charts
export const CATEGORY_COLORS: Record<string, string> = {
  'Groceries': '#22C55E',
  'Transport': '#3B82F6',
  'Dining': '#F59E0B',
  'Shopping': '#EC4899',
  'Entertainment': '#8B5CF6',
  'Utilities': '#EF4444',
  'Health': '#06B6D4',
  'Travel': '#F97316',
  'Education': '#6366F1',
  'Subscriptions': '#14B8A6',
  'Other': '#9CA3AF',
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS);
