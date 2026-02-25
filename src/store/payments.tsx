import { create } from 'zustand';
import { useAuthStore } from './authentication';

const fetchPaymentsUrl = import.meta.env.VITE_FETCH_PAYMENTS_URL || 'https://spana-server-5bhu.onrender.com/admin/payments';

export interface Payment {
  id: string;
  referenceNumber?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  status?: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Processing';
  transactionId?: string;
  escrowStatus?: string;
  commissionRate?: number;
  commissionAmount?: number;
  providerPayout?: number;
  tipAmount?: number;
  payfastPaymentId?: string;
  payfastSignature?: string;
  customerId?: string;
  bookingId?: string;
  customerName?: string;
  bookingReference?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional fields from API
}

interface PaymentsListResponse {
  message?: string;
  data?: Payment[];
  payments?: Payment[];
}

interface PaymentsState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  payments: Payment[];
  fetchPayments: () => Promise<Payment[]>;
  clearError: () => void;
}

// API function - Fetch payments
const fetchPaymentsAPI = async (token: string | null): Promise<Payment[]> => {
  const url = fetchPaymentsUrl?.trim();

  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  if (!url) {
    throw new Error('Payments API URL is not configured');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        throw new Error('Authentication failed. Your session may have expired. Please log in again.');
      }
      
      let errorMessage = 'Failed to fetch payments';
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

    const data: PaymentsListResponse = await response.json();
    
    // Handle different response structures
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.payments && Array.isArray(data.payments)) {
      return data.payments;
    }
    
    // If response is directly an array
    if (Array.isArray(data)) {
      return data as Payment[];
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Fetch Payments API Error:', error);
    
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

export const usePaymentsStore = create<PaymentsState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  payments: [],

  fetchPayments: async () => {
    set({ isFetching: true, error: null });
    
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;
      
      // Check if user is authenticated
      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view payments. Please log in again.');
      }
      
      const payments = await fetchPaymentsAPI(token);

      set({ isFetching: false, error: null, payments });
      return payments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payments';
      console.error('Error fetching payments:', error);
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
