import type { Court, TimeSlot, BlockedDate } from '@/types';
import { apiRequest } from './api';

export const courtService = {
  async getCourts(): Promise<Court[]> {
    return apiRequest<Court[]>('/api/courts');
  },

  async getCourt(id: string): Promise<Court> {
    return apiRequest<Court>(`/api/courts/${id}`);
  },

  async getAvailability(courtId: string, date: string): Promise<TimeSlot[]> {
    return apiRequest<TimeSlot[]>(`/api/courts/${courtId}/availability?date=${date}`);
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    const query = courtId ? `?court_id=${courtId}` : '';
    return apiRequest<BlockedDate[]>(`/api/courts/blocked-dates${query}`);
  },

  async updateCourt(court: Court): Promise<Court> {
    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(court),
    });
  },
};