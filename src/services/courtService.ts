import type { Court, TimeSlot, BlockedDate } from '@/types';
import { APP_CONFIG } from '@/utils/constants';
import { apiRequest, delay } from './api';
import { mockCourts, generateMockSlots, mockBlockedDates } from './mockData';

export const courtService = {
  async getCourts(): Promise<Court[]> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      return [...mockCourts];
    }
    return apiRequest<Court[]>('/api/courts');
  },

  async getCourt(id: string): Promise<Court> {
    if (APP_CONFIG.demoMode) {
      await delay(200);
      const court = mockCourts.find((c) => c.id === id);
      if (!court) throw new Error('Court not found');
      return court;
    }
    return apiRequest<Court>(`/api/courts/${id}`);
  },

  async getAvailability(courtId: string, date: string): Promise<TimeSlot[]> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      // Check blocked dates
      const blocked = mockBlockedDates.find((b) => b.court_id === courtId && b.date === date);
      if (blocked) return [];
      return generateMockSlots(courtId, date);
    }
    return apiRequest<TimeSlot[]>(`/api/courts/${courtId}/availability?date=${date}`);
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    if (APP_CONFIG.demoMode) {
      await delay(200);
      return courtId
        ? mockBlockedDates.filter((b) => b.court_id === courtId)
        : [...mockBlockedDates];
    }
    const query = courtId ? `?court_id=${courtId}` : '';
    return apiRequest<BlockedDate[]>(`/api/courts/blocked-dates${query}`);
  },

  async updateCourt(court: Court): Promise<Court> {
    if (APP_CONFIG.demoMode) {
      await delay(300);
      return court;
    }
    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(court),
    });
  },
};
