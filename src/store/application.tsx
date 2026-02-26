import { create } from 'zustand';
import { useAuthStore } from './authentication';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const applicationsBaseUrl =
  (import.meta.env.VITE_APPLICATIONS_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/admin/applications`;

export interface Application {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  applicantName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

interface ApplicationsResponse {
  message?: string;
  data?: Application[];
  applications?: Application[];
}

interface ApplicationState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  applications: Application[];
  fetchApplications: (status?: string) => Promise<Application[]>;
  verifyApplication: (id: string) => Promise<Application>;
  rejectApplication: (id: string, reason?: string) => Promise<Application>;
  clearError: () => void;
}

const fetchApplicationsAPI = async (
  token: string | null,
  status?: string
): Promise<Application[]> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const url = `${applicationsBaseUrl}${params.toString() ? `?${params}` : ''}`;

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
      let errorMessage = 'Failed to fetch applications';
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

    const data: ApplicationsResponse = await response.json();
    if (Array.isArray(data)) return data as Application[];
    if (Array.isArray(data.applications)) return data.applications as Application[];
    if (Array.isArray(data.data)) return data.data as Application[];

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

const updateApplicationAPI = async (
  id: string,
  action: 'verify' | 'reject',
  token: string | null,
  reason?: string
): Promise<Application> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  if (!id) {
    throw new Error('Application ID is required');
  }

  const url = `${applicationsBaseUrl}/${id}/${action}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(action === 'reject' ? { reason } : undefined),
    });

    if (!response.ok) {
      let errorMessage =
        action === 'verify' ? 'Failed to verify application' : 'Failed to reject application';
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
    return (data.application || data.data || data) as Application;
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

export const useApplicationStore = create<ApplicationState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  applications: [],

  fetchApplications: async (status?: string) => {
    set({ isFetching: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view applications. Please log in again.');
      }

      const applications = await fetchApplicationsAPI(token, status);
      set({ isFetching: false, error: null, applications });
      return applications;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch applications';
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  verifyApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to verify applications. Please log in again.');
      }

      const updated = await updateApplicationAPI(id, 'verify', token);
      set((state) => ({
        isLoading: false,
        error: null,
        applications: state.applications.map((a) => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to verify application';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  rejectApplication: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to reject applications. Please log in again.');
      }

      const updated = await updateApplicationAPI(id, 'reject', token, reason);
      set((state) => ({
        isLoading: false,
        error: null,
        applications: state.applications.map((a) => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reject application';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

