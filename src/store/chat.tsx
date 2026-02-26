import { create } from 'zustand';
import { useAuthStore } from './authentication';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const adminChatsUrl =
  (import.meta.env.VITE_ADMIN_CHATS_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/chat/admin/all`;

export interface ChatUser {
  id: string;
  role?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChatMessage {
  id: string;
  bookingId?: string;
  type?: string;
  content?: string;
  createdAt?: string;
  senderId?: string;
  receiverId?: string;
  sender?: ChatUser;
  receiver?: ChatUser;
  [key: string]: unknown;
}

interface ChatState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  messages: ChatMessage[];
  fetchAdminChats: (type?: string, bookingId?: string, limit?: number) => Promise<ChatMessage[]>;
  clearError: () => void;
}

const fetchAdminChatsAPI = async (
  token: string | null,
  type?: string,
  bookingId?: string,
  limit?: number
): Promise<ChatMessage[]> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (bookingId) params.append('bookingId', bookingId);
  if (limit) params.append('limit', String(limit));

  const url = `${adminChatsUrl}${params.toString() ? `?${params.toString()}` : ''}`;

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
      let errorMessage = 'Failed to fetch chats';
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
    if (Array.isArray(data)) return data as ChatMessage[];
    if (Array.isArray(data.messages)) return data.messages as ChatMessage[];

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

export const useChatStore = create<ChatState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  messages: [],

  fetchAdminChats: async (type?: string, bookingId?: string, limit?: number) => {
    set({ isFetching: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view chats. Please log in again.');
      }

      const messages = await fetchAdminChatsAPI(token, type, bookingId, limit);
      set({ isFetching: false, error: null, messages });
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

