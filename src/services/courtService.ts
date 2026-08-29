import type { Court, TimeSlot, BlockedDate } from '@/types';
import { apiRequest } from './api';

export const courtService = {
  async getCourts(): Promise<Court[]> {
    const res = await apiRequest<Court[] | { data: Court[] } | { courts: Court[] }>('/api/courts');
    if (Array.isArray(res)) return res;
    if (Array.isArray((res as { data?: Court[] })?.data)) return (res as { data: Court[] }).data;
    if (Array.isArray((res as { courts?: Court[] })?.courts)) return (res as { courts: Court[] }).courts;
    return [];
  },

  async getCourt(id: string): Promise<Court> {
    const res = await apiRequest<Court | { data: Court }>(`/api/courts/${id}`);
    return (res as { data?: Court }).data ?? (res as Court);
  },

  async getAvailability(courtId: string, date: string): Promise<TimeSlot[]> {
    const res = await apiRequest<TimeSlot[] | { data: TimeSlot[] } | { slots: TimeSlot[] }>(
      `/api/courts/${courtId}/availability?date=${date}`
    );
    if (Array.isArray(res)) return res;
    if (Array.isArray((res as { data?: TimeSlot[] })?.data)) return (res as { data: TimeSlot[] }).data;
    if (Array.isArray((res as { slots?: TimeSlot[] })?.slots)) return (res as { slots: TimeSlot[] }).slots;
    return [];
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    const query = courtId ? `?court_id=${courtId}` : '';
    const res = await apiRequest<BlockedDate[] | { data: BlockedDate[] }>(`/api/courts/blocked-dates${query}`);
    if (Array.isArray(res)) return res;
    if (Array.isArray((res as { data?: BlockedDate[] })?.data)) return (res as { data: BlockedDate[] }).data;
    return [];
  },

  async updateCourt(court: Court): Promise<Court> {
    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(court),
    });
  },
};