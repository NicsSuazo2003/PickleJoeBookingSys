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
  updateProfile: (data: { name?: string; email?: string; phone?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest<any>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
        }),
      });
      const updated = res?.data ?? res;
      set((state) => ({
        user: state.user
          ? { ...state.user, name: updated.name, email: updated.email, phone: updated.phone }
          : state.user,
        loading: false,
      }));
    } catch (err: any) {
      set({ loading: false, error: err.message || 'Failed to update profile' });
      throw err;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      set({ loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || 'Failed to change password' });
      throw err;
    }
  },
}));