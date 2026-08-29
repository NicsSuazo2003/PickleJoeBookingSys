import { useState } from 'react';
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
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { bookingService } from '@/services/bookingService';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
  formatDateTime,
} from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';
import type { Booking } from '@/types';

export function Track() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError(null);
    setBooking(null);
    setUploadSuccess(false);
    try {
      const result = await bookingService.trackBooking(
        reference.trim(),
        email.trim() || undefined
      );
      setBooking(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking not found');
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
      const updated = await bookingService.uploadPayment(
        booking.id,
        screenshot,
        paymentRef.trim()
      );
      setBooking(updated);
      setUploadSuccess(true);
      setScreenshot(null);
      setPaymentRef('');
    } catch {
      setError('Failed to upload payment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canUploadPayment =
    booking &&
    (booking.status === 'pending_payment' || booking.status === 'payment_submitted');

  // ✅ Helper to format slot time range
  const formatSlotTime = (slot: { startTime?: string; endTime?: string; start_time?: string; end_time?: string }): string => {
    const start = slot.startTime || slot.start_time || '';
    const end = slot.endTime || slot.end_time || '';
    return formatTimeRange(start, end);
  };

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-24 pb-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="section-title">Track Your Booking</h1>
            <p className="mt-2 text-cream-muted">
              Enter your reference code to check your booking status.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Reference Code"
                placeholder="e.g. PJAB12CD"
                required
                leftIcon={<Search className="h-4 w-4" />}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="your@email.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="Adds extra security to your search"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-4"
              isLoading={loading}
              leftIcon={<Search className="h-5 w-5" />}
            >
              Search Booking
            </Button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-error/10 p-4 text-sm text-error">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading && <LoadingSpinner size="lg" className="py-12" />}

          <AnimatePresence>
            {booking && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 space-y-6"
              >
                {/* Booking Card */}
                <div className="card p-6">
                  <div className="flex flex-col gap-4 border-b border-forest-500 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-cream-muted">Reference Code</p>
                      <p className="font-display text-2xl font-bold tracking-wider text-gold-400">
                        {booking.reference_code}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} size="md" />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gold-400" />
                      <div>
                        <p className="text-xs text-cream-muted">Court</p>
                        <p className="font-medium text-cream">{booking.court_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gold-400" />
                      <div>
                        <p className="text-xs text-cream-muted">Date</p>
                        <p className="font-medium text-cream">{formatDateLong(booking.date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-cream">Time Slots</p>
                    <div className="space-y-2">
                      {booking.slots.map((slot) => (
                        <div
                          key={slot.slot_id || slot.id}
                          className="flex items-center justify-between rounded-lg bg-forest-800 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gold-400" />
                            <span className="text-sm text-cream">
                              {formatSlotTime(slot)}
                            </span>
                          </div>
                          <span className="text-xs text-gold-400">
                            ₱{slot.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-forest-500 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cream-muted">Total Amount</span>
                      <span className="font-display text-xl font-bold text-gold-400">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="card p-6">
                  <h3 className="mb-4 font-display text-lg font-bold text-cream">
                    Customer Details
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gold-400" />
                      <span className="text-cream-muted">Name:</span>
                      <span className="text-cream">{booking.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gold-400" />
                      <span className="text-cream-muted">Email:</span>
                      <span className="text-cream">{booking.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gold-400" />
                      <span className="text-cream-muted">Phone:</span>
                      <span className="text-cream">{booking.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gold-400" />
                      <span className="text-cream-muted">Booked:</span>
                      <span className="text-cream">{formatDateTime(booking.created_at)}</span>
                    </div>
                  </div>
                  {booking.customer.notes && (
                    <div className="mt-3 rounded-lg bg-forest-800 p-3 text-sm text-cream-muted">
                      <span className="font-medium text-cream">Notes: </span>
                      {booking.customer.notes}
                    </div>
                  )}
                </div>

                {/* Payment Upload (if pending) */}
                {canUploadPayment && (
                  <div className="card p-6">
                    <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-cream">
                      <Wallet className="h-5 w-5 text-gold-400" />
                      Payment
                    </h3>
                    <p className="mb-4 text-sm text-cream-muted">
                      Send {formatCurrency(booking.total_amount)} to GCash{' '}
                      <span className="font-semibold text-gold-300">{APP_CONFIG.gcashNumber}</span>{' '}
                      and upload your screenshot.
                    </p>

                    {uploadSuccess ? (
                      <div className="rounded-xl bg-success/10 p-4 text-center text-sm text-success">
                        Payment screenshot uploaded! Your booking is being reviewed.
                      </div>
                    ) : (
                      <>
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) handleFile(file);
                          }}
                          className="rounded-xl border-2 border-dashed border-forest-500 p-6 text-center transition hover:border-gold-400/50"
                        >
                          {screenshot ? (
                            <div className="space-y-2">
                              <img
                                src={screenshot}
                                alt="Screenshot"
                                className="mx-auto max-h-40 rounded-lg object-contain"
                              />
                              <button
                                onClick={() => setScreenshot(null)}
                                className="text-xs text-cream-muted underline"
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="mx-auto h-8 w-8 text-cream-muted/40" />
                              <p className="mt-2 text-sm text-cream-muted">
                                Drag & drop or{' '}
                                <label className="cursor-pointer text-gold-300 underline">
                                  browse
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFile(file);
                                    }}
                                  />
                                </label>
                              </p>
                            </>
                          )}
                        </div>

                        {screenshot && (
                          <>
                            <div className="mt-3">
                              <input
                                type="text"
                                value={paymentRef}
                                onChange={(e) => setPaymentRef(e.target.value)}
                                placeholder="GCash reference number"
                                className="input-field"
                              />
                            </div>
                            <Button
                              className="mt-3"
                              fullWidth
                              isLoading={uploading}
                              disabled={!paymentRef.trim()}
                              onClick={handleUpload}
                              leftIcon={<Upload className="h-4 w-4" />}
                            >
                              Upload Payment
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
                    Your booking is confirmed! See you on the court.
                  </div>
                )}
                {booking.status === 'completed' && (
                  <div className="rounded-xl border border-gold-400/30 bg-gold-400/10 p-4 text-center text-sm text-gold-300">
                    Thanks for playing with us! We hope to see you again soon.
                  </div>
                )}
                {booking.status === 'cancelled' && (
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-center text-sm text-error">
                    This booking has been cancelled.
                  </div>
                )}
                {booking.status === 'rejected' && (
                  <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-center text-sm text-error">
                    Your payment could not be verified. Please contact us.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}