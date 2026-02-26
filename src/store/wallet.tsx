import { create } from 'zustand';
import { useAuthStore } from './authentication';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const walletSummaryUrl =
  (import.meta.env.VITE_WALLET_SUMMARY_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/admin/wallet/summary`;

const walletTransactionsUrl =
  (import.meta.env.VITE_WALLET_TRANSACTIONS_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/admin/wallet/transactions`;

export interface WalletTransaction {
  id: string;
  type?: string;
  amount?: number;
  direction?: 'in' | 'out';
  createdAt?: string;
  description?: string;
  bookingId?: string;
  [key: string]: unknown;
}

export interface WalletSummary {
  id: string;
  totalHeld: number;
  totalReleased: number;
  totalCommission: number;
  transactions?: WalletTransaction[];
}

interface WalletState {
  isLoading: boolean;
  isFetchingSummary: boolean;
  isFetchingTransactions: boolean;
  error: string | null;
  summary: WalletSummary | null;
  transactions: WalletTransaction[];
  fetchSummary: () => Promise<WalletSummary>;
  fetchTransactions: () => Promise<WalletTransaction[]>;
  clearError: () => void;
}

const fetchSummaryAPI = async (token: string | null): Promise<WalletSummary> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  try {
    const response = await fetch(walletSummaryUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch wallet summary';
      try {
        const errorData = await response.json();
        if (errorData.message && errorData.error) {
          errorMessage = `${errorData.message}: ${errorData.error}`;
        } else {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        errorMessage = response.statusText || `Server returned ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return (data.data || data.summary || data) as WalletSummary;
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        const errorMessage = !navigator.onLine
          ? 'No internet connection detected.'
          : 'Unable to connect to server. Please check your connection.';
        throw new Error(errorMessage);
      }
      throw new Error(`Network error: ${error.message}`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred');
  }
};

const fetchTransactionsAPI = async (token: string | null): Promise<WalletTransaction[]> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  try {
    const response = await fetch(walletTransactionsUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch wallet transactions';
      try {
        const errorData = await response.json();
        if (errorData.message && errorData.error) {
          errorMessage = `${errorData.message}: ${errorData.error}`;
        } else {
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        errorMessage = response.statusText || `Server returned ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (Array.isArray(data)) return data as WalletTransaction[];
    if (Array.isArray(data.transactions)) return data.transactions as WalletTransaction[];
    if (Array.isArray(data.data)) return data.data as WalletTransaction[];

    throw new Error('Invalid response format from server');
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        const errorMessage = !navigator.onLine
          ? 'No internet connection detected.'
          : 'Unable to connect to server. Please check your connection.';
        throw new Error(errorMessage);
      }
      throw new Error(`Network error: ${error.message}`);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred');
  }
};

export const useWalletStore = create<WalletState>((set) => ({
  isLoading: false,
  isFetchingSummary: false,
  isFetchingTransactions: false,
  error: null,
  summary: null,
  transactions: [],

  fetchSummary: async () => {
    set({ isFetchingSummary: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view wallet summary. Please log in again.');
      }

      const summary = await fetchSummaryAPI(token);
      set({ isFetchingSummary: false, error: null, summary });
      return summary;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch wallet summary';
      set({ isFetchingSummary: false, error: errorMessage });
      throw error;
    }
  },

  fetchTransactions: async () => {
    set({ isFetchingTransactions: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view wallet transactions. Please log in again.');
      }

      const transactions = await fetchTransactionsAPI(token);
      set({ isFetchingTransactions: false, error: null, transactions });
      return transactions;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch wallet transactions';
      set({ isFetchingTransactions: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

