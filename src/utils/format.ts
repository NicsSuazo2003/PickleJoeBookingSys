// src/utils/format.ts
import type { ClientSettings, BookingWindowMode } from '@/types';

export function formatTime(time?: string | null): string {
  if (!time) return '?';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '?';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start || !end) return 'Time TBD';
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDate(a: string, b: string): boolean {
  return a === b;
}

export function getMaxSelectableDate(maxAdvanceDays: number): string | null {
  if (!maxAdvanceDays || maxAdvanceDays <= 0) return null;
  return toISODate(addDays(new Date(), maxAdvanceDays));
}

export function describeAdvanceWindow(maxAdvanceDays: number): string {
  if (!maxAdvanceDays || maxAdvanceDays <= 0) return 'Any future date';
  if (maxAdvanceDays === 1) return 'Up to 1 day ahead';
  if (maxAdvanceDays < 30) return `Up to ${maxAdvanceDays} days ahead`;
  if (maxAdvanceDays < 60) return 'Up to about 1 month ahead';
  if (maxAdvanceDays < 120) return 'Up to about 3 months ahead';
  if (maxAdvanceDays < 365) return 'Up to about 6 months ahead';
  return 'Up to 1 year ahead';
}

export function generateReferenceCode(): string {
  const prefix = 'PJ';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${code}`;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getMonthMatrix(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDay);

  const weeks: Date[][] = [];
  let current = new Date(startDate);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
    if (week[6].getMonth() !== month && week[0].getMonth() !== month) break;
  }
  return weeks;
}

// ═══════════════════════════════════════════════════════════════════════
// ⭐ NEW: Fixed booking window helpers
// ═══════════════════════════════════════════════════════════════════════

type WindowSettings = Pick<
  ClientSettings,
  'booking_window_mode' | 'booking_open_date' | 'booking_close_date' | 'max_advance_booking_days'
>;

/**
 * Returns the [min, max] range (both inclusive, ISO yyyy-MM-dd) of dates a
 * customer can book, based on the client's current window mode.
 *
 *  - rolling  → [today, today + maxAdvanceBookingDays]
 *  - fixed    → [booking_open_date, booking_close_date]
 *  - closed   → null (nothing bookable)
 *
 * `maxISO` is `null` when there is no upper bound (rolling with 0 = unlimited).
 */
export function getBookableRange(settings: WindowSettings | null | undefined): {
  minISO: string;
  maxISO: string | null;
} | null {
  if (!settings) {
    return { minISO: todayISO(), maxISO: null };
  }

  const mode = settings.booking_window_mode ?? 'rolling';

  if (mode === 'closed') return null;

  if (mode === 'fixed') {
    if (!settings.booking_open_date || !settings.booking_close_date) return null;
    return {
      minISO: settings.booking_open_date,
      maxISO: settings.booking_close_date,
    };
  }

  // rolling
  const days = settings.max_advance_booking_days ?? 0;
  return {
    minISO: todayISO(),
    maxISO: days > 0 ? getMaxSelectableDate(days) : null,
  };
}

/**
 * True if the given ISO date can be booked *right now* by a customer.
 * Considers today (past check) and the configured window.
 */
export function isDateBookable(
  iso: string,
  settings: WindowSettings | null | undefined
): boolean {
  if (!iso) return false;
  const today = todayISO();
  if (iso < today) return false;

  const mode: BookingWindowMode = settings?.booking_window_mode ?? 'rolling';
  if (mode === 'closed') return false;

  if (mode === 'fixed') {
    if (!settings?.booking_open_date || !settings?.booking_close_date) return false;
    return iso >= settings.booking_open_date && iso <= settings.booking_close_date;
  }

  // rolling
  const days = settings?.max_advance_booking_days ?? 0;
  if (days > 0) {
    const max = getMaxSelectableDate(days);
    if (max && iso > max) return false;
  }
  return true;
}

/**
 * True if the window is configured but has not yet opened (today < open_date).
 */
export function isWindowNotOpenYet(settings: WindowSettings | null | undefined): boolean {
  if (!settings) return false;
  if ((settings.booking_window_mode ?? 'rolling') !== 'fixed') return false;
  if (!settings.booking_open_date) return false;
  return todayISO() < settings.booking_open_date;
}

/**
 * True if the window is fixed and has already closed (today > close_date).
 */
export function isWindowClosed(settings: WindowSettings | null | undefined): boolean {
  if (!settings) return false;
  if ((settings.booking_window_mode ?? 'rolling') !== 'fixed') return false;
  if (!settings.booking_close_date) return false;
  return todayISO() > settings.booking_close_date;
}

/**
 * Human-readable description of the current window state.
 * Used in the admin Settings page preview.
 */
export function describeBookingWindow(
  mode: BookingWindowMode,
  openDate: string | null | undefined,
  closeDate: string | null | undefined,
  maxAdvanceDays: number
): string {
  if (mode === 'closed') return 'Online bookings are closed.';
  if (mode === 'fixed') {
    if (!openDate || !closeDate) return 'Fixed window — dates not set.';
    return `Online bookings open ${openDate} through ${closeDate} (inclusive).`;
  }
  if (!maxAdvanceDays || maxAdvanceDays <= 0) return 'Unlimited advance booking.';
  return `Customers can book up to ${maxAdvanceDays} days ahead.`;
}