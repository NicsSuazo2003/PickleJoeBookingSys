import type { Analytics, Booking, BookingStatus, Court, BlockedDate, ClientSettings  } from '@/types';
import { apiRequest } from './api';
import { normalizeCourt, buildCourtPayload } from './courtService';

function normalizeClientSettings(raw: any): ClientSettings {
  return {
    id: raw.id,
    name: raw.name,
    subdomain: raw.subdomain,
    logo_url: raw.logoUrl ?? raw.logo_url ?? null,
    primary_color: raw.primaryColor ?? raw.primary_color,
    accent_color: raw.accentColor ?? raw.accent_color,
    gcash_number: raw.gcashNumber ?? raw.gcash_number ?? null,
    gcash_account_name: raw.gcashAccountName ?? raw.gcash_account_name ?? null,
  };
}

function normalizeAnalytics(raw: any): Analytics {
  return {
    total_bookings: raw.totalBookings ?? 0,
    total_revenue: raw.totalRevenue ?? 0,
    pending_payments: raw.pendingPayments ?? 0,
    confirmed_bookings: raw.confirmedBookings ?? 0,
    completed_bookings: raw.completedBookings ?? 0,
    cancelled_bookings: raw.cancelledBookings ?? 0,
    status_breakdown: raw.statusBreakdown ?? {},
    revenue_by_day: (raw.revenueByDay ?? []).map((d: any) => ({
      date: d.date,
      revenue: d.revenue ?? 0,
      bookings: 0, // backend's revenueByDay doesn't include a per-day booking count; bookingsByDay is separate
    })),
    court_breakdown: [], // requires a separate call to /api/admin/analytics/courts — not wired up yet
  };
}
function normalizeBooking(raw: any): Booking {
  return {
    id: raw.id,
    reference_code: raw.referenceCode ?? raw.reference_code,
    court_id: raw.courtId ?? raw.court_id,
    court_name: raw.courtName ?? raw.court_name,
    date: raw.date,
    slots: (raw.slots ?? []).map((s: any) => ({
      id: s.id,
      slot_id: s.slotId ?? s.slot_id ?? s.id,
      start_time: s.startTime ?? s.start_time,
      end_time: s.endTime ?? s.end_time,
      date: s.date ?? raw.date,
      type: s.type ?? 'standard',
      price: s.price ?? 0,
      is_peak: s.isPeak ?? s.is_peak ?? false,
    })),
    customer: {
      name: raw.customerName ?? raw.customer?.name,
      email: raw.customerEmail ?? raw.customer?.email,
      phone: raw.customerPhone ?? raw.customer?.phone,
      notes: raw.notes ?? raw.customer?.notes,
    },
    total_amount: raw.totalAmount ?? raw.total_amount,
    status: raw.status,
    payment_screenshot_url: raw.paymentScreenshot ?? raw.payment_screenshot_url ?? null,
    payment_reference: raw.paymentReference ?? raw.payment_reference,
    gcash_number: raw.gcashNumber ?? raw.gcash_number ?? '',
    created_at: raw.createdAt ?? raw.created_at,
    updated_at: raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at,
  };
}
export const adminService = {
  async getAnalytics(): Promise<Analytics> {
  const res = await apiRequest<any>('/api/admin/analytics');
  return normalizeAnalytics(res?.data ?? res);
},
async getSettings(): Promise<ClientSettings> {
  const res = await apiRequest<any>('/api/admin/settings');
  return normalizeClientSettings(res?.data ?? res);
},

async updateSettings(payload: {
  name?: string;
  gcash_number?: string;
  gcash_account_name?: string;
}): Promise<ClientSettings> {
  const res = await apiRequest<any>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({
      name: payload.name,
      gcashNumber: payload.gcash_number,
      gcashAccountName: payload.gcash_account_name,
    }),
  });
  return normalizeClientSettings(res?.data ?? res);
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
    const rawList = Array.isArray(res) ? res : res?.data || [];
    return rawList.map((item: any) => normalizeBooking(item));
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const res = await apiRequest<any>(`/api/admin/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return normalizeBooking(res?.data ?? res);
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
    const rawList = Array.isArray(res) ? res : res?.data || [];
    // Assuming BlockedDate has id, court_id, date, reason
    return rawList.map((item: any) => ({
      id: item.id || '',
      court_id: item.courtId ?? item.court_id ?? '',
      date: item.date || '',
      reason: item.reason || 'No reason provided',
    }));
  },

  async addBlockedDate(blocked: Omit<BlockedDate, 'id'>): Promise<BlockedDate> {
    const res = await apiRequest<any>('/api/admin/blocked-dates', {
      method: 'POST',
      body: JSON.stringify(blocked),
    });
    const created = res?.data ?? res;
    return {
      id: created.id || '',
      court_id: created.courtId ?? created.court_id ?? '',
      date: created.date || '',
      reason: created.reason || '',
    };
  },

  async removeBlockedDate(id: string): Promise<void> {
    return apiRequest<void>(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
  },
};