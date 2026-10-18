// src/pages/Track.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Upload,
  AlertCircle,
  Wallet,
  ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { bookingService } from '@/services/bookingService';
import { useClientStore } from '@/stores/clientStore';
import { useAdminStore } from '@/stores/adminStore';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
  formatDateTime,
} from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';
import { isInAppBrowser, getInAppBrowserName } from '@/utils/browser';
import type { Booking, BookingSummary } from '@/types';

export function Track() {
  const settings = useClientStore((state) => state.settings);
  const loadSettings = useClientStore((state) => state.loadSettings);
  const courts = useAdminStore((state) => state.courts);
  
  const displayNumber = settings?.gcash_number || APP_CONFIG.paymentNumber;

  const [reference, setReference] = useState(() => localStorage.getItem('pendingBookingRef') || '');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [summaries, setSummaries] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = reference.trim();
    const mail = email.trim();
    if (!ref && !mail) {
      setError('Enter a reference code or your email to search.');
      return;
    }
    setLoading(true);
    setError(null);
    setBooking(null);
    setSummaries([]);
    setUploadSuccess(false);

    try {
      if (ref) {
        const result = await bookingService.trackBooking(ref, mail || undefined);
        setBooking(result);
      } else {
        const list = await bookingService.trackBookingSummariesByEmail(mail);
        if (list.length === 0) {
          setError('No pending payments found for this email. If your booking is already confirmed, look it up with your reference code.');
        } else {
          setSummaries(list);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryClick = async (summary: BookingSummary) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await bookingService.trackBooking(summary.reference_code, email.trim());
      setBooking(detail);
      setSummaries([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open booking');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!booking || !screenshot || !paymentRef.trim()) return;
    setUploading(true);
    try {
      const updated = await bookingService.uploadPayment(booking.id, screenshot, paymentRef.trim());
      setBooking(updated);
      setUploadSuccess(true);
      setScreenshot(null);
      setPaymentRef('');
      localStorage.removeItem('pendingBookingRef');
    } catch {
      setError('Failed to upload payment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Helper to get all court names for the booking
  const courtNames = useMemo(() => {
    if (!booking || !booking.slots) return booking?.court_name || '';
    const ids = Array.from(new Set(booking.slots.map(s => s.court_id).filter(Boolean)));
    if (ids.length === 0) return booking.court_name;
    const names = ids.map(id => courts.find(c => c.id === id)?.name).filter(Boolean);
    return names.length > 0 ? names.join(', ') : booking.court_name;
  }, [booking, courts]);

  const canUploadPayment = booking && (booking.status === 'pending_payment' || booking.status === 'payment_submitted');
  const formatSlotTime = (slot: { startTime?: string; endTime?: string; start_time?: string; end_time?: string }): string => {
    const start = slot.startTime || slot.start_time || '';
    const end = slot.endTime || slot.end_time || '';
    return formatTimeRange(start, end);
  };
  const hasPaymentScreenshot = booking?.payment_screenshot_url;
  const canSearch = reference.trim().length > 0 || email.trim().length > 0;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-14 sm:pt-28 sm:pb-16">
        {isInAppBrowser() && (
          <div className="mx-auto mb-4 flex max-w-3xl items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              You're viewing this in {getInAppBrowserName() ?? 'an in-app'} browser. If uploading a screenshot doesn't work, tap <strong>⋯</strong> and choose <strong>"Open in Browser."</strong>
            </span>
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl lg:text-4xl">
              Track Your Booking
            </h1>
            <p className="mt-1.5 text-xs text-cream-muted sm:mt-2 sm:text-sm">
              Search by reference code for one booking, or by email to see bookings pending payment.
            </p>
          </div>

          <form onSubmit={handleSearch} className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
              <Input
                label="Reference Code"
                placeholder="e.g. PJAB12CD"
                leftIcon={<Search className="h-4 w-4 text-cream-muted" />}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                hint="Optional if you provide email"
              />
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                leftIcon={<Mail className="h-4 w-4 text-cream-muted" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="Shows only bookings that need payment action"
              />
            </div>
            <Button type="submit" size="lg" fullWidth className="mt-4 sm:w-auto" isLoading={loading} disabled={!canSearch} leftIcon={<Search className="h-5 w-5" />}>
              Search Booking
            </Button>
            {!canSearch && (
              <p className="mt-2 text-[11px] text-cream-muted">Enter a reference code or email to enable search.</p>
            )}
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs text-error font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && <LoadingSpinner className="py-12" />}

          {!loading && summaries.length > 0 && (
            <div className="mt-6 space-y-3 sm:mt-8">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-cream sm:text-base">Bookings Needing Payment Action ({summaries.length})</h2>
                  <p className="text-[11px] text-cream-muted">Confirmed or completed bookings won't appear here. Use your reference code to see them.</p>
                </div>
                <button onClick={() => { setSummaries([]); setEmail(''); }} className="shrink-0 text-[11px] text-cream-muted underline hover:text-error">
                  Clear
                </button>
              </div>

              {summaries.map((s) => (
                <motion.button key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={() => handleSummaryClick(s)} className="w-full cursor-pointer rounded-2xl border border-forest-700/80 bg-forest-900/80 p-4 text-left shadow-xl backdrop-blur-sm transition hover:border-brand-blue-400/60">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-extrabold tracking-wider text-brand-blue-300">
                        {s.reference_code}
                      </p>
                      <p className="mt-0.5 text-xs text-cream-muted">
                        {s.court_name} · {formatDateLong(s.date)}
                        {s.start_time && s.end_time && (<> · {formatTimeRange(s.start_time, s.end_time)}</>)}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-2 text-[11px] text-cream-muted">Booked {formatDateTime(s.created_at)} · {formatCurrency(s.total_amount)}</p>
                </motion.button>
              ))}
            </div>
          )}

          <AnimatePresence>
            {booking && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
                <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col gap-3 border-b border-forest-700/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">Reference Code</p>
                      <p className="font-mono text-xl font-extrabold tracking-wider text-brand-blue-300 sm:text-2xl">{booking.reference_code}</p>
                    </div>
                    <StatusBadge status={booking.status} size="md" />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest-700 bg-forest-950/70 text-brand-blue-300">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">Court</p>
                        <p className="text-sm font-bold text-cream sm:text-base">{courtNames}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest-700 bg-forest-950/70 text-brand-blue-300">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">Date</p>
                        <p className="text-sm font-bold text-cream sm:text-base">{formatDateLong(booking.date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-blue-300">Time Slots</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {booking.slots.map((slot) => (
                        <div key={slot.slot_id || slot.id} className="flex items-center justify-between rounded-xl border border-forest-700/60 bg-forest-800/80 p-2.5 sm:p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-brand-blue-300" />
                            <span className="text-xs font-medium text-cream sm:text-sm">{formatSlotTime(slot)}</span>
                          </div>
                          <span className="text-xs font-bold text-brand-blue-300 sm:text-sm">{formatCurrency(slot.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-forest-700/80 pt-4">
                    <span className="text-xs text-cream-muted sm:text-sm">Total Amount</span>
                    <span className="font-display text-2xl font-extrabold text-brand-blue-300">{formatCurrency(booking.total_amount)}</span>
                  </div>
                </div>

                {/* Customer, Upload, etc. (unchanged from previous) */}
                <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                  <h3 className="mb-3.5 font-display text-base font-bold text-cream">Customer Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <User className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Name:</span>
                      <span className="truncate font-medium text-cream">{booking.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Email:</span>
                      <span className="truncate font-medium text-cream">{booking.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Phone:</span>
                      <span className="font-medium text-cream">{booking.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="h-4 w-4 shrink-0 text-brand-blue-300" />
                      <span className="text-cream-muted">Booked:</span>
                      <span className="font-medium text-cream">{formatDateTime(booking.created_at)}</span>
                    </div>
                  </div>
                  {booking.customer.notes && (
                    <div className="mt-3 rounded-xl border border-forest-700/60 bg-forest-950/60 p-3 text-xs text-cream-muted leading-relaxed">
                      <span className="font-semibold text-cream">Notes: </span>
                      {booking.customer.notes}
                    </div>
                  )}
                </div>

                {/* ... rest of the file (payment upload logic, status callouts) stays the same ... */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}