import type { Analytics, Booking, BookingStatus, Court, BlockedDate, ClientSettings } from '@/types';
import { apiRequest } from './api';
import { normalizeCourt, buildCourtPayload } from './courtService';

function normalizeClientSettings(raw: any): ClientSettings {
  const data = raw?.data ?? raw;
  return {
    id: data.id || '',
    name: data.name || '',
    subdomain: data.subdomain || '',
    logo_url: data.logoUrl ?? data.logo_url ?? null,
    primary_color: data.primaryColor ?? data.primary_color ?? '#1A2E1A',
    accent_color: data.accentColor ?? data.accent_color ?? '#C9A94E',
    gcash_number: data.gcashNumber ?? data.gcash_number ?? null,
    gcash_account_name: data.gcashAccountName ?? data.gcash_account_name ?? null,
  };
}

function normalizeAnalytics(raw: any): Analytics {
  const data = raw?.data ?? raw;
  
  // Get revenue by day
  const revenueByDay = (data.revenueByDay ?? []).map((d: any) => ({
    date: d.date || '',
    revenue: Number(d.revenue ?? 0),
    bookings: 0,
  }));

  // Merge bookingsByDay into revenueByDay
  const bookingsByDay = data.bookingsByDay ?? [];
  bookingsByDay.forEach((bd: any) => {
    const existing = revenueByDay.find((r: any) => r.date === bd.date);
    if (existing) {
      existing.bookings = Number(bd.bookings ?? 0);
    } else {
      revenueByDay.push({
        date: bd.date || '',
        revenue: 0,
        bookings: Number(bd.bookings ?? 0),
      });
    }
  });

  // Sort by date
  revenueByDay.sort((a: any, b: any) => a.date.localeCompare(b.date));

  return {
    total_bookings: Number(data.totalBookings ?? 0),
    total_revenue: Number(data.totalRevenue ?? 0),
    pending_payments: Number(data.pendingPayments ?? 0),
    confirmed_bookings: Number(data.confirmedBookings ?? 0),
    completed_bookings: Number(data.completedBookings ?? 0),
    cancelled_bookings: Number(data.cancelledBookings ?? 0),
    status_breakdown: data.statusBreakdown ?? {},
    revenue_by_day: revenueByDay,
    court_breakdown: data.courtBreakdown ?? data.court_breakdown ?? [],
  };
}

function normalizeBooking(raw: any): Booking {
  const data = raw?.data ?? raw;
  return {
    id: data.id || '',
    reference_code: data.referenceCode ?? data.reference_code ?? '',
    court_id: data.courtId ?? data.court_id ?? '',
    court_name: data.courtName ?? data.court_name ?? 'Unknown Court',
    date: data.date || '',
    slots: (data.slots ?? []).map((s: any) => ({
      id: s.id || '',
      slot_id: s.slotId ?? s.slot_id ?? s.id ?? '',
      start_time: s.startTime ?? s.start_time ?? '',
      end_time: s.endTime ?? s.end_time ?? '',
      date: s.date ?? data.date ?? '',
      type: s.type ?? 'standard',
      price: Number(s.price ?? s.amount ?? s.total ?? s.Price ?? 0),
      is_peak: s.isPeak ?? s.is_peak ?? false,
    })),
    customer: {
      name: data.customerName ?? data.customer?.name ?? 'Unknown',
      email: data.customerEmail ?? data.customer?.email ?? '',
      phone: data.customerPhone ?? data.customer?.phone ?? '',
      notes: data.notes ?? data.customer?.notes ?? '',
    },
    total_amount: Number(data.totalAmount ?? data.total_amount ?? 0),
    status: data.status || 'pending_payment',
    payment_screenshot_url: data.paymentScreenshot ?? data.payment_screenshot_url ?? null,
    payment_reference: data.paymentReference ?? data.payment_reference ?? '',
    gcash_number: data.gcashNumber ?? data.gcash_number ?? '',
    created_at: data.createdAt ?? data.created_at ?? new Date().toISOString(),
    updated_at: data.updatedAt ?? data.updated_at ?? data.createdAt ?? data.created_at ?? new Date().toISOString(),
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