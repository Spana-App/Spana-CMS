import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const loginUrl = import.meta.env.VITE_LOGIN_URL;
const otpUrl = import.meta.env.VITE_OTP_URL;

console.log('Login URL:', loginUrl);
// Use the loginUrl on 

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  requiresOTP?: boolean;
  email?: string;
  nextStep?: string;
}

interface OTPVerification {
  email: string;
  otp: string;
}

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}


interface AuthState {
  token: string | null;
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// API function - Login with email and password
const loginAPI = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const url = loginUrl;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        // Combine message and error if both exist
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
    console.log("This is the Data,", data);
    
    return {
      message: data.message || 'Login successful',
      requiresOTP: data.requiresOTP,
      email: data.email || credentials.email,
      nextStep: data.nextStep,
    };
  } catch (error) {
    // Log the full error for debugging
    console.error('Login API Error Details:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      url,
      isOnline: navigator.onLine,
    });
    
    if (error instanceof TypeError) {
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        // Check browser console for CORS errors
        console.error('CORS or Network Error - Check browser console (F12) for details');
        const errorMessage = !navigator.onLine 
          ? 'No internet connection detected.'
          : 'Unable to connect to server. Check browser console (F12) for CORS errors.';
        throw new Error(errorMessage);
      }
      throw new Error(`Network error: ${error.message}`);
    }
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

// API function - Verify OTP and get token
const verifyOTPAPI = async (verification: OTPVerification): Promise<AuthResponse> => {
 const otp = otpUrl;
  try {
    const response = await fetch(otp, {
      method: 'POST',
      mode: 'cors',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(verification),
    });

    if (!response.ok) {
      let errorMessage = 'OTP verification failed';
      try {
        const errorData = await response.json();
        // Combine message and error if both exist
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
    
    // Handle different response structures
    if (data.data && data.data.token) {
      return {
        token: data.data.token,
        user: data.data.user || data.user,
      };
    }
    
    if (data.token) {
      return {
        token: data.token,
        user: data.user,
      };
    }
    console.log("This is the Token,", data.token);

    throw new Error('Invalid response format from server');
  } catch (error) {
    // Log the full error for debugging
    console.error('Verify OTP API Error:', error);
    
    if (error instanceof TypeError) {
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        const errorMessage = !navigator.onLine 
          ? 'No internet connection detected.'
          : 'Unable to connect to server. This may be a CORS issue or the server is not responding.';
        throw new Error(errorMessage);
      }
      throw new Error(`Network error: ${error.message}`);
    }
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingEmail: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null, pendingEmail: null });
        try {
          const response = await loginAPI(credentials);
          
          // Store pending email if OTP is required
          if (response.requiresOTP) {
            set({
              isLoading: false,
              pendingEmail: response.email || credentials.email,
              error: null,
            });
          } else {
            // If no OTP required, this shouldn't happen but handle it
            set({
              isLoading: false,
              error: 'Unexpected response from server',
            });
            throw new Error('Unexpected response from server');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            pendingEmail: null,
          });
          throw error;
        }
      },

      verifyOTP: async (email: string, otp: string) => {
        if (!email) {
          throw new Error('Email is required for OTP verification.');
        }

        set({ isLoading: true, error: null });
        try {
          const response = await verifyOTPAPI({
            email: email,
            otp: otp,
          });
          
          // Store token securely
          set({
            token: response.token,
            user: response.user || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            pendingEmail: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            token: null,
            user: null,
          });
          throw error;
        }
      },

      

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
          pendingEmail: null,
        });
        localStorage.removeItem('auth-storage');
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingEmail: state.pendingEmail,
      }),
    }
  )
  
);

