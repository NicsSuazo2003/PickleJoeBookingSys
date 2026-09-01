// src/pages/Success.tsx
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Home,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useBookingStore } from '@/stores/bookingStore';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
} from '@/utils/format';

export function Success() {
  const navigate = useNavigate();
  const { currentBooking } = useBookingStore();

  useEffect(() => {
    if (!currentBooking) {
      navigate('/');
    }
  }, [currentBooking, navigate]);

  if (!currentBooking) return null;

  const formatSlotTime = (slot: { startTime?: string; endTime?: string; start_time?: string; end_time?: string }): string => {
    const start = slot.startTime || slot.start_time || '';
    const end = slot.endTime || slot.end_time || '';
    return formatTimeRange(start, end);
  };

  const totalAmount = typeof currentBooking.total_amount === 'number'
    ? currentBooking.total_amount
    : 0;

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-20 pb-10 sm:pt-24 sm:pb-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.2 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/20 sm:h-20 sm:w-20"
            >
              <CheckCircle2 className="h-7 w-7 text-success sm:h-10 sm:w-10" />
            </motion.div>
            <h1 className="mt-4 text-2xl font-bold text-cream sm:mt-6 sm:text-4xl">
              Payment Submitted!
            </h1>
            <p className="mt-2 text-sm text-cream-muted sm:mt-3 sm:text-base">
              Your booking is now being reviewed. We'll confirm it shortly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-5 p-4 sm:mt-8 sm:p-6"
          >
            <div className="flex items-center justify-between border-b border-forest-500 pb-3 sm:pb-4">
              <div>
                <p className="text-[11px] text-cream-muted sm:text-xs">Reference Code</p>
                <p className="text-lg font-bold tracking-wider text-gold-400 sm:text-2xl">
                  {currentBooking.reference_code}
                </p>
              </div>
              <StatusBadge status={currentBooking.status} />
            </div>

            <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gold-400 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-[11px] text-cream-muted sm:text-xs">Court</p>
                  <p className="text-sm font-medium text-cream sm:text-base">{currentBooking.court_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Calendar className="h-4 w-4 flex-shrink-0 text-gold-400 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-[11px] text-cream-muted sm:text-xs">Date</p>
                  <p className="text-sm font-medium text-cream sm:text-base">{formatDateLong(currentBooking.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Clock className="h-4 w-4 flex-shrink-0 text-gold-400 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-[11px] text-cream-muted sm:text-xs">Time Slots</p>
                  <p className="text-sm font-medium text-cream sm:text-base">
                    {currentBooking.slots.map((s) => formatSlotTime(s)).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-forest-500 pt-3 sm:mt-4 sm:pt-4">
              <span className="text-xs text-cream-muted sm:text-sm">Total Paid</span>
              <span className="text-xl font-bold text-gold-400 sm:text-2xl">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 rounded-xl border border-gold-400/30 bg-gold-400/5 p-4 sm:mt-6 sm:p-5"
          >
            <h3 className="text-sm font-semibold text-gold-300 sm:text-base">What happens next?</h3>
            <ul className="mt-2.5 space-y-1.5 text-xs text-cream-muted sm:mt-3 sm:space-y-2 sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" />
                Our team will verify your GCash payment screenshot
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" />
                You'll receive a confirmation once approved (usually within 30 minutes)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" />
                Save your reference code to track your booking anytime
              </li>
            </ul>
          </motion.div>

          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Button
              size="lg"
              fullWidth
              to="/track"
              leftIcon={<Search className="h-5 w-5" />}
            >
              Track This Booking
            </Button>
            <Button
              size="lg"
              variant="secondary"
              fullWidth
              to="/"
              leftIcon={<Home className="h-5 w-5" />}
            >
              Back to Home
            </Button>
          </div>

          <p className="mt-5 text-center text-xs text-cream-muted sm:mt-6">
            Bookmark this page or save your reference code:{' '}
            <span className="font-mono font-bold text-gold-400">
              {currentBooking.reference_code}
            </span>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}