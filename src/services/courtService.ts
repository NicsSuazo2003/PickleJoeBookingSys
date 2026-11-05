// src/services/courtService.ts
import type { Court, TimeSlot, BlockedDate, SlotType } from '@/types';
import { apiRequest } from './api';
import { mockCourts, generateMockSlots, mockBlockedDates } from './mockData';
import { MOCK_COURT_GUIDS } from './bookingService';

// Check if we should use mock data
const USE_MOCK_DATA = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true';

const BACKEND_BASE_URL = 'https://pickleballcourbookingv2-e064.onrender.com';

const DEFAULT_COURT_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
];

export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function normalizeCourt(raw: any, index: number = 0): Court {
  const rawImg = raw.imageUrl || raw.image_url || raw.image || raw.images?.[0] || '';
  const resolvedImg = resolveImageUrl(rawImg);
  const fallback = DEFAULT_COURT_IMAGES[index % DEFAULT_COURT_IMAGES.length];

  // If ID is not a valid GUID, generate one for frontend use
  let id = raw.id;
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!isGuid && USE_MOCK_DATA) {
    // In mock mode, map to our mock GUIDs
    if (id === 'court-1') id = MOCK_COURT_GUIDS['court-1'];
    else if (id === 'court-2') id = MOCK_COURT_GUIDS['court-2'];
    else if (id === 'court-3') id = MOCK_COURT_GUIDS['court-3'];
  }

  return {
    id: id || `court-${index}`,
    name: raw.name || 'Court',
    description: raw.description || '',
    image: resolvedImg || fallback,
    image_url: resolvedImg || '',
    price_per_hour: Number(raw.pricePerHour ?? raw.price_per_hour ?? 0),
    peak_price_per_hour: Number(raw.peakPricePerHour ?? raw.peak_price_per_hour ?? 0),
    open_time: raw.openTime ?? raw.open_time ?? '08:00',
    close_time: raw.closeTime ?? raw.close_time ?? '22:00',
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    surface: raw.surface || 'Standard',
    dimensions: raw.dimensions || '44ft x 20ft',
    images: Array.isArray(raw.images) ? raw.images.map(resolveImageUrl) : [],
    rating: Number(raw.rating ?? 4.8),
    type: raw.type || 'indoor',
    is_indoor: raw.indoor ?? raw.is_indoor ?? true,
    is_active: raw.status ? raw.status === 'active' : (raw.is_active ?? true),
    status: raw.status || 'active',
  };
}

export function buildCourtPayload(court: Court): Record<string, any> {
  const img = court.image_url || court.image || '';
  return {
    id: court.id,
    name: court.name,
    type: court.type || 'indoor',
    indoor: court.is_indoor !== undefined ? court.is_indoor : true,
    pricePerHour: Number(court.price_per_hour),
    peakPricePerHour: Number(court.peak_price_per_hour),
    description: court.description || '',
    amenities: court.amenities || [],
    openTime: court.open_time,
    closeTime: court.close_time,
    status: court.is_active ? 'active' : 'inactive',
    imageUrl: img,
    image: img,
    image_url: img,
    dimensions: court.dimensions || '44ft x 20ft',
    surface: court.surface || 'Standard',
    images: court.images && court.images.length > 0 ? court.images : img ? [img] : [],
    rating: court.rating ?? 4.8,
  };
}

export function normalizeSlot(raw: any, fallbackDate: string): TimeSlot {
  const startTime = raw.startTime ?? raw.start_time ?? '';
  const endTime = raw.endTime ?? raw.end_time ?? '';

  let slotType: SlotType = raw.type;
  if (!slotType) {
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);
    const duration = !isNaN(startHour) && !isNaN(endHour) ? endHour - startHour : 1;
    slotType = duration === 2 ? 'fixed_2hr' : 'standard';
  }

  return {
    id: raw.id || '',
    court_id: raw.courtId ?? raw.court_id ?? '',
    date: raw.date ?? fallbackDate,
    start_time: startTime,
    end_time: endTime,
    type: slotType,
    price: Number(raw.price ?? raw.Price ?? 0),
    is_available: raw.isAvailable ?? raw.is_available ?? true,
    is_peak: raw.isPeak ?? raw.is_peak ?? false,
    status: raw.status ?? raw.Status ?? undefined,
    pending_expires_at: raw.pendingExpiresAt ?? raw.pending_expires_at ?? null,
  };
}

export const courtService = {
  async getCourts(): Promise<Court[]> {
    // If mock mode is enabled, return mock data
    if (USE_MOCK_DATA) {
      return mockCourts;
    }

    try {
      const res = await apiRequest<any>('/api/courts');

      let rawList = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res?.data && Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res?.courts && Array.isArray(res.courts)) {
        rawList = res.courts;
      } else {
        return [];
      }

      if (rawList.length === 0) {
        // In development, fallback to mock data
        if (import.meta.env.DEV) {
          return mockCourts;
        }
        return [];
      }

      return rawList.map((item: any, idx: number) => normalizeCourt(item, idx));
    } catch (error) {
      // In development, fallback to mock data
      if (import.meta.env.DEV) {
        return mockCourts;
      }
      throw error;
    }
  },

  async getCourt(id: string): Promise<Court> {
    // If mock mode is enabled, return mock data
    if (USE_MOCK_DATA) {
      const court = mockCourts.find((c) => c.id === id);
      if (court) return court;
    }

    try {
      const res = await apiRequest<any>(`/api/courts/${id}`);
      const data = res?.data ?? res?.court ?? res;
      return normalizeCourt(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        const court = mockCourts.find((c) => c.id === id);
        if (court) return court;
      }
      throw error;
    }
  },

  // ✅ UPDATED — accepts an optional excludeBookingId so the reschedule
  //    modal can see the booking's own current slots as selectable.
  async getAvailability(
    courtId: string,
    date: string,
    excludeBookingId?: string
  ): Promise<TimeSlot[]> {
    if (USE_MOCK_DATA) {
      return generateMockSlots(courtId, date);
    }

    try {
      const params = new URLSearchParams({ date });
      if (excludeBookingId) params.set('excludeBookingId', excludeBookingId);

      const res = await apiRequest<any>(
        `/api/courts/${courtId}/availability?${params.toString()}`
      );

      const rawList = Array.isArray(res) ? res : res?.data || res?.slots || [];

      if (rawList.length === 0) {
        if (import.meta.env.DEV) {
          return generateMockSlots(courtId, date);
        }
        return [];
      }

      return rawList.map((item: any) => {
        const normalized = normalizeSlot(item, date);
        return {
          ...normalized,
          court_id: courtId,
        };
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        return generateMockSlots(courtId, date);
      }
      throw error;
    }
  },

  async getBlockedDates(courtId?: string): Promise<BlockedDate[]> {
    if (USE_MOCK_DATA) {
      return mockBlockedDates;
    }

    try {
      const query = courtId ? `?court_id=${courtId}` : '';
      const res = await apiRequest<any>(`/api/courts/blocked-dates${query}`);
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        return mockBlockedDates;
      }
      return [];
    }
  },

  async updateCourt(court: Court): Promise<Court> {
    if (USE_MOCK_DATA) {
      return court;
    }

    const payload = buildCourtPayload(court);
    const res = await apiRequest<any>(`/api/admin/courts/${court.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const updated = res?.data ?? res?.court ?? res;
    return normalizeCourt(updated);
  },
};