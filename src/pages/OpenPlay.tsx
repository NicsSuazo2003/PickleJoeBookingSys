// src/pages/OpenPlay.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarDays, UserCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAdminStore } from '@/stores/adminStore';
import { formatDateLong, formatTimeRange, formatCurrency } from '@/utils/format';
import type { OpenPlaySession, CustomerDetails } from '@/types';
import { openPlayService } from '@/services/openPlayService';

const SKILL_BADGE: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-400',
  Intermediate: 'bg-yellow-500/15 text-yellow-400',
  Advanced: 'bg-red-500/15 text-red-400',
  'All Levels': 'bg-gold-400/15 text-gold-300',
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-forest-600 text-cream-muted' },
  active: { label: 'Active Now', className: 'bg-green-500/15 text-green-400' },
  full: { label: 'Full', className: 'bg-red-500/15 text-red-400' },
  past: { label: 'Past', className: 'bg-forest-700 text-cream-muted/60' },
  cancelled: { label: 'Cancelled', className: 'bg-forest-700 text-cream-muted/60' },
};

export function OpenPlay() {
  const navigate = useNavigate();
  const { sessions, loadingSessions, error, loadUpcomingSessions } = useOpenPlayStore();
  const { courts, loadCourts } = useAdminStore();
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<OpenPlaySession | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    loadUpcomingSessions();
    loadCourts();
  }, []);

  const handleJoinClick = (session: OpenPlaySession) => {
    setSelectedSession(session);
    setShowJoinModal(true);
    setJoinError(null);
    setCustomerDetails({ name: '', email: '', phone: '', notes: '' });
  };

  const handleJoinConfirm = async () => {
    if (!selectedSession) return;
    if (!customerDetails.name.trim()) {
      setJoinError('Name is required');
      return;
    }
    if (!customerDetails.email.trim()) {
      setJoinError('Email is required');
      return;
    }
    if (!customerDetails.phone.trim()) {
      setJoinError('Phone number is required');
      return;
    }

    setJoining(true);
    setJoinError(null);

    try {
      // Join the session via API
      const booking = await openPlayService.joinSession(selectedSession.id, customerDetails);
      
      // ✅ Use the booking store's reset and then set the booking via createBooking
      // But since we already have the booking, we need to set it directly
      // Use the store's currentBooking property directly
      const store = useBookingStore.getState();
      
      // Reset any existing booking state
      store.reset();
      
      // Set the booking using a workaround - update the store directly
      // Since we can't call setCurrentBooking, we'll use the store's internal state
      useBookingStore.setState({ currentBooking: booking });
      
      // Navigate to checkout
      setShowJoinModal(false);
      navigate('/checkout');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-24 pb-16">
        <div className="mb-6 text-center sm:mb-8">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-300">
            <Users className="h-3.5 w-3.5" />
            Open Play
          </span>
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Join a Social Session
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-cream-muted">
            Drop into a group game, meet other players, and split the court. Pick a session
            below and reserve your spot.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-error/10 p-3 text-center text-xs text-error">
            {error}
          </div>
        )}

        {loadingSessions ? (
          <LoadingSpinner size="lg" className="pt-12" />
        ) : sessions.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-forest-500 bg-forest-800/50 p-8 text-center">
            <CalendarDays className="h-10 w-10 text-cream-muted/40" />
            <div>
              <h2 className="text-sm font-bold text-cream">No sessions scheduled yet</h2>
              <p className="mt-1 text-xs text-cream-muted">
                Check back soon, or book a private court in the meantime.
              </p>
            </div>
            <Button size="md" to="/booking">
              Book a Court
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, i) => {
              const isFull = session.status === 'full';
              const status = STATUS_BADGE[session.status] ?? STATUS_BADGE.upcoming;
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card flex flex-col p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        SKILL_BADGE[session.skill_level] ?? SKILL_BADGE['All Levels']
                      }`}
                    >
                      {session.skill_level}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-cream">
                    {session.court_name}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs text-cream-muted">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-gold-400" />
                      {formatDateLong(session.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gold-400" />
                      {formatTimeRange(session.start_time, session.end_time)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gold-400" />
                      {session.current_players}/{session.max_players} players ·{' '}
                      {session.spots_left} spot{session.spots_left === 1 ? '' : 's'} left
                    </div>
                    {session.host_name && (
                      <div className="flex items-center gap-1.5">
                        <UserCircle2 className="h-3.5 w-3.5 text-gold-400" />
                        Hosted by {session.host_name}
                      </div>
                    )}
                  </div>

                  {session.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-cream-muted/80">
                      {session.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-forest-600 pt-3">
                    <div>
                      <p className="text-[10px] text-cream-muted">Per player</p>
                      <p className="font-display text-lg font-bold text-gold-400">
                        {formatCurrency(session.price_per_player)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={isFull}
                      onClick={() => handleJoinClick(session)}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      {isFull ? 'Full' : 'Join Now'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Open Play Session"
        size="md"
      >
        {selectedSession && (
          <div className="space-y-4">
            {/* Session Summary */}
            <div className="rounded-lg bg-forest-800 p-3">
              <p className="text-sm font-medium text-cream">{selectedSession.court_name}</p>
              <p className="text-xs text-cream-muted">
                {formatDateLong(selectedSession.date)} · {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
              </p>
              <p className="text-xs text-cream-muted">
                {selectedSession.current_players}/{selectedSession.max_players} players · {formatCurrency(selectedSession.price_per_player)}/player
              </p>
            </div>

            {/* Customer Details */}
            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={customerDetails.name}
              onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="you@email.com"
              value={customerDetails.email}
              onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
            />

            <Input
              label="Phone Number *"
              placeholder="0917 123 4567"
              value={customerDetails.phone}
              onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
            />

            <Input
              label="Notes (optional)"
              placeholder="Any special requests?"
              value={customerDetails.notes || ''}
              onChange={(e) => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
            />

            {joinError && (
              <div className="rounded-lg bg-error/10 p-2 text-xs text-error">
                {joinError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                fullWidth
                isLoading={joining}
                onClick={handleJoinConfirm}
              >
                Confirm & Pay
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}