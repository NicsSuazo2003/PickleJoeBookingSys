import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarPlus,
  Wallet,
  ShieldCheck,
  Clock,
  ArrowRight,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  Users,
  UserCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore } from '@/stores/bookingStore';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { COURT_IMAGES, APP_CONFIG } from '@/utils/constants';
import {
  formatCurrency,
  todayISO,
  formatDateLong,
  toISODate,
  addDays,
} from '@/utils/format';
import type { TimeSlot, Court, OpenPlaySession } from '@/types';

// Court palette harmonized column accents
const COURT_ACCENTS = [
  { header: 'text-court-300', dot: 'bg-court-400', border: 'border-court-500/40', bg: 'bg-court-500/15', text: 'text-court-100', hoverBorder: 'hover:border-court-400/80', hoverBg: 'hover:bg-court-500/25' },
  { header: 'text-forest-200', dot: 'bg-forest-400', border: 'border-forest-400/40', bg: 'bg-forest-500/20', text: 'text-forest-100', hoverBorder: 'hover:border-forest-300/80', hoverBg: 'hover:bg-forest-500/35' },
  { header: 'text-court-200', dot: 'bg-court-300', border: 'border-court-400/40', bg: 'bg-court-600/20', text: 'text-court-50', hoverBorder: 'hover:border-court-300/80', hoverBg: 'hover:bg-court-600/30' },
  { header: 'text-forest-300', dot: 'bg-forest-300', border: 'border-forest-500/40', bg: 'bg-forest-600/20', text: 'text-forest-100', hoverBorder: 'hover:border-forest-400/80', hoverBg: 'hover:bg-forest-600/30' },
  { header: 'text-court-300', dot: 'bg-court-400', border: 'border-court-500/40', bg: 'bg-court-500/15', text: 'text-court-100', hoverBorder: 'hover:border-court-400/80', hoverBg: 'hover:bg-court-500/25' },
  { header: 'text-forest-200', dot: 'bg-forest-400', border: 'border-forest-400/40', bg: 'bg-forest-500/20', text: 'text-forest-100', hoverBorder: 'hover:border-forest-300/80', hoverBg: 'hover:bg-forest-500/35' },
];

function getCourtAccent(index: number) {
  return COURT_ACCENTS[index % COURT_ACCENTS.length];
}

type CourtAccent = ReturnType<typeof getCourtAccent>;

function formatTimeShort(time: string): string {
  if (!time) return '';
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return minute === 0 ? `${hour12}${ampm}` : `${hour12}:${String(minute).padStart(2, '0')}${ampm}`;
}

function formatTimeRangeShort(start: string, end: string): string {
  return `${formatTimeShort(start)}-${formatTimeShort(end)}`;
}

function isWithinHours(session: OpenPlaySession, hours: number): boolean {
  try {
    const sessionStart = new Date(`${session.date}T${session.start_time}`);
    const now = new Date();
    const diffHours = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= -1 && diffHours <= hours;
  } catch {
    return false;
  }
}

function isWithinNextWeek(session: OpenPlaySession): boolean {
  try {
    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return sessionDate >= today && sessionDate <= weekFromNow;
  } catch {
    return false;
  }
}

const SKILL_BADGE: Record<string, string> = {
  Beginner: 'bg-forest-500/25 text-forest-200 border border-forest-400/30',
  Intermediate: 'bg-court-500/25 text-court-200 border border-court-400/30',
  Advanced: 'bg-accent/20 text-accent-light border border-accent/40',
  'All Levels': 'bg-court-600/30 text-court-100 border border-court-400/40',
};

export function Landing() {
  const navigate = useNavigate();
  const bookingSectionRef = useRef<HTMLDivElement>(null);

  const {
    courts,
    selectedDate,
    slots,
    selectedSlotIds,
    loadingCourts,
    loadingSlots,
    error,
    loadCourts,
    setDate,
    toggleSlot,
    loadAllCourtsSlots,
  } = useBookingStore();

  const {
    sessions: openPlaySessions,
    loadingSessions: loadingOpenPlay,
    loadUpcomingSessions,
  } = useOpenPlayStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
    loadUpcomingSessions();
  }, [courts.length, loadCourts, loadUpcomingSessions]);

  useEffect(() => {
    if (courts.length > 0) {
      loadAllCourtsSlots();
    }
  }, [selectedDate, courts.length, loadAllCourtsSlots]);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSession = openPlaySessions
    .filter(
      (s) =>
        s.is_active &&
        s.status !== 'cancelled' &&
        s.status !== 'past' &&
        isWithinHours(s, 48)
    )
    .sort((a, b) => {
      const aStart = new Date(`${a.date}T${a.start_time}`).getTime();
      const bStart = new Date(`${b.date}T${b.start_time}`).getTime();
      return aStart - bStart;
    })[0];

  const weekSessions = openPlaySessions
    .filter(
      (s) =>
        s.is_active &&
        s.status !== 'cancelled' &&
        s.status !== 'past' &&
        isWithinNextWeek(s)
    )
    .sort((a, b) => {
      const aStart = new Date(`${a.date}T${a.start_time}`).getTime();
      const bStart = new Date(`${b.date}T${b.start_time}`).getTime();
      return aStart - bStart;
    })
    .slice(0, 6);

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getOpenPlaySessionForSlot = (
    courtId: string,
    startTime: string,
    endTime: string
  ): OpenPlaySession | undefined => {
    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);

    return openPlaySessions.find((session) => {
      const sessionCourts =
        session.courts && session.courts.length > 0
          ? session.courts.map((c) => c.id)
          : [session.court_id];

      return (
        sessionCourts.includes(courtId) &&
        session.date === selectedDate &&
        session.is_active === true &&
        timeToMinutes(session.start_time) <= slotStart &&
        timeToMinutes(session.end_time) >= slotEnd
      );
    });
  };

  const handleOpenPlayClick = (session: OpenPlaySession) => {
    navigate('/open-play', { state: { selectedSessionId: session.id } });
  };

  const getTimeIntervalsByPeriod = (slotsList: TimeSlot[]) => {
    const morningMap = new Map<string, { start_time: string; end_time: string }>();
    const afternoonMap = new Map<string, { start_time: string; end_time: string }>();
    const eveningMap = new Map<string, { start_time: string; end_time: string }>();

    slotsList.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(':')[0], 10);
      const key = `${slot.start_time}-${slot.end_time}`;
      const timeObj = { start_time: slot.start_time, end_time: slot.end_time };

      if (hour < 12) {
        morningMap.set(key, timeObj);
      } else if (hour < 17) {
        afternoonMap.set(key, timeObj);
      } else {
        eveningMap.set(key, timeObj);
      }
    });

    const sortFn = (a: { start_time: string }, b: { start_time: string }) =>
      a.start_time.localeCompare(b.start_time);

    return {
      morningTimes: Array.from(morningMap.values()).sort(sortFn),
      afternoonTimes: Array.from(afternoonMap.values()).sort(sortFn),
      eveningTimes: Array.from(eveningMap.values()).sort(sortFn),
    };
  };

  const { morningTimes, afternoonTimes, eveningTimes } = getTimeIntervalsByPeriod(slots);

  const totalSelected = slots
    .filter((s) => selectedSlotIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const getSlotForCourtAndTime = (courtId: string, startTime: string, endTime: string) => {
    return slots.find(
      (s) =>
        s.court_id === courtId &&
        s.start_time === startTime &&
        s.end_time === endTime
    );
  };

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-start pt-28 sm:min-h-screen sm:items-center sm:pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={COURT_IMAGES.hero}
            alt="Pickleball court"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/90 to-forest-950/40" />
          <div className="absolute inset-0 bg-grid opacity-25" />
        </div>

        <div className="container-page relative z-10 py-8 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {nextSession && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                onClick={() => navigate('/open-play')}
                className="mb-4 flex w-full items-center gap-2 rounded-full border border-court-400/40 bg-court-600/30 px-3 py-2 backdrop-blur-md transition hover:border-court-300 hover:bg-court-600/50 sm:mb-5 sm:w-auto sm:px-4"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-court-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-court-300"></span>
                </span>
                <Users className="h-4 w-4 shrink-0 text-court-300" />
                <span className="truncate text-xs font-semibold text-court-100 sm:text-sm">
                  Open Play{' '}
                  {nextSession.status === 'active'
                    ? 'happening now'
                    : nextSession.date === todayISO()
                      ? 'today'
                      : 'soon'}{' '}
                  · {nextSession.current_players}/{nextSession.max_players} joined
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-court-300" />
              </motion.button>
            )}

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-cream">Center</span>
              <span className="text-court-400">Court</span>
            </h1>
            <p className="mt-3 text-xl font-medium text-cream-dark sm:mt-4 sm:text-3xl">
              {APP_CONFIG.tagline}
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream-muted sm:mt-6 sm:text-lg">
              Book premium indoor and outdoor pickleball courts in seconds. Pay easily with GCash,
              track your bookings, and get playing.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Button
                size="lg"
                onClick={scrollToBooking}
                leftIcon={<CalendarPlus className="h-5 w-5" />}
              >
                Book a Court
              </Button>
              <Button
                size="lg"
                variant="secondary"
                to="/track"
                leftIcon={<CalendarDays className="h-5 w-5" />}
              >
                Track My Booking
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-cream-muted sm:mt-10 sm:gap-6 sm:text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-court-300" />
                <span>San Agustin Sur Dawis, Tandag City</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-court-300" />
                <span>Open 5AM - 12AM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Play This Week Section */}
      {weekSessions.length > 0 && (
        <section className="relative border-b border-forest-600 bg-forest-900 py-10 sm:py-14">
          <div className="container-page">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
              <div>
                <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-court-400/30 bg-court-600/30 px-3 py-1 text-xs font-semibold text-court-200">
                  <Users className="h-3.5 w-3.5 text-court-300" />
                  Open Play
                </span>
                <h2 className="text-xl font-bold tracking-tight text-cream sm:text-2xl md:text-3xl">
                  Join a Session This Week
                </h2>
                <p className="text-xs text-cream-muted sm:text-sm">
                  Meet other players and split the court — spots fill fast
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/open-play')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                See all
              </Button>
            </div>

            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
              {weekSessions.map((session, i) => {
                const isFull =
                  session.status === 'full' ||
                  session.current_players >= session.max_players;
                const spotsLeft = Math.max(0, session.max_players - session.current_players);
                const isToday = session.date === todayISO();
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="w-[280px] shrink-0 sm:w-auto"
                  >
                    <div className="card flex h-full flex-col p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full border border-court-400/30 bg-court-600/25 px-2.5 py-0.5 text-xs font-bold text-court-200">
                          {isToday
                            ? 'TODAY'
                            : formatDateLong(session.date).split(',')[0].toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            SKILL_BADGE[session.skill_level] ?? SKILL_BADGE['All Levels']
                          }`}
                        >
                          {session.skill_level}
                        </span>
                      </div>

                      <h3 className="truncate font-display text-base font-bold text-cream">
                        {session.title || session.host_name || session.court_name}
                      </h3>

                      <div className="mt-2 space-y-1.5 text-xs text-cream-muted">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-court-300" />
                          {formatTimeRangeShort(session.start_time, session.end_time)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-court-300" />
                          {session.current_players}/{session.max_players} · {spotsLeft}{' '}
                          spot{spotsLeft === 1 ? '' : 's'} left
                        </div>
                        {session.host_name && (
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="h-3.5 w-3.5 text-court-300" />
                            <span className="truncate">Hosted by {session.host_name}</span>
                          </div>
                        )}
                        {session.courts && session.courts.length > 1 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {session.courts.map((c) => (
                              <span
                                key={c.id}
                                className="rounded border border-forest-600 bg-forest-800 px-1.5 py-0.5 text-[10px] text-cream-muted"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-forest-600 pt-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-cream-muted">Per player</p>
                          <p className="font-display text-base font-bold text-court-300 sm:text-lg">
                            {formatCurrency(session.price_per_player)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleOpenPlayClick(session)}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          {isFull ? 'Full' : 'Join'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Booking Section */}
      <div ref={bookingSectionRef}>
        <section className="relative z-20 border-y border-forest-600 bg-forest-950 py-8 md:py-16">
          <div className="container-page max-w-7xl">
            <div className="overflow-hidden rounded-2xl border border-forest-600/70 bg-forest-900 shadow-2xl md:rounded-3xl">

              {/* Header Banner */}
              <div className="border-b border-forest-700 bg-forest-950 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-7">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-cream sm:text-2xl md:text-3xl">
                      Book a <span className="text-court-300">Court</span>
                    </h2>
                    <p className="text-xs text-cream-muted sm:text-sm">
                      Pick a date, then tap any number of available time slots
                    </p>
                  </div>
                  <div className="hidden rounded-xl border border-court-500/40 bg-court-600/20 p-2.5 text-court-300 sm:block md:p-3">
                    <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>
              </div>

              <div className="p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8">
                {/* STEP 1: Date Selection */}
                <div className="mb-6 md:mb-10">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-court-400/50 bg-court-600 text-xs font-bold text-white shadow-sm">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-cream sm:text-base">
                      Choose <span className="text-court-200">Date</span>
                    </h3>
                  </div>

                  <div className="relative -mx-4 overflow-hidden px-4 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                        disabled={weekOffset === 0}
                        className="hidden h-14 w-10 shrink-0 items-center justify-center rounded-xl border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-court-400/60 hover:text-court-200 disabled:opacity-30 sm:flex"
                        aria-label="Previous week"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="no-scrollbar snap-x flex flex-1 gap-2 overflow-x-auto pb-1.5 pt-2.5 sm:grid sm:grid-cols-7 sm:overflow-visible sm:py-0">
                        {weekDays.map((day) => {
                          const iso = toISODate(day);
                          const isSelected = selectedDate === iso;
                          const isToday = iso === todayISO();
                          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                          const dayNumber = day.getDate();
                          const monthName = day.toLocaleDateString('en-US', { month: 'short' });
                          const hasOpenPlay = openPlaySessions.some(
                            (s) => s.date === iso && s.is_active && s.status !== 'cancelled'
                          );

                          return (
                            <button
                              key={iso}
                              onClick={() => setDate(iso)}
                              className={`relative flex min-w-[54px] flex-1 snap-center flex-col items-center justify-center rounded-xl border py-2 transition-all ${
                                isSelected
                                  ? 'border-court-400 bg-court-600 text-white font-bold shadow-glow-court'
                                  : 'border-forest-700/80 bg-forest-800/90 text-cream-muted hover:border-court-400/50 hover:text-cream'
                              }`}
                            >
                              {isToday && (
                                <span
                                  className={`absolute -top-2 rounded-full px-1.5 py-[1px] text-[8px] font-black tracking-wider ${
                                    isSelected
                                      ? 'bg-forest-950 text-court-300'
                                      : 'bg-court-500 text-white'
                                  }`}
                                >
                                  TODAY
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-semibold tracking-tight ${
                                  isSelected ? 'text-white' : 'text-cream-muted'
                                }`}
                              >
                                {dayName}
                              </span>

                              <span className="text-base font-extrabold leading-tight text-cream">
                                {dayNumber}
                              </span>

                              <span
                                className={`text-[9px] uppercase font-medium ${
                                  isSelected ? 'text-court-200' : 'text-cream-muted/70'
                                }`}
                              >
                                {monthName}
                              </span>

                              {hasOpenPlay && (
                                <span
                                  className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                    isSelected ? 'bg-white' : 'bg-court-300'
                                  }`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setWeekOffset((w) => w + 1)}
                        className="hidden h-14 w-10 shrink-0 items-center justify-center rounded-xl border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-court-400/60 hover:text-court-200 sm:flex"
                        aria-label="Next week"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Choose Court and Time */}
                <div>
                  <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-court-400/50 bg-court-600 text-xs font-bold text-white shadow-sm">
                        2
                      </div>
                      <h3 className="text-sm font-bold text-cream sm:text-base">
                        Choose <span className="text-court-200">Court & Time</span>
                      </h3>
                    </div>

                    <span className="rounded-full border border-court-400/40 bg-court-600/30 px-3 py-1 text-xs font-semibold text-court-200 shadow-sm">
                      <span className="sm:hidden">
                        {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="hidden sm:inline">{formatDateLong(selectedDate)}</span>
                    </span>
                  </div>

                  {/* Compact Dot Legend */}
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-forest-700/60 pb-3 text-[11px] text-cream-muted">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full border border-court-400/80 bg-court-500/30" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-court-300" />
                      <span>Open Play</span>
                    </div>
                  </div>

                  {loadingSlots || loadingCourts || loadingOpenPlay ? (
                    <LoadingSpinner className="py-12 md:py-20" />
                  ) : error ? (
                    <div className="py-8 text-center font-medium text-red-400 md:py-16">{error}</div>
                  ) : courts.length === 0 ? (
                    <div className="py-8 text-center text-sm font-medium text-cream-muted md:py-16">
                      No courts found.
                    </div>
                  ) : (
                    <div className="block">
                      <div className="max-h-[75vh] overflow-y-auto overflow-x-auto rounded-2xl border border-forest-700/60 bg-forest-950/40">
                        <div className="w-full p-4 sm:min-w-[580px]">
                          {/* Sticky Court Column Headers */}
                          <div
                            className="sticky -top-4 z-30 -mx-4 -mt-4 mb-4 border-b border-forest-700 bg-forest-900 px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-court-300 shadow-md backdrop-blur-md"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: `repeat(${courts.length}, minmax(56px, 1fr))`,
                              gap: '0.75rem',
                            }}
                          >
                            {courts.map((court, idx) => {
                              const accent = getCourtAccent(idx);
                              return (
                                <div
                                  key={court.id}
                                  className={`flex items-center justify-center gap-2 truncate ${accent.header}`}
                                >
                                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`} />
                                  <span className="truncate font-bold">{court.name}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Period Sections */}
                          <div className="space-y-6">
                            {morningTimes.length > 0 && (
                              <DesktopPeriodSection
                                title="MORNING"
                                icon={<CloudSun className="h-4 w-4 text-court-300" />}
                                courts={courts}
                                timeIntervals={morningTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                                getOpenPlaySession={getOpenPlaySessionForSlot}
                                onOpenPlayClick={handleOpenPlayClick}
                              />
                            )}
                            {afternoonTimes.length > 0 && (
                              <DesktopPeriodSection
                                title="AFTERNOON"
                                icon={<Sun className="h-4 w-4 text-court-300" />}
                                courts={courts}
                                timeIntervals={afternoonTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                                getOpenPlaySession={getOpenPlaySessionForSlot}
                                onOpenPlayClick={handleOpenPlayClick}
                              />
                            )}
                            {eveningTimes.length > 0 && (
                              <DesktopPeriodSection
                                title="EVENING"
                                icon={<Moon className="h-4 w-4 text-court-300" />}
                                courts={courts}
                                timeIntervals={eveningTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                                getOpenPlaySession={getOpenPlaySessionForSlot}
                                onOpenPlayClick={handleOpenPlayClick}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop reservation bar */}
                  <div className="mt-8 hidden items-center justify-between gap-4 rounded-xl border border-forest-600 bg-forest-800/90 p-5 sm:flex">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-court-300">
                        Selected Slots
                      </span>
                      <div className="text-lg font-bold text-cream">
                        {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} chosen
                        {selectedSlotIds.length > 0 && (
                          <span className="ml-2 text-base font-semibold text-court-200">
                            ({formatCurrency(totalSelected)})
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="md"
                      onClick={() => navigate('/booking')}
                      disabled={selectedSlotIds.length === 0}
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      Proceed to Reservation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky Mobile Reservation Bar */}
      {selectedSlotIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-600 bg-charcoal/95 p-3.5 backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-cream-muted">
                {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} chosen
              </p>
              <p className="text-lg font-bold text-court-300">{formatCurrency(totalSelected)}</p>
            </div>
            <Button
              size="md"
              onClick={() => navigate('/booking')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shrink-0"
            >
              Proceed
            </Button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="border-b border-forest-700/80 bg-forest-900/60 py-14 sm:py-20">
        <div className="container-page">
          <div className="mb-10 text-center sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-court-300">
              Why CenterCourt
            </span>
            <h2 className="section-title mt-2">Built for Players</h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {[
              {
                icon: CalendarPlus,
                title: 'Instant Booking',
                desc: 'Select your court, date, and time slots in under a minute. No phone calls, no waiting.',
              },
              {
                icon: Wallet,
                title: 'GCash Payment',
                desc: 'Pay securely with GCash. Upload your receipt and get confirmed in minutes.',
              },
              {
                icon: ShieldCheck,
                title: 'Admin Verified',
                desc: 'Every booking is reviewed and confirmed by our team. You always get your court.',
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card rounded-2xl border border-forest-700/70 bg-forest-800/80 p-5 shadow-lg backdrop-blur-sm sm:p-6 hover:border-forest-600 transition"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-court-400/30 bg-court-600/30 shadow-inner">
                    <Icon className="h-6 w-6 text-court-300" />
                  </div>

                  <h3 className="text-base font-bold text-cream sm:text-lg">{feat.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-cream-muted sm:text-sm">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 sm:py-20 bg-forest-950/40">
        <div className="container-page">
          <div className="mb-10 text-center sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-court-300">
              Simple Process
            </span>
            <h2 className="section-title mt-2">How It Works</h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-4">
            {[
              { step: '01', title: 'Select Court & Time', desc: 'Pick your preferred court, date, and available time slots.' },
              { step: '02', title: 'Enter Details', desc: 'Fill in your name, contact info, and any special requests.' },
              { step: '03', title: 'Pay via GCash', desc: 'Send payment to our GCash number and upload your screenshot.' },
              { step: '04', title: 'Get Confirmed', desc: 'We verify your payment and confirm your booking. Play!' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="mb-3 font-display text-4xl font-extrabold tracking-tight text-court-400/40 sm:mb-4 sm:text-5xl">
                  {item.step}
                </div>

                <h3 className="text-base font-bold text-cream sm:text-lg">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-cream-muted sm:text-sm">{item.desc}</p>

                {i < 3 && (
                  <div className="mt-6 hidden h-px bg-gradient-to-r from-court-400/40 via-court-400/10 to-transparent md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-20 sm:hidden" />
      <Footer />
    </div>
  );
}

// --------------------------------------------------------
// SUB-COMPONENTS
// --------------------------------------------------------

function DesktopPeriodSection({
  title,
  icon,
  courts,
  timeIntervals,
  getSlotForCourtAndTime,
  selectedSlotIds,
  onToggleSlot,
  getOpenPlaySession,
  onOpenPlayClick,
}: {
  title: string;
  icon: React.ReactNode;
  courts: Court[];
  timeIntervals: { start_time: string; end_time: string }[];
  getSlotForCourtAndTime: (courtId: string, startTime: string, endTime: string) => TimeSlot | undefined;
  selectedSlotIds: string[];
  onToggleSlot: (slotId: string) => void;
  getOpenPlaySession?: (courtId: string, startTime: string, endTime: string) => OpenPlaySession | undefined;
  onOpenPlayClick?: (session: OpenPlaySession) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-4">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-court-300">
          {title}
        </span>
        <div className="h-px flex-1 bg-forest-700/80" />
      </div>

      <div className="space-y-2.5">
        {timeIntervals.map((interval) => (
          <div
            key={`${interval.start_time}-${interval.end_time}`}
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: `repeat(${courts.length}, minmax(80px, 1fr))`,
            }}
          >
            {courts.map((court, idx) => {
              const slot = getSlotForCourtAndTime(court.id, interval.start_time, interval.end_time);
              const accent = getCourtAccent(idx);
              const openPlaySession = getOpenPlaySession?.(court.id, interval.start_time, interval.end_time);

              if (!slot) {
                return (
                  <div
                    key={`${court.id}-${interval.start_time}`}
                    className="flex h-11 select-none items-center justify-center rounded-xl border border-forest-800/60 bg-forest-950/60 text-xs text-forest-700"
                  >
                    —
                  </div>
                );
              }

              if (openPlaySession) {
                return (
                  <div key={slot.id}>
                    <OpenPlayPill
                      session={openPlaySession}
                      onClick={() => onOpenPlayClick?.(openPlaySession)}
                      accent={accent}
                    />
                  </div>
                );
              }

              return (
                <div key={slot.id}>
                  <SlotPill
                    slot={slot}
                    isSelected={selectedSlotIds.includes(slot.id)}
                    onToggle={() => onToggleSlot(slot.id)}
                    accent={accent}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenPlayPill({
  session,
  onClick,
  accent: _accent,
}: {
  session: OpenPlaySession;
  onClick: () => void;
  accent: CourtAccent;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-11 w-full items-center justify-between rounded-xl border-2 border-court-400 bg-court-600/30 px-3 font-bold transition-all hover:bg-court-600/50 hover:shadow-[0_0_20px_-4px_rgba(59,120,181,0.6)]"
      title={`Open Play: ${session.current_players}/${session.max_players} players · ${session.skill_level}`}
    >
      <span className="text-xs font-black text-court-300">OP</span>
      <span className="text-xs font-semibold text-court-100">
        {session.current_players}/{session.max_players} joined
      </span>

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-forest-500 bg-forest-900 px-3 py-2 text-xs text-cream shadow-xl group-hover:block">
        <p className="font-semibold text-court-300">Open Play Session</p>
        <p className="text-[11px] text-cream-muted">
          {session.current_players}/{session.max_players} players · {session.skill_level}
        </p>
        {session.host_name && (
          <p className="text-[11px] text-cream-muted">Host: {session.host_name}</p>
        )}
        <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-b border-r border-forest-500 bg-forest-900" />
      </div>
    </button>
  );
}

function SlotPill({
  slot,
  isSelected,
  onToggle,
  accent,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: () => void;
  accent: CourtAccent;
}) {
  const isAvailable = slot.is_available;
  const isPending = (slot as unknown as { is_pending?: boolean }).is_pending;

  let styleClasses = `${accent.border} ${accent.bg} ${accent.text} ${accent.hoverBorder} ${accent.hoverBg} cursor-pointer`;

  if (!isAvailable) {
    styleClasses = 'border-red-500/30 bg-red-500/10 text-red-400/75 line-through cursor-not-allowed';
  } else if (isPending) {
    styleClasses = 'border-amber-500/30 bg-amber-500/10 text-amber-300/80 cursor-not-allowed';
  } else if (isSelected) {
    styleClasses = 'border-court-300 bg-court-500 text-white font-bold shadow-glow-court';
  }

  return (
    <button
      onClick={isAvailable && !isPending ? onToggle : undefined}
      disabled={!isAvailable || isPending}
      className={`flex h-11 w-full items-center justify-center rounded-xl border text-[11px] font-semibold tracking-tight transition-all px-1 ${styleClasses}`}
    >
      <span className="truncate">
        {formatTimeRangeShort(slot.start_time, slot.end_time)}
      </span>
    </button>
  );
}