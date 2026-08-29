import type { Analytics, Booking, BookingStatus, Court, BlockedDate } from '@/types';
import { apiRequest } from './api';
import { normalizeCourt, buildCourtPayload } from './courtService';

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
    const res = await apiRequest<any>(`/api/admin/bookings${query ? `?${query}` : ''}`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const res = await apiRequest<any>(`/api/admin/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res?.data ?? res;
  },

  async getCourts(): Promise<Court[]> {
    const data = await apiRequest<any>('/api/admin/courts');
    const rawList = Array.isArray(data) ? data : data?.data || data?.courts || [];
    return rawList.map((court: any, idx: number) => normalizeCourt(court, idx));
  },

  async updateCourt(court: Court): Promise<Court> {
    const payload = buildCourtPayload(court);
    const res = await apiRequest<any>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const updated = res?.data ?? res?.court ?? res;
    return normalizeCourt(updated);
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    const query = courtId ? `?court_id=${courtId}` : '';
    const res = await apiRequest<any>(`/api/admin/blocked-dates${query}`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    const res = await apiRequest<any>('/api/admin/blocked-dates', {
      method: 'POST',
      body: JSON.stringify(blocked),
    });
    return res?.data ?? res;
  },

  async removeBlockedDate(id: string): Promise<void> {
    return apiRequest<void>(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
  },
};