import type { ClientSettings, AmenityItem } from '@/types';
import { apiRequest } from './api';

function normalizeAmenity(raw: any): AmenityItem {
  if (typeof raw === 'string') {
    return { name: raw, icon: 'Sparkles', description: '' };
  }
  return {
    name: raw?.name ?? '',
    icon: raw?.icon ?? 'Sparkles',
    description: raw?.description ?? '',
  };
}

function normalizeClientSettings(raw: any): ClientSettings {
  const data = raw?.data ?? raw;

  // 🔒 Map camelCase from backend to snake_case for the UI
  const paymentMethods = (data.paymentMethods ?? data.payment_methods ?? []).map((pm: any) => {
    const c = pm?.config ?? pm?.Config ?? {};
    return {
      id: pm.id ?? pm.Id ?? '',
      name: pm.name ?? pm.Name ?? '',
      icon: pm.icon ?? pm.Icon ?? 'Smartphone',
      enabled: pm.enabled ?? pm.Enabled ?? true,
      config: {
        account_name: c.accountName ?? c.account_name ?? c.AccountName ?? '',
        account_number: c.accountNumber ?? c.account_number ?? c.AccountNumber ?? '',
        qr_image_url: c.qrImageUrl ?? c.qr_image_url ?? c.QrImageUrl ?? '',
        instructions: c.instructions ?? c.Instructions ?? '',
      },
    };
  });

  return {
    id: data.id || '',
    name: data.name || '',
    subdomain: data.subdomain || '',
    logo_url: data.logoUrl ?? data.logo_url ?? null,
    primary_color: data.primaryColor ?? data.primary_color ?? '#1A2E1A',
    accent_color: data.accentColor ?? data.accent_color ?? '#C9A94E',
    gcash_number: data.gcashNumber ?? data.gcash_number ?? null,
    gcash_account_name: data.gcashAccountName ?? data.gcash_account_name ?? null,
    payment_methods: paymentMethods,
    available_amenities: (data.availableAmenities ?? data.available_amenities ?? [])
      .map(normalizeAmenity),
    max_advance_booking_days: Number(
      data.maxAdvanceBookingDays ?? data.max_advance_booking_days ?? 90
    ),
    bookings_enabled: (() => {
      const v = data.bookingsEnabled ?? data.bookings_enabled;
      return v === undefined || v === null ? true : Boolean(v);
    })(),
    // ── NEW: booking window ──
    booking_window_mode: (() => {
      const v = String(data.bookingWindowMode ?? data.booking_window_mode ?? 'rolling').toLowerCase();
      return v === 'fixed' || v === 'closed' || v === 'rolling' ? v : 'rolling';
    })(),
    booking_open_date: (() => {
      const v = data.bookingOpenDate ?? data.booking_open_date ?? null;
      return v ? String(v).slice(0, 10) : null;
    })(),
    booking_close_date: (() => {
      const v = data.bookingCloseDate ?? data.booking_close_date ?? null;
      return v ? String(v).slice(0, 10) : null;
    })(),
  } as ClientSettings;
}

export const clientService = {
  async getPublicSettings(): Promise<ClientSettings> {
    const res = await apiRequest<any>('/api/clients/public');
    return normalizeClientSettings(res?.data ?? res);
  },
};