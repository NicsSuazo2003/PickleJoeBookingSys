import { create } from 'zustand';
import type { AdminUser } from '@/types';
import { apiRequest } from '@/services/api';

interface AuthStoreState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiRequest<{ token: string; user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('admin_token', response.token);
      
      set({
        user: response.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Invalid email or password',
        isAuthenticated: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ user: null, isAuthenticated: false, error: null });
  },

  init: async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      set({ isAuthenticated: true });
    }
  },
}));