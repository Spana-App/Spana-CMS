import { create } from 'zustand';
import { useAuthStore } from './authentication';

export interface ServiceFormData {
  title: string;
  description: string;
  price: number;
  image: File | null;
}

interface ServiceResponse {
  message?: string;
  data?: any;
  service?: any;
}

interface ServiceModalState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  createService: (serviceData: ServiceFormData) => Promise<ServiceResponse>;
  clearError: () => void;
}

// Helper function to upload image and get URL
const uploadImage = async (imageFile: File, _token: string): Promise<string> => {
  // If you have a separate image upload endpoint, use it here
  // For now, we'll convert to data URL as a fallback
  // You should replace this with actual image upload to your server
  // Example: POST to /admin/upload/image with FormData containing the image
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

export const useServiceModalStore = create<ServiceModalState>((set) => ({
  isOpen: false,
  isLoading: false,
  error: null,

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

  clearError: () => set({ error: null }),
}));
