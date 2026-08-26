import { create } from 'zustand';
import type { AdminUser } from '@/types';
import { ADMIN_CREDENTIALS } from '@/utils/constants';

interface AuthStoreState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    if (
      email.toLowerCase() === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      set({
        user: {
          id: 'admin-1',
          email: ADMIN_CREDENTIALS.email,
          name: 'Admin',
          role: 'admin',
        },
        isAuthenticated: true,
        loading: false,
      });
    } else {
      set({ loading: false, error: 'Invalid email or password' });
      throw new Error('Invalid email or password');
    }
  },

  logout: () => set({ user: null, isAuthenticated: false, error: null }),
}));
