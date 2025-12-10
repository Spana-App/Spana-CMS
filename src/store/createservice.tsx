import { create } from 'zustand';
import { useAuthStore } from './authentication';

export interface ServiceFormData {
  title: string;
  description: string;
  price: number;
  image: File | null;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  mediaUrl?: string;
  status: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

interface ServiceResponse {
  message?: string;
  data?: any;
  service?: any;
}

interface ServicesListResponse {
  message?: string;
  data?: Service[];
  services?: Service[];
}

interface ViewServiceModalState{
  isOpen: boolean;
  selectedService: Service | null;
  openViewServiceModal: (service: Service) => void;
  closeViewServiceModal: () => void;
}


interface ServiceModalState {
  isOpen: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  services: Service[];
  openModal: () => void;
  closeModal: () => void;
  createService: (serviceData: ServiceFormData) => Promise<ServiceResponse>;
  deleteService: (serviceId: string) => Promise<ServiceResponse>;
  fetchServices: () => Promise<Service[]>;
  clearError: () => void;
}

// Helper function to upload image and get URL
const uploadImage = async (imageFile: File, _token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

// API function - Create service
const createServiceAPI = async (
  serviceData: ServiceFormData,
  token: string | null
): Promise<ServiceResponse> => {
  const url = 'https://spana-server-5bhu.onrender.com/admin/services';

  if (!token) {
    throw new Error('Authentication token is required');
  }

  // Validate required fields
  if (!serviceData.title || !serviceData.title.trim()) {
    throw new Error('Title is required');
  }
  if (!serviceData.description || !serviceData.description.trim()) {
    throw new Error('Description is required');
  }
  if (!serviceData.price || serviceData.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  try {
    // Prepare the data in the format the server expects
    const title = serviceData.title.trim();
    const description = serviceData.description.trim();
    const price = serviceData.price;
    
    if (!title || !description || !price || price <= 0) {
      throw new Error('All fields (title, description, price) are required and price must be greater than 0');
    }

    // Handle image upload - convert to URL
    let mediaUrl = '';
    if (serviceData.image) {
      // Upload image and get URL
      // TODO: Replace with actual image upload endpoint if available
      mediaUrl = await uploadImage(serviceData.image, token);
    }

    // Create JSON payload as server expects
    const payload = {
      title,
      description,
      price: Number(price), // Ensure it's a number, not string
      mediaUrl: mediaUrl || undefined, // Only include if image was provided
      status: 'active',
    };

    // Remove mediaUrl if empty to avoid sending empty string
    if (!mediaUrl) {
      delete (payload as any).mediaUrl;
    }

    console.log('Sending JSON payload:', payload);

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create service';
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
    return data;
  } catch (error) {
    console.error('Create Service API Error:', error);
    
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



// API function - Delete service
const deleteServiceAPI = async (
  serviceId: string,
  token: string | null
): Promise<ServiceResponse> => {
  const url = `https://spana-server-5bhu.onrender.com/admin/services/${serviceId}`;

  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete service';
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
    return data;
  } catch (error) {
    console.error('Delete Service API Error:', error);
    
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



// API function - Fetch services
const fetchServicesAPI = async (token: string | null): Promise<Service[]> => {
  const url = 'https://spana-server-5bhu.onrender.com/admin/services';

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
      let errorMessage = 'Failed to fetch services';
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

    const data: ServicesListResponse = await response.json();
    console.log(`These are the services ${data}`);
    
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
    console.error('Fetch Services API Error:', error);
    
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

export const useViewServiceModalStore = create<ViewServiceModalState>((set) => ({
  isOpen: false,
  selectedService: null,
  openViewServiceModal: (service: Service) => set({ isOpen: true, selectedService: service }),
  closeViewServiceModal: () => set({ isOpen: false, selectedService: null }),
}));


export const useServiceModalStore = create<ServiceModalState>((set) => ({
  isOpen: false,
  isLoading: false,
  isFetching: false,
  error: null,
  services: [],

  openModal: () => set({ isOpen: true, error: null }),
  closeModal: () => set({ isOpen: false, error: null }),

  createService: async (serviceData: ServiceFormData) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      const response = await createServiceAPI(serviceData, token);
      
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteService: async (serviceId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      const response = await deleteServiceAPI(serviceId, token);
      
      set({ isLoading: false, error: null });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  fetchServices: async () => {
    set({ isFetching: true, error: null });
    
    try {
      const token = useAuthStore.getState().token;
      const services = await fetchServicesAPI(token);

      console.log(`These are the services${JSON.stringify(services, null, 2)}`);

      set({ isFetching: false, error: null, services });
      return services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
