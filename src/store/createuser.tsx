// useAddUserStore.ts
import { create } from 'zustand';

export type UserType = 'serviceProvider' | 'user';

interface ServiceProviderPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AddUserState {
  isOpen: boolean;
  activeTab: UserType;
  isLoading: boolean;
  error: string | null;

  openModal: () => void;
  closeModal: () => void;
  setActiveTab: (tab: UserType) => void;
  createServiceProvider: (payload: ServiceProviderPayload) => Promise<boolean>;
}

const useAddUserStore = create<AddUserState>((set) => ({
  isOpen: false,
  activeTab: 'serviceProvider',
  isLoading: false,
  error: null,

  openModal: () => set({ isOpen: true, error: null }),
  closeModal: () => set({ isOpen: false, error: null, activeTab: 'serviceProvider' }),
  setActiveTab: (tab) => set({ activeTab: tab, error: null }),

  createServiceProvider: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const url = import.meta.env.VITE_CREATE_SERVICE_PROVIDER_URL;

      const raw = localStorage.getItem('auth-storage');
      const token: string | null = raw ? JSON.parse(raw)?.state?.token ?? null : null;

      if (!token) {
        throw new Error('No auth token found. Please log in again.');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      set({ isLoading: false });
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Something went wrong',
      });
      return false;
    }
  },
}));

export default useAddUserStore;