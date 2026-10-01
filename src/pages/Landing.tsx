import { useEffect, useMemo, useState, useRef } from 'react';
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
  AlertTriangle,
  Hourglass,
  Layers,
  X,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useBookingStore } from '@/stores/bookingStore';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { APP_CONFIG } from '@/utils/constants';
import {
  formatCurrency,
  todayISO,
  formatDateLong,
  toISODate,
  addDays,
} from '@/utils/format';
import type { TimeSlot, Court, OpenPlaySession } from '@/types';

// Court palette column accents (Infield Blue & Outfield Green)
const COURT_ACCENTS = [
  { header: 'text-court-200', dot: 'bg-court-400', border: 'border-court-500/40', bg: 'bg-court-600/20', text: 'text-court-100', hoverBorder: 'hover:border-court-300', hoverBg: 'hover:bg-court-600/35' },
  { header: 'text-forest-200', dot: 'bg-forest-400', border: 'border-forest-500/40', bg: 'bg-forest-600/20', text: 'text-forest-100', hoverBorder: 'hover:border-forest-300', hoverBg: 'hover:bg-forest-600/35' },
  { header: 'text-court-300', dot: 'bg-court-300', border: 'border-court-400/40', bg: 'bg-court-500/20', text: 'text-court-50', hoverBorder: 'hover:border-court-200', hoverBg: 'hover:bg-court-500/35' },
  { header: 'text-forest-300', dot: 'bg-forest-300', border: 'border-forest-400/40', bg: 'bg-forest-700/30', text: 'text-forest-100', hoverBorder: 'hover:border-forest-200', hoverBg: 'hover:bg-forest-700/45' },
];

function getCourtAccent(index: number) {
  return COURT_ACCENTS[index % COURT_ACCENTS.length];
}

type CourtAccent = ReturnType<typeof getCourtAccent>;

// TODO: replace with your real hold window once you confirm it with the owner.
const PENDING_HINT =
  'Pending: another player reserved this and we are verifying their payment. It may reopen if payment is not confirmed, so check back later.';

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('San Agustin Sur Dawis, Tandag City');

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

function formatPriceShort(price: number): string {
  return `₱${Math.round(price).toLocaleString('en-PH')}`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
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
    // Parse as local midnight (not UTC) so the day never shifts with timezone.
    const sessionDate = new Date(`${session.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return sessionDate >= today && sessionDate <= weekFromNow;
  } catch {
    return false;
  }
}

/**
 * Number of 7-day windows between today and the target date.
 * The day strip starts on TODAY (not on Sunday), so this uses the same anchor.
 */
function weeksBetweenToday(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function isSessionFull(s: OpenPlaySession): boolean {
  return s.status === 'full' || s.current_players >= s.max_players;
}

const SKILL_BADGE: Record<string, string> = {
  Beginner: 'bg-forest-500/25 text-forest-200 border border-forest-400/30',
  Intermediate: 'bg-court-600/30 text-court-200 border border-court-400/40',
  Advanced: 'bg-accent/20 text-accent-light border border-accent/40',
  'All Levels': 'bg-court-500/25 text-court-100 border border-court-400/30',
};

type SelectedSlotInfo = { slot: TimeSlot; courtName: string };

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
  const [activeCourtId, setActiveCourtId] = useState<string | null>(null);

  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const monthLabel = (() => {
    const first = weekDays[0];
    const last = weekDays[6];
    const m1 = first.toLocaleDateString('en-US', { month: 'short' });
    const m2 = last.toLocaleDateString('en-US', { month: 'short' });
    const y1 = first.getFullYear();
    const y2 = last.getFullYear();
    if (y1 !== y2) return `${m1} ${y1} – ${m2} ${y2}`;
    return m1 === m2 ? `${m1} ${y1}` : `${m1} – ${m2} ${y1}`;
  })();

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

  // Default the mobile court tab to the first court once courts load.
  useEffect(() => {
    if (courts.length > 0 && !courts.some((c) => c.id === activeCourtId)) {
      setActiveCourtId(courts[0].id);
    }
  }, [courts, activeCourtId]);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCalendarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    if (!iso) return;

    setDate(iso);
    setWeekOffset(Math.max(0, weeksBetweenToday(iso)));
  };

  const retry = () => {
    if (courts.length === 0) loadCourts();
    else loadAllCourtsSlots();
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

  /** A slot is "passed" when its start time is already behind us today. */
  const isSlotPassed = (slot: TimeSlot): boolean => {
    if (selectedDate !== todayISO()) return false;
    const now = new Date();
    return timeToMinutes(slot.start_time) <= now.getHours() * 60 + now.getMinutes();
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

  const periods = [
    { title: 'Morning', icon: <CloudSun className="h-4 w-4 text-court-300" />, times: morningTimes },
    { title: 'Afternoon', icon: <Sun className="h-4 w-4 text-court-300" />, times: afternoonTimes },
    { title: 'Evening', icon: <Moon className="h-4 w-4 text-court-300" />, times: eveningTimes },
  ].filter((p) => p.times.length > 0);

  const getSlotForCourtAndTime = (courtId: string, startTime: string, endTime: string) => {
    return slots.find(
      (s) =>
        s.court_id === courtId &&
        s.start_time === startTime &&
        s.end_time === endTime
    );
  };

  // Selection summary (only slots for the date currently loaded can be described)
  const selectedSlots: SelectedSlotInfo[] = useMemo(() => {
    const courtIndex = new Map(courts.map((c, i) => [c.id, i]));
    return slots
      .filter((s) => selectedSlotIds.includes(s.id))
      .map((slot) => ({
        slot,
        courtName: courts.find((c) => c.id === slot.court_id)?.name ?? 'Court',
      }))
      .sort((a, b) => {
        const ca = courtIndex.get(a.slot.court_id) ?? 0;
        const cb = courtIndex.get(b.slot.court_id) ?? 0;
        return ca - cb || a.slot.start_time.localeCompare(b.slot.start_time);
      });
  }, [slots, selectedSlotIds, courts]);

  const hiddenSelectedCount = selectedSlotIds.length - selectedSlots.length;
  const totalSelected = selectedSlots.reduce((sum, { slot }) => sum + slot.price, 0);

  const removeSlot = (slotId: string) => toggleSlot(slotId);
  const clearSelection = () => {
    // toggleSlot removes an already-selected id, so this clears hidden (other-date) ones too.
    [...selectedSlotIds].forEach((id) => toggleSlot(id));
  };

  const selectedCountForCourt = (courtId: string) =>
    selectedSlots.filter((s) => s.slot.court_id === courtId).length;

  const activeCourt = courts.find((c) => c.id === activeCourtId) ?? courts[0];
  const activeCourtIndex = activeCourt ? courts.findIndex((c) => c.id === activeCourt.id) : 0;

  const slotsLoading = loadingSlots || loadingCourts || loadingOpenPlay;

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-start pt-28 sm:min-h-screen sm:items-center sm:pt-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/bg3.jpg"
            alt="Center Court"
            className="h-full w-full object-cover object-right md:object-[75%_center]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/95 sm:via-forest-950/85 to-forest-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-grid opacity-20" />
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
                className="mb-4 flex w-full items-center gap-2 rounded-full border border-court-400/40 bg-court-600/35 px-3 py-2 backdrop-blur-md transition hover:border-court-300 hover:bg-court-600/50 sm:mb-5 sm:w-auto sm:px-4 shadow-sm"
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
              <span className="text-cream">Center</span>{' '}
              <span className="text-court-300">Court</span>
            </h1>

            <p className="mt-3 text-xl font-medium text-cream-dark sm:mt-4 sm:text-3xl">
              {APP_CONFIG.tagline}
            </p>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream-muted sm:mt-6 sm:text-lg">
              3 premium pickleball courts in the city. Beginner-friendly, tournament-ready, and made for everyone who loves the game.
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
                Already booked? Track it
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-cream-muted sm:mt-10 sm:gap-6 sm:text-sm">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 underline-offset-4 transition hover:text-cream hover:underline"
              >
                <MapPin className="h-4 w-4 text-court-300" />
                <span>San Agustin Sur Dawis, Tandag City</span>
              </a>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-court-300" />
                <span>Open 5AM to 12 midnight</span>
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
                  Pay per player and play with others. No need to book a full court. Spots fill fast.
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
                const isFull = isSessionFull(session);
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
                                className="rounded border border-forest-600 bg-forest-800 px-1.5 py-0.5 text-[11px] text-cream-muted"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-forest-600 pt-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-cream-muted">Per player</p>
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-cream sm:text-2xl md:text-3xl">
                      Book a <span className="text-court-300">Court</span>
                    </h2>
                    <p className="mt-0.5 text-xs text-cream-muted sm:text-sm">
                      Pick a date, then tap one or more time slots. Slots can be on different courts or times.
                    </p>
                    <p className="mt-1 text-xs text-cream-muted">
                      * Prices are shown on each slot and may change without prior notice.
                    </p>
                  </div>
                  <div className="hidden rounded-xl border border-court-500/40 bg-court-600/20 p-2.5 text-court-300 sm:block md:p-3">
                    <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>

                {/* No Cancellation Policy Card */}
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-900/50 bg-rose-950/25 p-3.5 sm:gap-4 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-800/40 bg-rose-900/40 text-rose-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black tracking-widest text-rose-400 uppercase sm:text-sm">
                      No Cancellation Policy
                    </h4>
                    <p className="text-xs leading-relaxed text-cream-muted sm:text-sm">
                      Once confirmed, no cancellations or refunds. Can&apos;t make it? Find someone to take your slot and settle payment directly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-8">
                {/* STEP 1: Date Selection */}
                <div className="mb-6 md:mb-10">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-court-400/50 bg-court-600 text-xs font-bold text-white shadow-sm">
                        1
                      </div>
                      <h3 className="text-sm font-bold text-cream sm:text-base">
                        Choose <span className="text-court-200">Date</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden text-xs font-semibold text-cream-muted sm:inline">
                        {monthLabel}
                      </span>
                      {/* Calendar picker: the invisible native input covers the whole button */}
                      <div className="relative flex h-9 items-center justify-center gap-1.5 rounded-lg border border-court-400/50 bg-court-600/30 px-2.5 text-court-200 transition hover:border-court-300 hover:bg-court-600/50 active:scale-95">
                        <CalendarDays className="pointer-events-none h-4 w-4" />
                        <span className="pointer-events-none hidden text-xs font-semibold sm:inline">
                          Calendar
                        </span>
                        <input
                          type="date"
                          value={selectedDate}
                          min={todayISO()}
                          onChange={handleCalendarPick}
                          aria-label="Pick a date from calendar"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile: month label + week arrows sit right above the strip they control */}
                  <div className="mb-2 flex items-center justify-between sm:hidden">
                    <span className="text-xs font-semibold text-cream-muted">{monthLabel}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                        disabled={weekOffset === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-court-400/60 hover:text-court-200 disabled:opacity-30 active:scale-95"
                        aria-label="Previous week"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setWeekOffset((w) => w + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-court-400/60 hover:text-court-200 active:scale-95"
                        aria-label="Next week"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
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
                            (s) =>
                              s.date === iso &&
                              s.is_active &&
                              s.status !== 'cancelled' &&
                              s.status !== 'past' &&
                              !isSessionFull(s)
                          );

                          return (
                            <button
                              key={iso}
                              onClick={() => setDate(iso)}
                              aria-pressed={isSelected}
                              aria-label={`${formatDateLong(iso)}${hasOpenPlay ? ', open play available' : ''}`}
                              className={`relative flex min-w-[54px] flex-1 snap-center flex-col items-center justify-center rounded-xl border py-2 transition-all ${
                                isSelected
                                  ? 'border-court-400 bg-court-600 text-white font-bold shadow-glow-court'
                                  : 'border-forest-700/80 bg-forest-800/90 text-cream-muted hover:border-court-400/50 hover:text-cream'
                              }`}
                            >
                              {isToday && (
                                <span
                                  className={`absolute -top-2 rounded-full px-1.5 py-[1px] text-[9px] font-black tracking-wider ${
                                    isSelected
                                      ? 'bg-forest-950 text-court-300'
                                      : 'bg-court-500 text-white'
                                  }`}
                                >
                                  TODAY
                                </span>
                              )}

                              <span
                                className={`text-[11px] font-semibold tracking-tight ${
                                  isSelected ? 'text-white' : 'text-cream-muted'
                                }`}
                              >
                                {dayName}
                              </span>

                              <span className="text-base font-extrabold leading-tight text-cream">
                                {dayNumber}
                              </span>

                              <span
                                className={`text-[10px] uppercase font-medium ${
                                  isSelected ? 'text-court-200' : 'text-cream-muted'
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

                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-cream-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-court-300" />
                    A dot under a day means an Open Play session with spots left.
                  </p>
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

                  {/* Legend: swatches match the real slot styles */}
                  <div className="mb-4 space-y-2 border-b border-forest-700/60 pb-3 text-xs text-cream-muted">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <LegendItem swatch="border-court-500/40 bg-court-600/20" label="Available" />
                      <LegendItem swatch="border-court-300 bg-court-600" label="Selected" />
                      <LegendItem
                        swatch="border-amber-500/40 bg-amber-500/10"
                        label="Pending"
                        icon={<Hourglass className="h-2.5 w-2.5 text-amber-300" />}
                      />
                      <LegendItem swatch="border-red-500/30 bg-red-500/10" label="Booked" />
                      <LegendItem
                        swatch="border-court-400 bg-court-600/35"
                        label="Open Play"
                        icon={<Users className="h-2.5 w-2.5 text-court-300" />}
                      />
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <strong className="font-semibold text-cream">Pending</strong> means someone is paying for it. It may reopen.{' '}
                      <strong className="font-semibold text-cream">Open Play</strong> is a shared group session. Tap it to join for a per-player fee. To book privately, pick another slot.
                    </p>
                  </div>

                  {slotsLoading ? (
                    <SlotsSkeleton columns={Math.max(courts.length, 3)} />
                  ) : error ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center md:py-16">
                      <p className="max-w-sm text-sm font-medium text-red-400">
                        Couldn&apos;t load available slots. {error}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={retry}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : courts.length === 0 ? (
                    <div className="py-8 text-center text-sm font-medium text-cream-muted md:py-16">
                      No courts are available right now. Please check back soon.
                    </div>
                  ) : periods.length === 0 ? (
                    <div className="py-8 text-center text-sm font-medium text-cream-muted md:py-16">
                      No time slots for this date. Try another day.
                    </div>
                  ) : (
                    <>
                      {/* MOBILE: pick a court, then a simple vertical list of times */}
                      <div className="sm:hidden">
                        <div
                          role="tablist"
                          aria-label="Courts"
                          className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1"
                        >
                          {courts.map((court, idx) => {
                            const accent = getCourtAccent(idx);
                            const isActive = court.id === activeCourt?.id;
                            const count = selectedCountForCourt(court.id);
                            return (
                              <button
                                key={court.id}
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveCourtId(court.id)}
                                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                                  isActive
                                    ? 'border-court-300 bg-court-600 text-white'
                                    : 'border-forest-600 bg-forest-800 text-cream-muted'
                                }`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                                {court.name}
                                {count > 0 && (
                                  <span className="rounded-full bg-white px-1.5 text-[11px] font-black text-court-600">
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {activeCourt && (
                          <div className="space-y-5">
                            {periods.map((period) => {
                              const items = period.times.filter((t) =>
                                getSlotForCourtAndTime(activeCourt.id, t.start_time, t.end_time)
                              );
                              if (items.length === 0) return null;
                              return (
                                <div key={period.title}>
                                  <PeriodHeading title={period.title} icon={period.icon} />
                                  <div className="grid grid-cols-2 gap-2.5">
                                    {items.map((t) => {
                                      const slot = getSlotForCourtAndTime(
                                        activeCourt.id,
                                        t.start_time,
                                        t.end_time
                                      )!;
                                      const op = getOpenPlaySessionForSlot(
                                        activeCourt.id,
                                        t.start_time,
                                        t.end_time
                                      );
                                      return op ? (
                                        <div key={slot.id} className="col-span-2">
                                          <OpenPlayPill
                                            session={op}
                                            timeLabel={formatTimeRangeShort(t.start_time, t.end_time)}
                                            onClick={() => handleOpenPlayClick(op)}
                                          />
                                        </div>
                                      ) : (
                                        <SlotPill
                                          key={slot.id}
                                          slot={slot}
                                          passed={isSlotPassed(slot)}
                                          isSelected={selectedSlotIds.includes(slot.id)}
                                          onToggle={() => toggleSlot(slot.id)}
                                          accent={getCourtAccent(activeCourtIndex)}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* DESKTOP: courts side by side, page scroll only (no nested vertical scroller) */}
                      <div className="hidden overflow-x-auto rounded-2xl border border-forest-700/60 bg-forest-950/40 sm:block">
                        <div className="space-y-6 p-4">
                          {periods.map((period) => (
                            <DesktopPeriodSection
                              key={period.title}
                              title={period.title}
                              icon={period.icon}
                              courts={courts}
                              timeIntervals={period.times}
                              getSlotForCourtAndTime={getSlotForCourtAndTime}
                              selectedSlotIds={selectedSlotIds}
                              onToggleSlot={toggleSlot}
                              getOpenPlaySession={getOpenPlaySessionForSlot}
                              onOpenPlayClick={handleOpenPlayClick}
                              isSlotPassed={isSlotPassed}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Desktop reservation bar */}
                  <div className="mt-8 hidden rounded-xl border border-forest-600 bg-forest-800/90 p-5 sm:block">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-court-300">
                        Your selection
                      </span>
                      {selectedSlotIds.length > 0 && (
                        <button
                          onClick={clearSelection}
                          className="text-xs font-semibold text-cream-muted underline-offset-4 transition hover:text-cream hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <SelectionChips
                      items={selectedSlots}
                      hiddenCount={hiddenSelectedCount}
                      onRemove={removeSlot}
                    />

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold text-cream">
                          {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'}
                          {selectedSlotIds.length > 0 && (
                            <span className="ml-2 text-base font-semibold text-court-200">
                              {formatCurrency(totalSelected)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cream-muted">
                          {selectedSlotIds.length === 0
                            ? 'Select at least one slot to continue.'
                            : 'No cancellations or refunds once confirmed.'}
                        </p>
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
          </div>
        </section>
      </div>

      {/* Sticky Mobile Reservation Bar */}
      {selectedSlotIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-600 bg-charcoal/95 p-3.5 backdrop-blur-md sm:hidden">
          <div className="mb-2.5 flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <SelectionChips
                items={selectedSlots}
                hiddenCount={hiddenSelectedCount}
                onRemove={removeSlot}
                scrollable
              />
            </div>
            <button
              onClick={clearSelection}
              className="shrink-0 pt-1.5 text-xs font-semibold text-cream-muted underline underline-offset-4"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-cream-muted">
                {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} · no refunds once confirmed
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

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[
              {
                icon: CalendarPlus,
                title: 'Instant Booking',
                desc: 'Select your court, date, and time slots in under a minute. No phone calls, no waiting.',
              },
              {
                icon: Wallet,
                title: 'Flexible Payment',
                desc: 'Pay securely using your chosen payment method. Upload your receipt and get confirmed in minutes.',
              },
              {
                icon: ShieldCheck,
                title: 'Admin Verified',
                desc: 'Every booking is reviewed by our team. Once your payment is verified, your court is secured.',
              },
              {
                icon: Layers,
                title: '7-Layer Court Surface',
                desc: 'A surface system built for comfort and consistent bounce, a playing experience you can actually feel.',
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
              { step: '03', title: 'Pay Your Way', desc: 'Send payment using your chosen payment method and upload your screenshot.' },
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

      <div className="h-32 sm:hidden" />
      <Footer />
    </div>
  );
}

// --------------------------------------------------------
// SUB-COMPONENTS
// --------------------------------------------------------

function LegendItem({
  swatch,
  label,
  icon,
}: {
  swatch: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`flex h-4 w-6 items-center justify-center rounded border ${swatch}`}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function PeriodHeading({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-4 w-4">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-court-300">{title}</span>
      <div className="h-px flex-1 bg-forest-700/80" />
    </div>
  );
}

function SlotsSkeleton({ columns }: { columns: number }) {
  return (
    <div
      className="grid animate-pulse gap-2.5"
      aria-busy="true"
      aria-label="Loading time slots"
    >
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${Math.min(columns, 2)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl border border-forest-700/60 bg-forest-800/60" />
        ))}
      </div>
    </div>
  );
}

function SelectionChips({
  items,
  hiddenCount,
  onRemove,
  scrollable = false,
}: {
  items: SelectedSlotInfo[];
  hiddenCount: number;
  onRemove: (slotId: string) => void;
  scrollable?: boolean;
}) {
  if (items.length === 0 && hiddenCount === 0) return null;

  return (
    <div className="mt-2">
      <div
        className={
          scrollable
            ? 'no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5'
            : 'flex flex-wrap gap-1.5'
        }
      >
        {items.map(({ slot, courtName }) => (
          <span
            key={slot.id}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-court-400/40 bg-court-600/30 py-1 pl-2.5 pr-1 text-xs font-semibold text-court-100"
          >
            {courtName} · {formatTimeRangeShort(slot.start_time, slot.end_time)}
            <button
              onClick={() => onRemove(slot.id)}
              aria-label={`Remove ${courtName} ${formatTimeRangeShort(slot.start_time, slot.end_time)}`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-court-200 transition hover:bg-court-500/40 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      {hiddenCount > 0 && (
        <p className="mt-1.5 text-[11px] text-amber-300">
          + {hiddenCount} slot{hiddenCount === 1 ? '' : 's'} from another date (not shown or counted in the total above). Use Clear to remove.
        </p>
      )}
    </div>
  );
}

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
  isSlotPassed,
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
  isSlotPassed: (slot: TimeSlot) => boolean;
}) {
  const gridStyle = { gridTemplateColumns: `repeat(${courts.length}, minmax(92px, 1fr))` };

  return (
    <div style={{ minWidth: courts.length * 100 }}>
      <PeriodHeading title={title} icon={icon} />

      {/* Court names are repeated for every period so they are never out of sight */}
      <div className="mb-2 grid gap-2.5 text-center text-xs font-bold" style={gridStyle}>
        {courts.map((court, idx) => {
          const accent = getCourtAccent(idx);
          return (
            <div
              key={court.id}
              className={`flex items-center justify-center gap-2 truncate ${accent.header}`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${accent.dot}`} />
              <span className="truncate">{court.name}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {timeIntervals.map((interval) => (
          <div
            key={`${interval.start_time}-${interval.end_time}`}
            className="grid gap-2.5"
            style={gridStyle}
          >
            {courts.map((court, idx) => {
              const slot = getSlotForCourtAndTime(court.id, interval.start_time, interval.end_time);
              const accent = getCourtAccent(idx);
              const openPlaySession = getOpenPlaySession?.(court.id, interval.start_time, interval.end_time);

              if (!slot) {
                return (
                  <div
                    key={`${court.id}-${interval.start_time}`}
                    title="This court has no slot at this time"
                    className="flex h-14 select-none items-center justify-center rounded-xl border border-dashed border-forest-700/60 text-[11px] text-forest-600"
                  >
                    N/A
                  </div>
                );
              }

              if (openPlaySession) {
                return (
                  <div key={slot.id}>
                    <OpenPlayPill
                      session={openPlaySession}
                      timeLabel={formatTimeRangeShort(interval.start_time, interval.end_time)}
                      onClick={() => onOpenPlayClick?.(openPlaySession)}
                    />
                  </div>
                );
              }

              return (
                <div key={slot.id}>
                  <SlotPill
                    slot={slot}
                    passed={isSlotPassed(slot)}
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
  timeLabel,
  onClick,
}: {
  session: OpenPlaySession;
  timeLabel: string;
  onClick: () => void;
}) {
  const full = isSessionFull(session);
  return (
    <button
      onClick={onClick}
      className="group relative flex h-14 w-full flex-col items-center justify-center rounded-xl border-2 border-court-400 bg-court-600/35 px-2 transition-all hover:bg-court-600/55 hover:shadow-[0_0_20px_-4px_rgba(61,114,168,0.6)]"
      aria-label={`Open Play ${timeLabel}, ${session.current_players} of ${session.max_players} joined. Opens the Open Play page.`}
      title="Shared group session. Tap to view and join. This time can't be booked privately."
    >
      <span className="flex items-center gap-1 text-[11px] font-black text-court-300">
        <Users className="h-3 w-3" />
        Open Play · {timeLabel}
      </span>
      <span className="text-xs font-semibold text-court-100">
        {full ? 'Full' : `${session.current_players}/${session.max_players} joined`}
      </span>
    </button>
  );
}

function SlotPill({
  slot,
  passed,
  isSelected,
  onToggle,
  accent,
}: {
  slot: TimeSlot;
  passed: boolean;
  isSelected: boolean;
  onToggle: () => void;
  accent: CourtAccent;
}) {
  const isPending = (slot as unknown as { is_pending?: boolean }).is_pending === true;
  const isBooked = !slot.is_available && !isPending;
  const range = formatTimeRangeShort(slot.start_time, slot.end_time);

  let styleClasses = `${accent.border} ${accent.bg} ${accent.text} ${accent.hoverBorder} ${accent.hoverBg} cursor-pointer`;
  let subLabel: React.ReactNode = formatPriceShort(slot.price);
  let title: string | undefined;
  let disabled = false;

  if (passed) {
    styleClasses = 'border-forest-700/50 bg-forest-950/50 text-forest-500 cursor-not-allowed';
    subLabel = 'Passed';
    title = 'This time has already passed';
    disabled = true;
  } else if (isPending) {
    styleClasses = 'border-amber-500/40 bg-amber-500/10 text-amber-300 cursor-not-allowed';
    subLabel = (
      <span className="inline-flex items-center gap-1">
        <Hourglass className="h-3 w-3" />
        Pending
      </span>
    );
    title = PENDING_HINT;
    disabled = true;
  } else if (isBooked) {
    styleClasses = 'border-red-500/30 bg-red-500/10 text-red-300/80 cursor-not-allowed';
    subLabel = 'Booked';
    title = 'Already booked';
    disabled = true;
  } else if (isSelected) {
    styleClasses = 'border-court-300 bg-court-600 text-white font-bold shadow-glow-court';
  }

  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={disabled ? undefined : isSelected}
      aria-label={`${range}, ${
        passed ? 'passed' : isPending ? 'pending, not available' : isBooked ? 'booked' : `${formatPriceShort(slot.price)}${isSelected ? ', selected' : ''}`
      }`}
      title={title}
      className={`flex h-14 w-full flex-col items-center justify-center rounded-xl border px-1 transition-all ${styleClasses}`}
    >
      <span className={`text-xs font-semibold tracking-tight ${isBooked ? 'line-through' : ''}`}>
        {range}
      </span>
      <span className="text-[11px] font-medium opacity-90">{subLabel}</span>
    </button>
  );
}