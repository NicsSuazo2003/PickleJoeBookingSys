// OpenPlay.tsx - Remove setCurrentBooking and use reset instead

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarDays, UserCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { useBookingStore } from '@/stores/bookingStore';
import { formatDateLong, formatTimeRange, formatCurrency } from '@/utils/format';
import type { OpenPlaySession } from '@/types';

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
  const { sessions, loadingSessions, error, loadUpcomingSessions, setSelectedSession } =
    useOpenPlayStore();
  const { reset } = useBookingStore(); // ✅ Use reset instead

  useEffect(() => {
    loadUpcomingSessions();
  }, [loadUpcomingSessions]);

  const handleJoin = (session: OpenPlaySession) => {
    setSelectedSession(session);
    reset(); // ✅ Clear any existing booking state
    navigate(`/booking?openPlay=${session.id}`);
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
                      onClick={() => handleJoin(session)}
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

      <Footer />
    </div>
  );
}