import { create } from 'zustand';
import { useAuthStore } from './authentication';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const complaintsBaseUrl =
  (import.meta.env.VITE_COMPLAINTS_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/admin/complaints`;

export interface Complaint {
  id: string;
  bookingId?: string;
  customerName?: string;
  providerName?: string;
  issue?: string;
  status?: 'open' | 'resolved' | 'closed' | string;
  severity?: 'low' | 'medium' | 'high';
  createdAt?: string;
  resolvedAt?: string;
  resolution?: string;
}

interface ComplaintsResponse {
  message?: string;
  data?: Complaint[];
  complaints?: Complaint[];
}

interface ComplaintsState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  complaints: Complaint[];
  fetchComplaints: (status?: string, severity?: string) => Promise<Complaint[]>;
  resolveComplaint: (id: string, resolution: string) => Promise<Complaint>;
  clearError: () => void;
}

const fetchComplaintsAPI = async (
  token: string | null,
  status?: string,
  severity?: string
): Promise<Complaint[]> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (severity) params.append('severity', severity);

  const url = `${complaintsBaseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

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
      let errorMessage = 'Failed to fetch complaints';
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

    const data: ComplaintsResponse = await response.json();

    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.complaints && Array.isArray(data.complaints)) {
      return data.complaints;
    }
    if (Array.isArray(data)) {
      return data as Complaint[];
    }

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

const resolveComplaintAPI = async (
  id: string,
  resolution: string,
  token: string | null
): Promise<Complaint> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  if (!id) {
    throw new Error('Complaint ID is required');
  }

  const url = `${complaintsBaseUrl}/${id}/resolve`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        status: 'resolved',
        resolution,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to resolve complaint';
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
    return (data.complaint || data.data || data) as Complaint;
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

export const useComplaintsStore = create<ComplaintsState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  complaints: [],

  fetchComplaints: async (status?: string, severity?: string) => {
    set({ isFetching: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view complaints. Please log in again.');
      }

      const complaints = await fetchComplaintsAPI(token, status, severity);
      set({ isFetching: false, error: null, complaints });
      return complaints;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch complaints';
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  resolveComplaint: async (id: string, resolution: string) => {
    set({ isLoading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to resolve complaints. Please log in again.');
      }

      const updated = await resolveComplaintAPI(id, resolution, token);

      set((state) => ({
        isLoading: false,
        error: null,
        complaints: state.complaints.map((c) => (c.id === id ? updated : c)),
      }));

      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resolve complaint';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

