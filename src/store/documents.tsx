import { create } from 'zustand';
import { useAuthStore } from './authentication';

const DEFAULT_API_BASE = 'https://spana-server-5bhu.onrender.com';

const pendingDocumentsUrl =
  (import.meta.env.VITE_FETCH_PENDING_DOCUMENTS_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/admin/documents/pending`;

const verifyDocumentBaseUrl =
  (import.meta.env.VITE_VERIFY_DOCUMENT_URL as string | undefined)?.trim() ||
  `${DEFAULT_API_BASE}/admin/documents`;

export interface PendingDocument {
  id: string;
  userId: string;
  type?: string;
  url?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  metadata?: {
    name?: string;
    size?: number;
    [key: string]: unknown;
  };
  [key: string]: any;
}

interface PendingDocumentsResponse {
  message?: string;
  data?: PendingDocument[];
  documents?: PendingDocument[];
}

interface DocumentsState {
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  documents: PendingDocument[];
  fetchPendingDocuments: () => Promise<PendingDocument[]>;
  verifyDocument: (docId: string, userId: string, verified: boolean) => Promise<PendingDocument>;
  clearError: () => void;
}

const fetchPendingDocumentsAPI = async (token: string | null): Promise<PendingDocument[]> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  try {
    const response = await fetch(pendingDocumentsUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch pending documents';
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

    const data: PendingDocumentsResponse = await response.json();

    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.documents && Array.isArray(data.documents)) {
      return data.documents;
    }
    if (Array.isArray(data)) {
      return data as PendingDocument[];
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

const verifyDocumentAPI = async (
  docId: string,
  userId: string,
  verified: boolean,
  token: string | null
): Promise<PendingDocument> => {
  if (!token) {
    throw new Error('Authentication token is required. Please log in again.');
  }

  if (!docId) {
    throw new Error('Document ID is required');
  }

  const url = `${verifyDocumentBaseUrl}/${docId}/verify`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ userId, verified }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to verify document';
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
    return (data.document || data.data || data) as PendingDocument;
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

export const useDocumentsStore = create<DocumentsState>((set) => ({
  isLoading: false,
  isFetching: false,
  error: null,
  documents: [],

  fetchPendingDocuments: async () => {
    set({ isFetching: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to view documents. Please log in again.');
      }

      const documents = await fetchPendingDocumentsAPI(token);
      set({ isFetching: false, error: null, documents });
      return documents;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
      set({ isFetching: false, error: errorMessage });
      throw error;
    }
  },

  verifyDocument: async (docId: string, userId: string, verified: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      if (!token || !authState.isAuthenticated) {
        throw new Error('You must be logged in to verify documents. Please log in again.');
      }

      const updated = await verifyDocumentAPI(docId, userId, verified, token);

      set((state) => ({
        isLoading: false,
        error: null,
        documents: state.documents.filter((doc) => doc.id !== docId),
      }));

      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify document';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

