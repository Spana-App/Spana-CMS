import { create } from 'zustand';
import { useAuthStore } from './authentication';

const fetchBookingsUrl = import.meta.env.VITE_FETCH_BOOKINGS_URL;

export interface Payment {
  id?: string;
  referenceNumber?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  status?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  userId?: string;
  serviceId?: string;
  clientName?: string;
  serviceName?: string;
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  bookingDate?: string;
  scheduledDate?: string;
  price?: number;
  payment?: Payment | string; // Can be an object or string
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional fields from API
}

interface BookingsListResponse {
  message?: string;
  data?: Booking[];
  bookings?: Booking[];
}

interface BookingsState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  bookings: Booking[];
  fetchBookings: () => Promise<Booking[]>;
  clearError: () => void;
}

// API function - Fetch bookings
const fetchBookingsAPI = async (token: string | null): Promise<Booking[]> => {
  const url = fetchBookingsUrl?.trim();

  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  if (!url) {
    throw new Error('Bookings API URL is not configured');
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
      
      let errorMessage = 'Failed to fetch bookings';
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

    const data: BookingsListResponse = await response.json();
    
    // Handle different response structures
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.bookings && Array.isArray(data.bookings)) {
      return data.bookings;
    }
    
    // If response is directly an array
    if (Array.isArray(data)) {
      return data as Booking[];
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Fetch Bookings API Error:', error);
    
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

export const useBookingsStore = create<BookingsState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  bookings: [],

  fetchBookings: async () => {
    set({ isFetching: true, error: null });
    
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;
      
      // Check if user is authenticated
      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view bookings. Please log in again.');
      }
      
      const bookings = await fetchBookingsAPI(token);

    //   console.log(`Fetched bookings: ${JSON.stringify(bookings, null, 2)}`);

      set({ isFetching: false, error: null, bookings });
      return bookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bookings';
      console.error('Error fetching bookings:', error);
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
