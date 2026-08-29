import type { Court, TimeSlot, BlockedDate, SlotType } from '@/types';
import { apiRequest } from './api';

const DEFAULT_COURT_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
];

function normalizeCourt(raw: any, index: number = 0): Court {
  const img = raw.imageUrl || raw.image_url || raw.image || raw.images?.[0];
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    image: img && img.trim() !== '' ? img : DEFAULT_COURT_IMAGES[index % DEFAULT_COURT_IMAGES.length],
    image_url: img || '',
    price_per_hour: Number(raw.pricePerHour ?? raw.price_per_hour ?? 0),
    peak_price_per_hour: Number(raw.peakPricePerHour ?? raw.peak_price_per_hour ?? 0),
    open_time: raw.openTime ?? raw.open_time ?? '08:00',
    close_time: raw.closeTime ?? raw.close_time ?? '22:00',
    amenities: raw.amenities || [],
    surface: raw.surface || 'Standard',
    dimensions: raw.dimensions || '44ft x 20ft',
    images: raw.images || [],
    rating: raw.rating || 4.8,
    type: raw.type || 'indoor',
    is_indoor: raw.indoor ?? raw.is_indoor ?? true,
    is_active: raw.status ? raw.status === 'active' : (raw.is_active ?? true),
    status: raw.status || 'active',
  };
}

function normalizeSlot(raw: any, fallbackDate: string): TimeSlot {
  const startTime = raw.startTime ?? raw.start_time ?? '';
  const endTime = raw.endTime ?? raw.end_time ?? '';
  
  // Detect if 2-hour fixed slot or standard 1-hour slot
  let slotType: SlotType = raw.type;
  if (!slotType) {
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);
    const duration = !isNaN(startHour) && !isNaN(endHour) ? endHour - startHour : 1;
    slotType = duration === 2 ? 'fixed_2hr' : 'standard';
  }

  return {
    id: raw.id,
    court_id: raw.courtId ?? raw.court_id ?? '',
    date: raw.date ?? fallbackDate,
    start_time: startTime,
    end_time: endTime,
    type: slotType,
    price: Number(raw.price ?? 0),
    is_available: raw.isAvailable ?? raw.is_available ?? true,
    is_peak: raw.isPeak ?? raw.is_peak ?? false,
  };
}

export const courtService = {
  async getCourts(): Promise<Court[]> {
    const res = await apiRequest<any>('/api/courts');
    const rawList = Array.isArray(res) ? res : res?.data || res?.courts || [];
    return rawList.map((item: any, idx: number) => normalizeCourt(item, idx));
  },

  async getCourt(id: string): Promise<Court> {
    const res = await apiRequest<any>(`/api/courts/${id}`);
    const data = res?.data ?? res?.court ?? res;
    return normalizeCourt(data);
  },

  async getAvailability(courtId: string, date: string): Promise<TimeSlot[]> {
    const res = await apiRequest<any>(`/api/courts/${courtId}/availability?date=${date}`);
    const rawList = Array.isArray(res) ? res : res?.data || res?.slots || [];
    return rawList.map((item: any) => normalizeSlot(item, date));
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    const query = courtId ? `?court_id=${courtId}` : '';
    const res = await apiRequest<any>(`/api/courts/blocked-dates${query}`);
    return Array.isArray(res) ? res : res?.data || [];
  },

  async updateCourt(court: Court): Promise<Court> {
    return apiRequest<Court>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(court),
    });
  },
};