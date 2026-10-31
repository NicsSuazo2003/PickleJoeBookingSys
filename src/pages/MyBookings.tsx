// src/pages/MyBookings.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  AlertCircle,
  ArrowRight,
  Wallet,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { bookingService } from '@/services/bookingService';
import { ApiError } from '@/services/api';
import { useAdminStore } from '@/stores/adminStore';
import {
  formatCurrency,
  formatDateLong,
  formatTimeRange,
} from '@/utils/format';
import type { Booking, BookingStatus } from '@/types';

const normId = (id: unknown): string =>
  id == null ? '' : String(id).trim().toLowerCase();

export function MyBookings() {
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [otherBookings, setOtherBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedRef, setSavedRef] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const courts = useAdminStore((state) => state.courts);
  const loadCourts = useAdminStore((state) => state.loadCourts);

  useEffect(() => {
    if (courts.length === 0) loadCourts();
  }, [courts.length, loadCourts]);

  useEffect(() => {
    const id = localStorage.getItem('pendingBookingId');
    const ref = localStorage.getItem('pendingBookingRef');
    const email = localStorage.getItem('pendingBookingEmail') || '';

    setSavedId(id);
    setSavedRef(ref);
    setLoadError(null);
    setBooking(null);
    setOtherBookings([]);

    if (!id && !ref) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // ✅ Prefer UUID — hits /api/bookings/{id} anonymously (works without email).
        //    Fall back to track (requires email) for legacy sessions that only saved a ref.
        const fetched = id
          ? await bookingService.getBooking(id)
          : await bookingService.trackBooking(ref!, email || undefined);

        if (cancelled) return;

        if (fetched.status === 'pending_payment') {
          setBooking(fetched);
        } else {
          // Not pending anymore (confirmed/completed/cancelled/expired) — clear local pointer
          // but still show the booking as "current" if it's one the user should see.
          if (
            fetched.status === 'confirmed' ||
            fetched.status === 'payment_submitted' ||
            fetched.status === 'completed'
          ) {
            setOtherBookings([fetched]);
          }
          localStorage.removeItem('pendingBookingRef');
          localStorage.removeItem('pendingBookingId');
          localStorage.removeItem('pendingBookingEmail');
          setSavedRef(null);
          setSavedId(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load pending booking:', err);

        const status = err instanceof ApiError ? err.status : null;

        // Only wipe the ref if the backend definitively says the booking is gone.
        if (status === 404 || status === 410) {
          localStorage.removeItem('pendingBookingRef');
          localStorage.removeItem('pendingBookingId');
          localStorage.removeItem('pendingBookingEmail');
          setSavedRef(null);
          setSavedId(null);
        } else if (status === 401) {
          // Legacy session: ref exists but no saved email → can't look up without email.
          setLoadError(
            'We need the email you used to book to load this booking. Try the tracking page, or contact us with your reference code.'
          );
        } else {
          setLoadError(
            'We could not load your booking right now. Your reference is saved — you can retry or use the tracking page.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const courtNames = useMemo(() => {
    if (!booking) return '';
    if (!booking.slots || booking.slots.length === 0) return booking.court_name || '';

    const nameById = new Map<string, string>();
    courts.forEach((c) => {
      if (c?.id) nameById.set(normId(c.id), c.name || 'Unnamed Court');
    });

    const ids = Array.from(
      new Set(booking.slots.map((s) => normId(s.court_id)).filter(Boolean))
    );
    const names = Array.from(
      new Set(ids.map((id) => nameById.get(id)).filter((n): n is string => !!n))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return names.length > 0 ? names.join(', ') : booking.court_name || 'Your court';
  }, [booking, courts]);

  const groupedSlots = useMemo(() => {
    if (!booking || !booking.slots) return [];

    const nameById = new Map<string, string>();
    courts.forEach((c) => {
      if (c?.id) nameById.set(normId(c.id), c.name || 'Unnamed Court');
    });

    const byCourt = new Map<string, { start_time: string; end_time: string }[]>();

    booking.slots.forEach((slot) => {
      const key = normId(slot.court_id) || 'unknown';
      if (!byCourt.has(key)) byCourt.set(key, []);

      const times = byCourt.get(key)!;
      const dup = times.some(
        (t) =>
          t.start_time.slice(0, 5) === slot.start_time.slice(0, 5) &&
          t.end_time.slice(0, 5) === slot.end_time.slice(0, 5)
      );
      if (!dup) times.push({ start_time: slot.start_time, end_time: slot.end_time });
    });

    return Array.from(byCourt.entries())
      .map(([courtId, times]) => ({
        courtName:
          nameById.get(courtId) ??
          (byCourt.size === 1 ? booking.court_name || 'Court' : 'Unknown Court'),
        times: [...times].sort((a, b) => a.start_time.localeCompare(b.start_time)),
      }))
      .sort((a, b) =>
        a.courtName.localeCompare(b.courtName, undefined, { numeric: true })
      );
  }, [booking, courts]);

  const retry = () => setReloadKey((k) => k + 1);

  const pendingCount = booking?.slots.length ?? 0;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-16 sm:pb-20">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
              My bookings
            </h1>
            <p className="mt-1 text-xs text-cream-muted sm:text-sm">
              Your pending and recent bookings on this device
            </p>
          </div>
          <Button size="sm" to="/" leftIcon={<CalendarDays className="h-4 w-4" />}>
            Book a court
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue-300" />
            <p className="mt-3 text-xs text-cream-muted">Loading your booking…</p>
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-300" />
            <p className="mt-4 text-sm font-semibold text-cream">
              Couldn&apos;t load your booking
            </p>
            <p className="mt-1 text-xs text-cream-muted">{loadError}</p>
            {(savedRef || savedId) && (
              <p className="mt-3 font-mono text-xs text-brand-blue-300">
                {savedRef ? `Ref: ${savedRef}` : `ID: ${savedId}`}
              </p>
            )}
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                size="md"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={retry}
              >
                Retry
              </Button>
              {savedRef && (
                <Button
                  size="md"
                  variant="secondary"
                  to={`/track?ref=${encodeURIComponent(savedRef)}`}
                >
                  Open tracking page
                </Button>
              )}
              <Button size="md" variant="secondary" to="/track">
                Track manually
              </Button>
            </div>
          </div>
        ) : booking ? (
          <div className="space-y-5">
            {/* Unpaid banner */}
            <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-amber-200">
                      You have an unpaid booking
                    </p>
                    <p className="mt-0.5 text-xs text-cream-muted sm:text-sm">
                      Upload your payment receipt to confirm {pendingCount} slot
                      {pendingCount !== 1 && 's'} ·{' '}
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>
                <Button
                  size="md"
                  onClick={() => navigate('/checkout')}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Pay now
                </Button>
              </div>
            </div>

            {/* Booking details */}
            <div className="card rounded-2xl border border-forest-700/70 bg-forest-900/80 p-5 shadow-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-cream-muted">
                    Reference
                  </p>
                  <p className="font-mono text-sm font-bold text-brand-blue-300">
                    {booking.reference_code}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Upload receipt
                  </span>
                  <span className="rounded-full border border-forest-700/80 bg-forest-950/60 px-3 py-0.5 text-[10px] font-bold text-cream-muted">
                    {pendingCount} slot{pendingCount !== 1 && 's'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-forest-700/60 pb-3">
                  <div>
                    <p className="text-sm font-bold text-cream">{courtNames}</p>
                    <p className="text-xs text-cream-muted">
                      {formatDateLong(booking.date)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-brand-blue-300">
                    {formatCurrency(booking.total_amount)}
                  </p>
                </div>

                <div className="space-y-3">
                  {groupedSlots.map((group, idx) => (
                    <div key={idx} className="space-y-1">
                      {groupedSlots.length > 1 && (
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue-300">
                          {group.courtName}
                        </p>
                      )}
                      {group.times.map((t, i) => (
                        <div
                          key={`${idx}-${i}`}
                          className="flex items-center justify-between rounded-lg bg-forest-800/70 px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-brand-blue-300" />
                            <span className="text-cream">
                              {formatTimeRange(t.start_time, t.end_time)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-cream-muted">
              Booking on a different device?{' '}
              <Link to="/track" className="font-semibold text-brand-blue-300 underline">
                Look it up with your reference code
              </Link>
              .
            </p>
          </div>
        ) : otherBookings.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-accentGreen-500/40 bg-accentGreen-500/10 p-3.5 text-xs text-accentGreen-200">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Your previous pending booking is no longer awaiting payment. Here it is.
              </span>
            </div>

            {otherBookings.map((b) => (
              <RecentBookingCard key={b.id} booking={b} courts={courts} />
            ))}

            <p className="pt-2 text-center text-xs text-cream-muted">
              Want to see all your bookings?{' '}
              <Link to="/track" className="font-semibold text-brand-blue-300 underline">
                Use the tracking page
              </Link>{' '}
              with your email.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-forest-700/60 bg-forest-900/60 p-10 text-center">
            <Wallet className="mx-auto h-10 w-10 text-cream-muted/40" />
            <p className="mt-4 text-sm font-semibold text-cream">
              No pending bookings on this device
            </p>
            <p className="mt-1 text-xs text-cream-muted">
              Start a new booking, or look up an existing one with your reference code.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button size="md" to="/">
                Book a court
              </Button>
              <Button size="md" variant="secondary" to="/track">
                Track a booking
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-component: a compact card for non-pending recent bookings
// ─────────────────────────────────────────────────────────────

function RecentBookingCard({
  booking,
  courts,
}: {
  booking: Booking;
  courts: { id: string; name: string }[];
}) {
  const courtNames = useMemo(() => {
    if (!booking.slots || booking.slots.length === 0) return booking.court_name || '';

    const nameById = new Map<string, string>();
    courts.forEach((c) => {
      if (c?.id) nameById.set(String(c.id).toLowerCase(), c.name || 'Unnamed Court');
    });

    const ids = Array.from(
      new Set(booking.slots.map((s) => String(s.court_id || '').toLowerCase()).filter(Boolean))
    );
    const names = Array.from(
      new Set(ids.map((id) => nameById.get(id)).filter((n): n is string => !!n))
    );

    return names.length > 0 ? names.join(', ') : booking.court_name || 'Your court';
  }, [booking, courts]);

  const statusLabel: Record<BookingStatus, string> = {
    pending_payment: 'Awaiting payment',
    payment_submitted: 'Payment under review',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    expired: 'Expired',
    refunded: 'Refunded',
  };

  return (
    <div className="card rounded-2xl border border-forest-700/70 bg-forest-900/80 p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold text-brand-blue-300">
            {booking.reference_code}
          </p>
          <p className="mt-0.5 text-xs text-cream-muted">
            {courtNames} · {formatDateLong(booking.date)}
          </p>
        </div>
        <StatusBadge status={booking.status} size="sm" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-forest-700/60 pt-3">
        <span className="text-xs text-cream-muted">
          {statusLabel[booking.status] ?? booking.status.replace(/_/g, ' ')}
        </span>
        <span className="text-sm font-bold text-brand-blue-300">
          {formatCurrency(booking.total_amount)}
        </span>
      </div>
    </div>
  );
}