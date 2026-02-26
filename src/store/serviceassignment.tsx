import { create } from 'zustand';
import { useAuthStore } from './authentication';
import type { Service } from './createservice';

// Provider-centric: POST /admin/providers/:providerId/services with body { serviceIds }
// Service-centric: POST /admin/services/:serviceId/assign with body { providerId }
const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const assignServiceBaseUrl =
  import.meta.env.VITE_ASSIGN_SERVICE_URL ||
  `${DEFAULT_API_BASE}/admin/services`;

const assignProviderBaseUrl =
  import.meta.env.VITE_ASSIGN_PROVIDER_SERVICES_URL ||
  `${DEFAULT_API_BASE}/admin/providers`;

const fetchProviderServicesUrl =
  import.meta.env.VITE_FETCH_PROVIDER_SERVICES_URL ||
  `${DEFAULT_API_BASE}/admin/providers`;
const useProviderCentricAssign = import.meta.env.VITE_ASSIGN_USE_PROVIDER_ENDPOINT === 'true';

export interface ServiceAssignment {
  providerId: string;
  serviceIds: string[];
}

/** API response shape (assign/unassign): { message, service: { id, providerId } } */
export interface AssignmentServiceResult {
  id: string;
  providerId: string | null;
}

interface AssignmentResponse {
  message?: string;
  service?: AssignmentServiceResult;
  services?: AssignmentServiceResult[];
  data?: unknown;
  success?: boolean;
}

interface ProviderServicesResponse {
  message?: string;
  data?: Service[];
  services?: Service[];
}

interface ServiceAssignmentState {
  isLoading: boolean;
  error: string | null;
  assignServices: (providerId: string, serviceIds: string[]) => Promise<AssignmentResponse>;
  fetchProviderServices: (providerId: string) => Promise<Service[]>;
  clearError: () => void;
}

// API function - Assign services to provider
// Supports two patterns:
// A) Provider-centric: POST /admin/providers/:providerId/services  body: { serviceIds: string[] }
// B) Service-centric:  POST /admin/services/:serviceId/assign      body: { providerId: string }
const assignServicesAPI = async (
  providerId: string,
  serviceIds: string[],
  token: string | null
): Promise<AssignmentResponse> => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  if (!providerId) {
    throw new Error('Provider ID is required');
  }

  if (!serviceIds || serviceIds.length === 0) {
    throw new Error('At least one service must be selected');
  }

  const clean = (u: string) => u.replace(/\/+$/, '').replace(/\/+/g, '/');

  // Try provider-centric endpoint first (most common for "assign services to this provider")
  if (useProviderCentricAssign) {
    const url = `${clean(assignProviderBaseUrl)}/${providerId}/services`;
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ serviceIds }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to assign services';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || `Server returned ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { ...data, success: true };
  }

  // Service-centric: one request per service
  const results: AssignmentResponse[] = [];
  const errors: string[] = [];

  for (const serviceId of serviceIds) {
    try {
      const url = `${clean(assignServiceBaseUrl)}/${serviceId}/assign`;
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({ providerId }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to assign service ${serviceId}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || `Server returned ${response.status}`;
        }
        if (response.status === 404) {
          errors.push(`Endpoint not found (404). Try adding VITE_ASSIGN_USE_PROVIDER_ENDPOINT=true to .env to use provider endpoint instead.`);
        } else {
          errors.push(`${errorMessage} (Service: ${serviceId})`);
        }
        continue;
      }

      const data = await response.json();
      results.push(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : `Failed to assign service ${serviceId}`;
      errors.push(msg);
    }
  }

  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return {
    message: `Successfully assigned ${results.length} of ${serviceIds.length} service(s)`,
    success: true,
    data: results,
  };
};

// API function - Fetch services assigned to a provider
const fetchProviderServicesAPI = async (
  providerId: string,
  token: string | null
): Promise<Service[]> => {
  const url = `${fetchProviderServicesUrl}/${providerId}/services`;

  if (!token) {
    throw new Error('Authentication token is required');
  }

  if (!providerId) {
    throw new Error('Provider ID is required');
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
      let errorMessage = 'Failed to fetch provider services';
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

    const data: ProviderServicesResponse = await response.json();
    
    // Handle different response structures
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.services && Array.isArray(data.services)) {
      return data.services;
    }
    
    // If response is directly an array
    if (Array.isArray(data)) {
      return data as Service[];
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Fetch Provider Services API Error:', error);
    
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

export const useServiceAssignmentStore = create<ServiceAssignmentState>((set) => ({
  isLoading: false,
  error: null,

  assignServices: async (providerId: string, serviceIds: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;
      
      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to assign services.');
      }
      
      const response = await assignServicesAPI(providerId, serviceIds, token);
      
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign services';
      console.error('Error assigning services:', error);
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  fetchProviderServices: async (providerId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;
      
      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to fetch provider services.');
      }
      
      const services = await fetchProviderServicesAPI(providerId, token);
      
      set({ isLoading: false, error: null });
      return services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch provider services';
      console.error('Error fetching provider services:', error);
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
