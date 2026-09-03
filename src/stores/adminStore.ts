import { create } from 'zustand';
import type { Analytics, Booking, BookingStatus, Court, BlockedDate, PaymentMethod } from '@/types';
import { adminService } from '@/services/adminService';

interface AdminStoreState {
  analytics: Analytics | null;
  bookings: Booking[];
  courts: Court[];
  blockedDates: BlockedDate[];
  paymentMethods: PaymentMethod[]; // ✅ Add this
  loadingAnalytics: boolean;
  loadingBookings: boolean;
  loadingCourts: boolean;
  loadingPaymentMethods: boolean; // ✅ Add this
  error: string | null;

  loadAnalytics: () => Promise<void>;
  loadBookings: (filters?: {
    status?: BookingStatus;
    courtId?: string;
    date?: string;
    search?: string;
  }) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  loadCourts: () => Promise<void>;
  updateCourt: (court: Court) => Promise<void>;
  loadBlockedDates: (courtId?: string) => Promise<void>;
  addBlockedDate: (blocked: Omit<BlockedDate, 'id'>) => Promise<void>;
  removeBlockedDate: (id: string) => Promise<void>;
  loadPaymentMethods: () => Promise<void>; // ✅ Add this
  updatePaymentMethods: (methods: PaymentMethod[]) => Promise<void>; // ✅ Add this
}

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  analytics: null,
  bookings: [],
  courts: [],
  blockedDates: [],
  paymentMethods: [], // ✅ Add this
  loadingAnalytics: false,
  loadingBookings: false,
  loadingCourts: false,
  loadingPaymentMethods: false, // ✅ Add this
  error: null,

  loadAnalytics: async () => {
    set({ loadingAnalytics: true, error: null });
    try {
      const analytics = await adminService.getAnalytics();
      set({ analytics, loadingAnalytics: false });
    } catch (err) {
      set({
        loadingAnalytics: false,
        error: err instanceof Error ? err.message : 'Failed to load analytics',
      });
    }
  },

  loadBookings: async (filters) => {
    set({ loadingBookings: true, error: null });
    try {
      const bookings = await adminService.getBookings(filters);
      set({ bookings, loadingBookings: false });
    } catch (err) {
      set({
        loadingBookings: false,
        error: err instanceof Error ? err.message : 'Failed to load bookings',
      });
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const updated = await adminService.updateBookingStatus(bookingId, status);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === bookingId ? updated : b)),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update booking' });
    }
  },

  loadCourts: async () => {
    set({ loadingCourts: true, error: null });
    try {
      const courts = await adminService.getCourts();
      set({ courts, loadingCourts: false });
    } catch (err) {
      set({
        loadingCourts: false,
        error: err instanceof Error ? err.message : 'Failed to load courts',
      });
    }
  },

  updateCourt: async (court) => {
    try {
      const updated = await adminService.updateCourt(court);
      set((state) => ({
        courts: state.courts.map((c) => (c.id === court.id ? updated : c)),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update court' });
    }
  },

  loadBlockedDates: async (courtId) => {
    try {
      const blocked = await adminService.getBlockedDates(courtId);
      set({ blockedDates: blocked });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load blocked dates' });
    }
  },

  addBlockedDate: async (blocked) => {
    try {
      await adminService.addBlockedDate(blocked);
      await get().loadBlockedDates(blocked.court_id);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add blocked date' });
    }
  },

  removeBlockedDate: async (id) => {
    try {
      await adminService.removeBlockedDate(id);
      set((state) => ({
        blockedDates: state.blockedDates.filter((b) => b.id !== id),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove blocked date' });
    }
  },

  // ✅ Load payment methods from settings
  loadPaymentMethods: async () => {
    set({ loadingPaymentMethods: true, error: null });
    try {
      const settings = await adminService.getSettings();
      set({
        paymentMethods: settings.payment_methods || [],
        loadingPaymentMethods: false,
      });
    } catch (err) {
      set({
        loadingPaymentMethods: false,
        error: err instanceof Error ? err.message : 'Failed to load payment methods',
      });
    }
  },

  // ✅ Update payment methods
  updatePaymentMethods: async (methods: PaymentMethod[]) => {
    try {
      await adminService.updateSettings({
        payment_methods: methods,
      });
      set({ paymentMethods: methods });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update payment methods' });
      throw err;
    }
  },
}));