import { supabase } from './supabase';
import type { 
  DashboardData, 
  Transaction,
  TransactionFilters, 
  TransactionsResponse, 
  CSVUploadResult,
  Budget, 
  BudgetCreateInput,
  ChatRequest,
  ChatResponse,
  ChatConversation,
  ReceiptUploadResult,
  UserSettings,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Helper to get auth headers
const getHeaders = async (isMultipart = false) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Generic API call
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const isMultipart = options.body instanceof FormData;
  const headers = await getHeaders(isMultipart);
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error: ${res.status}`);
  }

  return res.json();
};

type ApiTransaction = Transaction & {
  merchant_name?: string;
  is_recurring?: boolean;
  is_anomaly?: boolean;
  created_at?: string;
};

const normalizeTransaction = (txn: ApiTransaction): Transaction => ({
  id: txn.id,
  date: txn.date,
  amount: Number(txn.amount),
  description: txn.description || '',
  merchantName: txn.merchantName || txn.merchant_name || 'Unknown',
  category: txn.category || 'Other',
  isRecurring: Boolean(txn.isRecurring ?? txn.is_recurring),
  isAnomaly: Boolean(txn.isAnomaly ?? txn.is_anomaly),
  source: txn.source || 'manual',
  createdAt: txn.createdAt || txn.created_at || '',
});

const toTransactionPayload = (txn: Omit<Transaction, 'id' | 'createdAt' | 'isAnomaly'>) => ({
  date: txn.date,
  amount: txn.amount,
  merchant_name: txn.merchantName,
  category: txn.category,
  description: txn.description,
  is_recurring: txn.isRecurring,
  source: txn.source,
});

// ========== Dashboard ==========
export const fetchDashboard = async (): Promise<DashboardData> => {
  return apiCall<DashboardData>('/dashboard');
};

// ========== Transactions ==========
export const fetchTransactions = async (filters: TransactionFilters = {}): Promise<TransactionsResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.category) params.set('category', filters.category);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.search) params.set('search', filters.search);
  if (filters.minAmount) params.set('minAmount', String(filters.minAmount));
  if (filters.maxAmount) params.set('maxAmount', String(filters.maxAmount));
  
  const response = await apiCall<TransactionsResponse>(`/transactions?${params.toString()}`);
  return {
    ...response,
    data: response.data.map((txn) => normalizeTransaction(txn as ApiTransaction)),
  };
};

export const createTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'isAnomaly'>) => {
  const transaction = await apiCall<ApiTransaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(toTransactionPayload(data)),
  });
  return normalizeTransaction(transaction);
};

export const uploadCSV = async (file: File): Promise<CSVUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiCall<CSVUploadResult>('/transactions/upload', {
    method: 'POST',
    body: formData,
  });
};

export const updateTransactionCategory = async (id: string, category: string) => {
  return apiCall(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ category }),
  });
};

export const deleteTransaction = async (id: string) => {
  return apiCall(`/transactions/${id}`, {
    method: 'DELETE',
  });
};

// ========== Budgets ==========
export const fetchBudgets = async (): Promise<{ data: Budget[] }> => {
  return apiCall<{ data: Budget[] }>('/budgets');
};

export const createBudget = async (input: BudgetCreateInput): Promise<Budget> => {
  return apiCall<Budget>('/budgets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateBudget = async (id: string, input: Partial<BudgetCreateInput>): Promise<Budget> => {
  return apiCall<Budget>(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
};

export const deleteBudget = async (id: string) => {
  return apiCall(`/budgets/${id}`, {
    method: 'DELETE',
  });
};

// ========== Chat ==========
export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  return apiCall<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const fetchConversation = async (conversationId: string): Promise<{ messages: ChatConversation['messages'] }> => {
  return apiCall<{ messages: ChatConversation['messages'] }>(`/chat?conversationId=${conversationId}`);
};

export const fetchConversations = async (): Promise<{ data: ChatConversation[] }> => {
  return apiCall<{ data: ChatConversation[] }>('/chat/conversations');
};

export const deleteConversation = async (conversationId: string) => {
  return apiCall(`/chat/${conversationId}`, {
    method: 'DELETE',
  });
};

// ========== Receipts ==========
export const uploadReceipt = async (file: File, message?: string): Promise<ReceiptUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  if (message) formData.append('message', message);
  
  return apiCall<ReceiptUploadResult>('/receipts', {
    method: 'POST',
    body: formData,
  });
};

// ========== Settings ==========
export const fetchSettings = async (): Promise<UserSettings> => {
  return apiCall<UserSettings>('/settings');
};

export const updateSettings = async (settings: Partial<UserSettings>) => {
  return apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

export const exportData = async (): Promise<Blob> => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/settings/export`, {
    headers,
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

export const deleteAllTransactions = async () => {
  return apiCall('/settings/transactions', {
    method: 'DELETE',
  });
};

export const deleteAccount = async () => {
  return apiCall('/settings/account', {
    method: 'DELETE',
  });
};
