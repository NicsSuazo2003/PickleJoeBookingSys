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

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-24 pb-12">
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
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20"
            >
              <CheckCircle2 className="h-10 w-10 text-success" />
            </motion.div>
            <h1 className="mt-6 font-display text-3xl font-bold text-cream sm:text-4xl">
              Payment Submitted!
            </h1>
            <p className="mt-3 text-cream-muted">
              Your booking is now being reviewed. We'll confirm it shortly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-8 p-6"
          >
            <div className="flex items-center justify-between border-b border-forest-500 pb-4">
              <div>
                <p className="text-xs text-cream-muted">Reference Code</p>
                <p className="font-display text-2xl font-bold tracking-wider text-gold-400">
                  {currentBooking.referenceCode}
                </p>
              </div>
              <StatusBadge status={currentBooking.status} />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gold-400" />
                <div>
                  <p className="text-xs text-cream-muted">Court</p>
                  <p className="font-medium text-cream">{currentBooking.courtName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gold-400" />
                <div>
                  <p className="text-xs text-cream-muted">Date</p>
                  <p className="font-medium text-cream">{formatDateLong(currentBooking.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gold-400" />
                <div>
                  <p className="text-xs text-cream-muted">Time Slots</p>
                                    <p className="font-medium text-cream">
                    {currentBooking.slots.map((s) => formatTimeRange(s.startTime, s.endTime)).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-forest-500 pt-4">
              <span className="text-sm text-cream-muted">Total Paid</span>
              <span className="font-display text-2xl font-bold text-gold-400">
                {formatCurrency(currentBooking.totalAmount)}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-xl border border-gold-400/30 bg-gold-400/5 p-5"
          >
            <h3 className="font-semibold text-gold-300">What happens next?</h3>
            <ul className="mt-3 space-y-2 text-sm text-cream-muted">
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          <p className="mt-6 text-center text-xs text-cream-muted">
            Bookmark this page or save your reference code:{' '}
            <span className="font-mono font-bold text-gold-400">
              {currentBooking.referenceCode}
            </span>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

void Link;
void ArrowRight;
