import type { Analytics, Booking, BookingStatus, Court, BlockedDate } from '@/types';
import { apiRequest } from './api';

export const adminService = {
  async getAnalytics(): Promise<Analytics> {
    return apiRequest<Analytics>('/api/admin/analytics');
  },

  async getBookings(filters?: {
    status?: BookingStatus;
    courtId?: string;
    date?: string;
    search?: string;
  }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.courtId) params.set('court_id', filters.courtId);
    if (filters?.date) params.set('date', filters.date);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return apiRequest<Booking[]>(`/api/admin/bookings${query ? `?${query}` : ''}`);
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    return apiRequest<Booking>(`/api/admin/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getCourts(): Promise<Court[]> {
    return apiRequest<Court[]>('/api/admin/courts');
  },

  async updateCourt(court: Court): Promise<Court> {
    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(court),
    });
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    const query = courtId ? `?court_id=${courtId}` : '';
    return apiRequest<BlockedDate[]>(`/api/admin/blocked-dates${query}`);
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    return apiRequest<BlockedDate>('/api/admin/blocked-dates', {
      method: 'POST',
      body: JSON.stringify(blocked),
    });
  },

  async removeBlockedDate(id: string): Promise<void> {
    return apiRequest<void>(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
  },
};