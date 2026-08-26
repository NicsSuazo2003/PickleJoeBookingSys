import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Wallet,
  Clock,
  Upload,
  AlertCircle,
  CheckCircle2,
  Copy,
  ImageIcon,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore } from '@/stores/bookingStore';
import { bookingService } from '@/services/bookingService';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
  formatCountdown,
} from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';

export function Checkout() {
  const navigate = useNavigate();
  const { currentBooking, reset } = useBookingStore();
  const [timeLeft, setTimeLeft] = useState(APP_CONFIG.paymentTimerSeconds);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!currentBooking) {
      navigate('/booking');
    }
  }, [currentBooking, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!currentBooking) {
    return null;
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!screenshot || !paymentRef.trim()) return;
    setUploading(true);
    setUploadError(null);
    try {
      await bookingService.uploadPayment(
        currentBooking.id,
        screenshot,
        paymentRef.trim()
      );
      navigate('/success');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyGcash = () => {
    navigator.clipboard.writeText(APP_CONFIG.gcashNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-24 pb-12">
        <Link
          to="/booking"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cream-muted hover:text-gold-300 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Booking
        </Link>

        <div className="mb-8">
          <h1 className="section-title">Checkout</h1>
          <p className="mt-2 text-cream-muted">
            Complete your GCash payment to confirm your booking.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Payment Instructions */}
          <div className="space-y-6">
            {/* Payment Timer */}
            <div
              className={`card p-5 ${isExpired ? 'border-error' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isExpired ? 'bg-error/20' : 'bg-warning/20'
                    }`}
                  >
                    <Clock className={`h-5 w-5 ${isExpired ? 'text-error' : 'text-warning'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cream">
                      {isExpired ? 'Payment Expired' : 'Complete Payment Within'}
                    </p>
                    <p className="text-xs text-cream-muted">
                      Your slots are held for 15 minutes
                    </p>
                  </div>
                </div>
                <div
                  className={`font-display text-3xl font-bold tabular-nums ${
                    isExpired ? 'text-error' : timeLeft < 60 ? 'text-warning' : 'text-gold-400'
                  }`}
                >
                  {formatCountdown(Math.max(timeLeft, 0))}
                </div>
              </div>
            </div>

            {/* GCash Instructions */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <Wallet className="h-5 w-5 text-gold-400" />
                GCash Payment
              </h2>

              <div className="rounded-xl border border-forest-500 bg-forest-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-cream-muted">Send to GCash Number</p>
                    <p className="font-display text-xl font-bold text-cream">
                      {APP_CONFIG.gcashNumber}
                    </p>
                    <p className="text-xs text-cream-muted">{APP_CONFIG.gcashAccountName}</p>
                  </div>
                  <button
                    onClick={copyGcash}
                    className="rounded-lg border border-forest-500 p-2 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border-2 border-gold-400/30 bg-gold-400/10 p-4">
                <p className="text-xs text-cream-muted">Amount to Send</p>
                <p className="font-display text-3xl font-bold text-gold-400">
                  {formatCurrency(currentBooking.total_amount)}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-forest-800 p-4">
                <p className="text-xs text-cream-muted">Reference Code</p>
                <p className="font-display text-lg font-bold tracking-wider text-cream">
                  {currentBooking.reference_code}
                </p>
                <p className="mt-1 text-xs text-cream-muted">
                  Use this as your GCash note or memo
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-cream">Steps:</p>
                <ol className="space-y-1.5 text-sm text-cream-muted">
                  <li>1. Open your GCash app and select "Send Money"</li>
                  <li>2. Enter the GCash number above</li>
                  <li>3. Send the exact amount shown</li>
                  <li>4. Use your reference code as the message</li>
                  <li>5. Take a screenshot of the confirmation</li>
                  <li>6. Upload the screenshot below</li>
                </ol>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <Upload className="h-5 w-5 text-gold-400" />
                Upload Payment Screenshot
              </h2>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  dragOver
                    ? 'border-gold-400 bg-gold-400/10'
                    : screenshot
                      ? 'border-success bg-success/5'
                      : 'border-forest-500 hover:border-gold-400/50'
                }`}
              >
                {screenshot ? (
                  <div className="space-y-3">
                    <img
                      src={screenshot}
                      alt="Payment screenshot"
                      className="mx-auto max-h-48 rounded-lg object-contain"
                    />
                    <p className="text-sm text-success">Screenshot uploaded</p>
                    <button
                      onClick={() => setScreenshot(null)}
                      className="text-xs text-cream-muted underline hover:text-gold-300"
                    >
                      Change image
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-10 w-10 text-cream-muted/40" />
                    <p className="mt-3 text-sm text-cream-muted">
                      Drag and drop your screenshot here
                    </p>
                    <p className="text-xs text-cream-muted">or</p>
                    <label className="mt-2 inline-block cursor-pointer">
                      <span className="rounded-lg border border-gold-400 px-4 py-2 text-sm font-medium text-gold-300 transition hover:bg-gold-400/10">
                        Browse Files
                      </span>
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
                  </>
                )}
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-cream">
                  GCash Reference Number
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. GCASH123456789"
                  className="input-field"
                />
              </div>

              {uploadError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              <Button
                size="lg"
                fullWidth
                className="mt-4"
                isLoading={uploading}
                disabled={!screenshot || !paymentRef.trim() || isExpired}
                onClick={handleUpload}
                leftIcon={<CheckCircle2 className="h-5 w-5" />}
              >
                Submit Payment
              </Button>

              {isExpired && (
                <p className="mt-3 text-center text-xs text-error">
                  Your booking has expired. Please start a new booking.
                </p>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="card sticky top-24 p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-cream">Order Summary</h2>

              <div className="mb-4 rounded-xl bg-forest-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cream-muted">Reference</span>
                  <span className="font-mono font-bold text-gold-400">
                    {currentBooking.reference_code}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-cream-muted">Court</span>
                  <span className="text-sm font-medium text-cream">
                    {currentBooking.court_name}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-cream-muted">Date</span>
                  <span className="text-sm font-medium text-cream">
                    {formatDateLong(currentBooking.date)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-cream">Selected Slots</p>
                {currentBooking.slots.map((slot) => (
                  <div
                    key={slot.slot_id}
                    className="flex items-center justify-between rounded-lg bg-forest-800 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-cream">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </p>
                      {slot.type === 'fixed_2hr' && (
                        <span className="text-[10px] font-semibold text-gold-400">
                          2hr Fixed Slot
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gold-400">
                      {formatCurrency(slot.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-forest-500 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cream-muted">Subtotal</span>
                  <span className="text-cream">{formatCurrency(currentBooking.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cream-muted">Service Fee</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-forest-500 pt-2">
                  <span className="font-display text-lg font-bold text-cream">Total</span>
                  <span className="font-display text-2xl font-bold text-gold-400">
                    {formatCurrency(currentBooking.total_amount)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-forest-800 p-4">
                <p className="mb-2 text-xs font-semibold text-cream">Customer Details</p>
                <div className="space-y-1 text-xs text-cream-muted">
                  <p>{currentBooking.customer.name}</p>
                  <p>{currentBooking.customer.email}</p>
                  <p>{currentBooking.customer.phone}</p>
                  {currentBooking.customer.notes && (
                    <p className="italic">"{currentBooking.customer.notes}"</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  reset();
                  navigate('/booking');
                }}
                className="mt-4 w-full text-center text-xs text-cream-muted underline hover:text-gold-300"
              >
                Cancel this booking
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
