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
    const data = await apiRequest<any[]>('/api/admin/courts');
    return data.map((court) => ({
      id: court.id,
      name: court.name,
      description: court.description || '',
      image: court.imageUrl || court.image || '',
      image_url: court.imageUrl || court.image || '',
      price_per_hour: court.pricePerHour || court.price_per_hour || 0,
      peak_price_per_hour: court.peakPricePerHour ?? court.peak_price_per_hour ?? 0,
      open_time: court.openTime || court.open_time || '08:00',
      close_time: court.closeTime || court.close_time || '22:00',
      amenities: court.amenities || [],
      surface: court.surface || '',
      dimensions: court.dimensions || '',
      images: court.images || [],
      is_indoor: court.indoor || court.is_indoor || false,
      is_active: court.status === 'active' || court.is_active || false,
    }));
  },

  async updateCourt(court: Court): Promise<Court> {
    const payload: any = {
      name: court.name,
      type: court.type || 'indoor',
      indoor: court.is_indoor !== undefined ? court.is_indoor : court.type === 'indoor',
      pricePerHour: court.price_per_hour,
      peakPricePerHour: court.peak_price_per_hour,  // ✅ ADDED
      amenities: court.amenities || [],
      openTime: court.open_time,
      closeTime: court.close_time,
      status: court.is_active ? 'active' : 'inactive',
      imageUrl: court.image || court.image_url || '',
      dimensions: court.dimensions || '',
      surface: court.surface || '',
    };

    if (court.images && court.images.length > 0) {
      payload.images = court.images;
    }

    if (court.rating !== undefined) {
      payload.rating = court.rating;
    }

    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
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