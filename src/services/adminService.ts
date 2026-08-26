import type { Analytics, Booking, BookingStatus, Court, BlockedDate } from '@/types';
import { APP_CONFIG } from '@/utils/constants';
import { apiRequest, delay } from './api';
import { mockBookings, generateMockAnalytics, mockCourts, mockBlockedDates } from './mockData';

export const adminService = {
  async getAnalytics(): Promise<Analytics> {
    if (APP_CONFIG.demoMode) {
      await delay(400);
      return generateMockAnalytics();
    }
    return apiRequest<Analytics>('/api/admin/analytics');
  },

  async getBookings(filters?: {
    status?: BookingStatus;
    courtId?: string;
    date?: string;
    search?: string;
  }): Promise<Booking[]> {
    if (APP_CONFIG.demoMode) {
      await delay(400);
      let result = [...mockBookings];
      if (filters?.status) result = result.filter((b) => b.status === filters.status);
      if (filters?.courtId) result = result.filter((b) => b.court_id === filters.courtId);
      if (filters?.date) result = result.filter((b) => b.date === filters.date);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (b) =>
            b.reference_code.toLowerCase().includes(q) ||
            b.customer.name.toLowerCase().includes(q) ||
            b.customer.email.toLowerCase().includes(q) ||
            b.court_name.toLowerCase().includes(q)
        );
      }
      return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.courtId) params.set('court_id', filters.courtId);
    if (filters?.date) params.set('date', filters.date);
    if (filters?.search) params.set('search', filters.search);
    return apiRequest<Booking[]>(`/api/admin/bookings?${params.toString()}`);
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      const booking = mockBookings.find((b) => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');
      booking.status = status;
      booking.updated_at = new Date().toISOString();
      return booking;
    }
    return apiRequest<Booking>(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getCourts(): Promise<Court[]> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      return [...mockCourts];
    }
    return apiRequest<Court[]>('/api/admin/courts');
  },

  async updateCourt(court: Court): Promise<Court> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      const idx = mockCourts.findIndex((c) => c.id === court.id);
      if (idx >= 0) mockCourts[idx] = court;
      return court;
    }
    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(court),
    });
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    if (APP_CONFIG.demoMode) {
      await delay(200);
      return courtId
        ? mockBlockedDates.filter((b) => b.court_id === courtId)
        : [...mockBlockedDates];
    }
    const query = courtId ? `?court_id=${courtId}` : '';
    return apiRequest<BlockedDate[]>(`/api/admin/blocked-dates${query}`);
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      const newBlocked: BlockedDate = {
        ...blocked,
        id: `blocked-${Date.now()}`,
      };
      mockBlockedDates.push(newBlocked);
      return newBlocked;
    }
    return apiRequest<BlockedDate>('/api/admin/blocked-dates', {
      method: 'POST',
      body: JSON.stringify(blocked),
    });
  },

  async removeBlockedDate(id: string): Promise<void> {
    if (APP_CONFIG.demoMode) {
      await delay(200);
      const idx = mockBlockedDates.findIndex((b) => b.id === id);
      if (idx >= 0) mockBlockedDates.splice(idx, 1);
      return;
    }
    return apiRequest<void>(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
  },
};
