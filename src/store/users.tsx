import { create } from 'zustand';
import { useAuthStore } from './authentication';
const otpUrl = import.meta.env.VITE_FETCH_CLIENTS_URL;

const fetchUsersUrl =  otpUrl;

export interface User {
  id: string;
  name: string;
  email: string;
  type?: 'Client' | 'Provider';
  status?: 'Active' | 'Suspended' | 'Inactive';
  joined?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional fields from API
}

interface UsersListResponse {
  message?: string;
  data?: User[];
  users?: User[];
}

interface UsersState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  users: User[];
  fetchUsers: () => Promise<User[]>;
  clearError: () => void;
}

// API function - Fetch users
const fetchUsersAPI = async (token: string | null): Promise<User[]> => {
  const url = fetchUsersUrl;

  if (!token) {
    throw new Error('Authentication token is required');
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
      let errorMessage = 'Failed to fetch users';
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

    const data: UsersListResponse = await response.json();
    console.log(`These are the users ${JSON.stringify(data, null, 2)}`);
    
    // Handle different response structures
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.users && Array.isArray(data.users)) {
      return data.users;
    }
    
    // If response is directly an array
    if (Array.isArray(data)) {
      return data as User[];
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Fetch Users API Error:', error);
    
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

export const useUsersStore = create<UsersState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  users: [],

  fetchUsers: async () => {
    set({ isFetching: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      const users = await fetchUsersAPI(token);

      console.log(`These are the users${JSON.stringify(users, null, 2)}`);

      set({ isFetching: false, error: null, users });
      return users;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
