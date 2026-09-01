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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore } from '@/stores/bookingStore';
import { useClientStore } from '@/stores/clientStore';
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
  const settings = useClientStore((state) => state.settings);
  const loadSettings = useClientStore((state) => state.loadSettings);

  const displayNumber = settings?.gcash_number || APP_CONFIG.gcashNumber;
  const displayAccountName = settings?.gcash_account_name || APP_CONFIG.gcashAccountName;

  const [timeLeft, setTimeLeft] = useState(APP_CONFIG.paymentTimerSeconds);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // ✅ Toggle for order summary on mobile

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
    navigator.clipboard.writeText(displayNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-20 pb-8">
        <Link
          to="/booking"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-cream-muted hover:text-gold-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="mb-4">
          <h1 className="text-xl font-bold text-cream sm:text-2xl">Checkout</h1>
          <p className="text-xs text-cream-muted">Complete your GCash payment to confirm</p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
          {/* Left: Payment Instructions - COMPACT */}
          <div className="space-y-3 lg:col-span-3">
            {/* Payment Timer - COMPACT */}
            <div className={`card p-3 sm:p-4 ${isExpired ? 'border-error' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isExpired ? 'bg-error/20' : 'bg-warning/20'}`}>
                    <Clock className={`h-4 w-4 ${isExpired ? 'text-error' : 'text-warning'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cream">
                      {isExpired ? 'Payment Expired' : 'Complete in'}
                    </p>
                    <p className="text-[10px] text-cream-muted">Hold time: 15 min</p>
                  </div>
                </div>
                <div className={`font-display text-2xl font-bold tabular-nums ${isExpired ? 'text-error' : timeLeft < 60 ? 'text-warning' : 'text-gold-400'}`}>
                  {formatCountdown(Math.max(timeLeft, 0))}
                </div>
              </div>
            </div>

            {/* GCash Instructions - COMPACT */}
            <div className="card p-4">
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400">
                <Wallet className="h-3.5 w-3.5" />
                GCash Payment
              </h2>

              <div className="flex items-center justify-between rounded-lg border border-forest-500 bg-forest-800 p-2.5">
                <div>
                  <p className="text-[10px] text-cream-muted">Send to</p>
                  <p className="font-display text-sm font-bold text-cream">{displayNumber}</p>
                  <p className="text-[10px] text-cream-muted">{displayAccountName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyGcash}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                  >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-lg border border-gold-400/30 bg-gold-400/10 px-3 py-2">
                <span className="text-[10px] text-cream-muted">Amount</span>
                <span className="font-display text-lg font-bold text-gold-400">
                  {formatCurrency(currentBooking.total_amount)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 rounded-lg bg-forest-800 p-2">
                <span className="text-[10px] text-cream-muted">Ref:</span>
                <span className="font-mono text-xs font-bold text-gold-400">
                  {currentBooking.reference_code}
                </span>
                <span className="text-[9px] text-cream-muted">(memo)</span>
              </div>
            </div>

            {/* Screenshot Upload - COMPACT */}
            <div className="card p-4">
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400">
                <Upload className="h-3.5 w-3.5" />
                Upload Screenshot
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
                className={`rounded-lg border-2 border-dashed p-4 text-center transition-all ${
                  dragOver
                    ? 'border-gold-400 bg-gold-400/10'
                    : screenshot
                      ? 'border-success bg-success/5'
                      : 'border-forest-500 hover:border-gold-400/50'
                }`}
              >
                {screenshot ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={screenshot}
                      alt="Payment screenshot"
                      className="h-14 w-14 rounded-lg object-contain"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-xs text-success">Uploaded ✓</p>
                      <button
                        onClick={() => setScreenshot(null)}
                        className="text-[10px] text-cream-muted underline hover:text-gold-300"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 text-cream-muted/40" />
                    <p className="mt-1 text-xs text-cream-muted">Tap to upload</p>
                    <label className="mt-1 inline-block cursor-pointer">
                      <span className="rounded-lg border border-gold-400 px-3 py-1 text-xs font-medium text-gold-300 transition hover:bg-gold-400/10">
                        Browse
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
                  </div>
                )}
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="GCash reference #"
                  className="input-field text-sm py-2"
                />
              </div>

              {uploadError && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-error/10 p-2 text-xs text-error">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              <Button
                size="md"
                fullWidth
                className="mt-3"
                isLoading={uploading}
                disabled={!screenshot || !paymentRef.trim() || isExpired}
                onClick={handleUpload}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
              >
                Submit Payment
              </Button>

              {isExpired && (
                <p className="mt-2 text-center text-xs text-error">
                  Expired. Please start a new booking.
                </p>
              )}
            </div>
          </div>

          {/* Right: Order Summary - COMPACT & Collapsible on mobile */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              {/* Mobile toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between lg:hidden"
              >
                <h2 className="font-display text-sm font-bold text-cream">Order Summary</h2>
                <div className="flex items-center gap-1.5 text-cream-muted">
                  <span className="text-xs font-bold text-gold-400">
                    {formatCurrency(currentBooking.total_amount)}
                  </span>
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              <h2 className="hidden font-display text-base font-bold text-cream lg:block">Order Summary</h2>

              <div className={`mt-3 space-y-2 ${showDetails ? 'block' : 'hidden lg:block'}`}>
                <div className="rounded-lg bg-forest-800 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cream-muted">Court</span>
                    <span className="text-xs font-medium text-cream">{currentBooking.court_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cream-muted">Date</span>
                    <span className="text-xs font-medium text-cream">{formatDateLong(currentBooking.date)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-cream-muted">Slots</p>
                  {currentBooking.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg bg-forest-800 px-2.5 py-1.5"
                    >
                      <span className="text-xs text-cream">{formatTimeRange(slot.start_time, slot.end_time)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-forest-500 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cream-muted">Total</span>
                    <span className="font-display text-lg font-bold text-gold-400">
                      {formatCurrency(currentBooking.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-forest-800 p-2">
                  <p className="text-[10px] font-semibold text-cream">Customer</p>
                  <p className="text-xs text-cream">{currentBooking.customer.name}</p>
                  <p className="text-[10px] text-cream-muted">{currentBooking.customer.email}</p>
                </div>

                <button
                  onClick={() => {
                    reset();
                    navigate('/booking');
                  }}
                  className="mt-2 w-full text-center text-[10px] text-cream-muted underline hover:text-gold-300"
                >
                  Cancel booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}