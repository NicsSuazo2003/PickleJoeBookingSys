// src/pages/OpenPlay.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  CalendarDays,
  UserCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { useBookingStore } from '@/stores/bookingStore';
import { formatDateLong, formatTimeRange, formatCurrency } from '@/utils/format';
import type { OpenPlaySession, CustomerDetails } from '@/types';
import { openPlayService } from '@/services/openPlayService';
import type { PublicOpenPlayPlayer } from '@/services/openPlayService';

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
  const location = useLocation();
  const { sessions, loadingSessions, error, loadUpcomingSessions } = useOpenPlayStore();

  // ── Join modal state ─────────────────────────────────────
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

  // ── Details modal state ──────────────────────────────────
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSession, setDetailsSession] = useState<OpenPlaySession | null>(null);
  const [detailsPlayers, setDetailsPlayers] = useState<PublicOpenPlayPlayer[]>([]);
  const [loadingDetailsPlayers, setLoadingDetailsPlayers] = useState(false);
  const [rosterUnavailable, setRosterUnavailable] = useState(false);

  useEffect(() => {
    loadUpcomingSessions();
  }, []);

  // Auto-open details modal if session ID is passed via state
  useEffect(() => {
    const state = location.state as { selectedSessionId?: string } | null;
    const sessionId = state?.selectedSessionId;

    if (sessionId && sessions.length > 0) {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      if (session.status === 'full' || session.status === 'past' || session.status === 'cancelled') {
        return;
      }
      handleViewDetails(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, location.state]);

  // ── Details handlers ─────────────────────────────────────
  const handleViewDetails = async (session: OpenPlaySession) => {
    setDetailsSession(session);
    setShowDetailsModal(true);
    setRosterUnavailable(false);
    setDetailsPlayers([]);
    setLoadingDetailsPlayers(true);

    try {
      const players = await openPlayService.getSessionPlayers(session.id);
      setDetailsPlayers(players);
    } catch (err) {
      console.warn('Roster unavailable:', err);
      setRosterUnavailable(true);
    } finally {
      setLoadingDetailsPlayers(false);
    }
  };

  const handleDetailsClose = () => {
    setShowDetailsModal(false);
    setDetailsSession(null);
    setDetailsPlayers([]);
    setRosterUnavailable(false);
    // Clear navigation state so a refresh/back doesn't reopen it
    navigate('/open-play', { replace: true, state: {} });
  };

  // ── Join handlers ────────────────────────────────────────
  const handleJoinClick = (session: OpenPlaySession) => {
    setSelectedSession(session);
    setShowJoinModal(true);
    setJoinError(null);
    setCustomerDetails({ name: '', email: '', phone: '', notes: '' });
  };

  const handleJoinFromDetails = () => {
    if (!detailsSession) return;
    const session = detailsSession;
    handleDetailsClose();
    handleJoinClick(session);
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
      const booking = await openPlayService.joinSession(selectedSession.id, customerDetails);

      const store = useBookingStore.getState();
      store.reset();
      useBookingStore.setState({ currentBooking: booking });

      setShowJoinModal(false);
      navigate('/checkout');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const handleModalClose = () => {
    setShowJoinModal(false);
    setSelectedSession(null);
    navigate('/open-play', { replace: true, state: {} });
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
                  onClick={() => handleViewDetails(session)}
                  className="card flex cursor-pointer flex-col p-4 transition hover:border-gold-400/50"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewDetails(session);
                    }
                  }}
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
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(session);
                        }}
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        disabled={isFull}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClick(session);
                        }}
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        {isFull ? 'Full' : 'Join Now'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────── Details Modal ─────────────────────── */}
      <Modal
        isOpen={showDetailsModal}
        onClose={handleDetailsClose}
        title="Session Details"
        size="md"
      >
        {detailsSession && (
          <div className="space-y-4">
            {/* Header badges + title */}
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    (STATUS_BADGE[detailsSession.status] ?? STATUS_BADGE.upcoming).className
                  }`}
                >
                  {(STATUS_BADGE[detailsSession.status] ?? STATUS_BADGE.upcoming).label}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    SKILL_BADGE[detailsSession.skill_level] ?? SKILL_BADGE['All Levels']
                  }`}
                >
                  {detailsSession.skill_level}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-cream">
                {detailsSession.court_name}
              </h3>
            </div>

            {/* Meta */}
            <div className="space-y-2 rounded-lg bg-forest-800 p-3 text-xs text-cream-muted">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-gold-400" />
                {formatDateLong(detailsSession.date)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-gold-400" />
                {formatTimeRange(detailsSession.start_time, detailsSession.end_time)}
              </div>
              {detailsSession.host_name && (
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-3.5 w-3.5 text-gold-400" />
                  Hosted by <span className="text-cream">{detailsSession.host_name}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {detailsSession.description && (
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400">
                  About this session
                </p>
                <p className="whitespace-pre-wrap text-xs text-cream-muted">
                  {detailsSession.description}
                </p>
              </div>
            )}

            {/* Roster */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gold-400">
                Players ({detailsSession.current_players}/{detailsSession.max_players})
              </p>

              {/* Progress bar */}
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-forest-700">
                <div
                  className="h-full bg-gold-400 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (detailsSession.current_players / detailsSession.max_players) * 100
                    )}%`,
                  }}
                />
              </div>

              {loadingDetailsPlayers ? (
                <div className="py-2">
                  <LoadingSpinner size="sm" />
                </div>
              ) : rosterUnavailable ? (
                <p className="text-xs text-cream-muted">
                  {detailsSession.current_players} player
                  {detailsSession.current_players === 1 ? '' : 's'} joined ·{' '}
                  {detailsSession.spots_left} spot
                  {detailsSession.spots_left === 1 ? '' : 's'} left
                </p>
              ) : detailsPlayers.length === 0 ? (
                <p className="text-xs text-cream-muted">
                  No one has joined yet — be the first!
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {detailsPlayers.map((player) => (
                    <span
                      key={player.booking_id}
                      className="rounded-full bg-forest-700 px-2.5 py-1 text-[11px] text-cream"
                    >
                      {player.display_name}
                    </span>
                  ))}
                  {detailsSession.spots_left > 0 && (
                    <span className="rounded-full border border-dashed border-forest-500 px-2.5 py-1 text-[11px] text-cream-muted">
                      +{detailsSession.spots_left} spot
                      {detailsSession.spots_left === 1 ? '' : 's'} open
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between rounded-lg border border-gold-400/30 bg-gold-400/10 p-3">
              <div>
                <p className="text-[10px] text-cream-muted">Price per player</p>
                <p className="font-display text-lg font-bold text-gold-400">
                  {formatCurrency(detailsSession.price_per_player)}
                </p>
              </div>
              <Button
                size="md"
                disabled={detailsSession.status === 'full'}
                onClick={handleJoinFromDetails}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {detailsSession.status === 'full' ? 'Full' : 'Join This Session'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────── Join Modal ─────────────────────── */}
      <Modal
        isOpen={showJoinModal}
        onClose={handleModalClose}
        title="Join Open Play Session"
        size="md"
      >
        {selectedSession && (
          <div className="space-y-4">
            {/* Session Summary */}
            <div className="rounded-lg bg-forest-800 p-3">
              <p className="text-sm font-medium text-cream">{selectedSession.court_name}</p>
              <p className="text-xs text-cream-muted">
                {formatDateLong(selectedSession.date)} ·{' '}
                {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
              </p>
              <p className="text-xs text-cream-muted">
                {selectedSession.current_players}/{selectedSession.max_players} players ·{' '}
                {formatCurrency(selectedSession.price_per_player)}/player
              </p>
            </div>

            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={customerDetails.name}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, name: e.target.value })
              }
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="you@email.com"
              value={customerDetails.email}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, email: e.target.value })
              }
            />

            <Input
              label="Phone Number *"
              placeholder="0917 123 4567"
              value={customerDetails.phone}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, phone: e.target.value })
              }
            />

            <Input
              label="Notes (optional)"
              placeholder="Any special requests?"
              value={customerDetails.notes || ''}
              onChange={(e) =>
                setCustomerDetails({ ...customerDetails, notes: e.target.value })
              }
            />

            {joinError && (
              <div className="rounded-lg bg-error/10 p-2 text-xs text-error">{joinError}</div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button fullWidth isLoading={joining} onClick={handleJoinConfirm}>
                Confirm & Pay
              </Button>
              <Button variant="ghost" fullWidth className="sm:w-auto" onClick={handleModalClose}>
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