import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarPlus,
  Wallet,
  ShieldCheck,
  Clock,
  ArrowRight,
  Star,
  MapPin,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  Check,
  X,
  Clock3,
  ChevronDown,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore } from '@/stores/bookingStore';
import { COURT_IMAGES, APP_CONFIG } from '@/utils/constants';
import {
  formatTimeRange,
  formatCurrency,
  todayISO,
  formatDateLong,
  toISODate,
  addDays,
} from '@/utils/format';
import type { TimeSlot, Court } from '@/types';

export function Landing() {
  const navigate = useNavigate();
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
    selectCourt,
    selectedCourt,
  } = useBookingStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // For mobile: track which court is selected
  const [activeCourtId, setActiveCourtId] = useState<string | null>(null);

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
  }, [courts.length, loadCourts]);

  useEffect(() => {
    if (courts.length > 0) {
      loadAllCourtsSlots();
      if (!activeCourtId && courts.length > 0) {
        setActiveCourtId(courts[0].id);
      }
    }
  }, [selectedDate, courts.length, loadAllCourtsSlots]);

  // Get slots for the active court (mobile view)
  const getSlotsForCourt = (courtId: string) => {
    return slots.filter((s) => s.court_id === courtId);
  };

  // ✅ Helper to find slot for a specific court and time range (for desktop grid)
  const getSlotForCourtAndTime = (courtId: string, startTime: string, endTime: string) => {
    return slots.find(
      (s) =>
        s.court_id === courtId &&
        s.start_time === startTime &&
        s.end_time === endTime
    );
  };

  // Group slots by period for a specific court
  const groupSlotsByPeriod = (courtSlots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    courtSlots.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  };

  // Get active court's slots
  const activeCourtSlots = activeCourtId ? getSlotsForCourt(activeCourtId) : [];
  const { morning, afternoon, evening } = groupSlotsByPeriod(activeCourtSlots);

  // Extract time intervals for the active court
  const getTimeIntervals = (courtSlots: TimeSlot[]) => {
    const morningMap = new Map<string, { start_time: string; end_time: string }>();
    const afternoonMap = new Map<string, { start_time: string; end_time: string }>();
    const eveningMap = new Map<string, { start_time: string; end_time: string }>();

    courtSlots.forEach((slot) => {
      const hour = parseInt(slot.start_time.split(':')[0], 10);
      const key = `${slot.start_time}-${slot.end_time}`;
      const timeObj = { start_time: slot.start_time, end_time: slot.end_time };

      if (hour < 12) morningMap.set(key, timeObj);
      else if (hour < 17) afternoonMap.set(key, timeObj);
      else eveningMap.set(key, timeObj);
    });

    const sortFn = (a: { start_time: string }, b: { start_time: string }) =>
      a.start_time.localeCompare(b.start_time);

    return {
      morningTimes: Array.from(morningMap.values()).sort(sortFn),
      afternoonTimes: Array.from(afternoonMap.values()).sort(sortFn),
      eveningTimes: Array.from(eveningMap.values()).sort(sortFn),
    };
  };

  const { morningTimes, afternoonTimes, eveningTimes } = getTimeIntervals(activeCourtSlots);

  const totalSelected = slots
    .filter((s) => selectedSlotIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const activeCourt = courts.find((c) => c.id === activeCourtId);

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={COURT_IMAGES.hero}
            alt="Pickleball court"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/90 to-forest-950/40" />
          <div className="absolute inset-0 bg-grid opacity-25" />
        </div>

        <div className="container-page relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium text-gold-300">
                Premium Pickleball Courts in the City
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-cream sm:text-6xl lg:text-7xl">
              Center<span className="text-gold-400">Court</span>
            </h1>
            <p className="mt-4 font-display text-2xl font-medium text-cream-dark sm:text-3xl">
              {APP_CONFIG.tagline}
            </p>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream-muted">
              Book premium indoor and outdoor pickleball courts in seconds. Pay easily with GCash,
              track your bookings, and get playing.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" to="/booking" leftIcon={<CalendarPlus className="h-5 w-5" />}>
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

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-cream-muted">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <span>Loved by 500+ players</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-400" />
                <span>San Agustin Sur Dawis, Tandag City</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold-400" />
                <span>Open 5AM - 12AM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Multi-Court Booking Section - Responsive */}
      <section className="relative z-20 border-y border-forest-500 bg-forest-950 py-16">
        <div className="container-page max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-forest-600/60 bg-forest-900 shadow-2xl">
            
            {/* Header Banner */}
            <div className="border-b border-forest-700 bg-forest-950 px-6 py-7 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                    Book a Court
                  </h2>
                  <p className="mt-1 text-sm text-cream-muted">
                    Pick a date, then tap any number of time slots — they all go into one reservation.
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-forest-600/50 bg-forest-800/80 p-3 text-gold-400 sm:block">
                  <CalendarDays className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {/* STEP 1: Date Selection Carousel */}
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-forest-950 shadow-sm">
                    1
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-widest text-gold-400">
                      STEP 1
                    </span>
                    <h3 className="font-display text-lg font-bold text-cream">Choose Date</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-gold-400/60 hover:text-gold-300 disabled:opacity-30 sm:h-12 sm:w-12"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <div className="grid flex-1 grid-cols-7 gap-1 sm:gap-2">
                    {weekDays.map((day) => {
                      const iso = toISODate(day);
                      const isSelected = selectedDate === iso;
                      const isToday = iso === todayISO();
                      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                      const dayNumber = day.getDate();
                      const monthName = day.toLocaleDateString('en-US', { month: 'short' });

                      return (
                        <button
                          key={iso}
                          onClick={() => setDate(iso)}
                          className={`relative flex flex-col items-center justify-center rounded-xl border py-2 transition-all sm:py-3 ${
                            isSelected
                              ? 'border-gold-400 bg-gold-400 text-forest-950 font-bold shadow-glow-gold'
                              : 'border-forest-600/70 bg-forest-800 text-cream-muted hover:border-gold-400/50 hover:bg-forest-700/80 hover:text-cream'
                          }`}
                        >
                          {isToday && (
                            <span
                              className={`absolute -top-2.5 right-1/2 translate-x-1/2 rounded-full px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-wider sm:px-2 sm:text-[8px] ${
                                isSelected
                                  ? 'bg-forest-950 text-gold-400'
                                  : 'bg-gold-400 text-forest-950'
                              }`}
                            >
                              TODAY
                            </span>
                          )}
                          <span
                            className={`text-[8px] font-semibold tracking-wider sm:text-[10px] ${
                              isSelected ? 'text-forest-900' : 'text-cream-muted/80'
                            }`}
                          >
                            {dayName}
                          </span>
                          <span className="my-0.5 text-sm font-extrabold sm:text-base sm:text-lg">
                            {dayNumber}
                          </span>
                          <span
                            className={`text-[7px] uppercase sm:text-[9px] ${
                              isSelected ? 'text-forest-900 font-semibold' : 'text-cream-muted/70'
                            }`}
                          >
                            {monthName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-gold-400/60 hover:text-gold-300 sm:h-12 sm:w-12"
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* STEP 2: Court & Time Slot Matrix - RESPONSIVE */}
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-forest-950 shadow-sm">
                    2
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-widest text-gold-400">
                      STEP 2
                    </span>
                    <h3 className="font-display text-lg font-bold text-cream">
                      Choose Court and Time
                    </h3>
                  </div>
                </div>

                {/* Status Legend Bar */}
                <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-forest-700/80 pb-4 text-xs font-semibold sm:gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-forest-500 bg-forest-800/80 px-2 py-1 text-cream-muted sm:px-3">
                    <Check className="h-3 w-3 text-gold-400 sm:h-3.5 sm:w-3.5" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-300 sm:px-3">
                    <Clock3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Pending
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-400 sm:px-3">
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Booked
                  </span>
                </div>

                {/* Date Highlight Badge */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-forest-800/90 px-4 py-1.5 text-xs font-bold text-gold-300 shadow-inner sm:px-5">
                    <CalendarDays className="h-3 w-3 text-gold-400 sm:h-4 sm:w-4" />
                    {formatDateLong(selectedDate)}
                  </div>
                </div>

                {/* MOBILE: Court Selector Dropdown */}
                <div className="mb-6 md:hidden">
                  <label className="mb-1.5 block text-xs font-semibold text-cream-muted">Select Court</label>
                  <div className="relative">
                    <select
                      value={activeCourtId || ''}
                      onChange={(e) => setActiveCourtId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-forest-500 bg-forest-800 px-4 py-3 text-sm font-medium text-cream focus:border-gold-400 focus:outline-none"
                    >
                      {courts.map((court) => (
                        <option key={court.id} value={court.id} className="bg-forest-800">
                          {court.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-400" />
                  </div>
                </div>

                {/* DESKTOP: Court Tabs */}
                <div className="mb-6 hidden flex-wrap gap-2 md:flex">
                  {courts.map((court) => (
                    <button
                      key={court.id}
                      onClick={() => {
                        setActiveCourtId(court.id);
                        selectCourt(court);
                      }}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                        activeCourtId === court.id
                          ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                          : 'border-forest-500 bg-forest-700 text-cream-muted hover:border-gold-400/50'
                      }`}
                    >
                      {court.name}
                    </button>
                  ))}
                </div>

                {/* MOBILE: Active Court Name */}
                <div className="mb-4 text-center md:hidden">
                  <span className="font-display text-lg font-bold text-gold-400">
                    {activeCourt?.name || 'Select Court'}
                  </span>
                </div>

                {loadingSlots || loadingCourts ? (
                  <LoadingSpinner className="py-16" />
                ) : error ? (
                  <div className="py-12 text-center font-medium text-red-400">{error}</div>
                ) : courts.length === 0 ? (
                  <div className="py-12 text-center text-sm font-medium text-cream-muted">
                    No courts found.
                  </div>
                ) : (
                  <div>
                    {/* Mobile: Single court view */}
                    <div className="md:hidden">
                      <div className="space-y-6">
                        {/* MORNING */}
                        {morningTimes.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400">
                              <CloudSun className="h-3 w-3" />
                              MORNING
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {morningTimes.map((interval) => {
                                const slot = activeCourtSlots.find(
                                  (s) =>
                                    s.start_time === interval.start_time &&
                                    s.end_time === interval.end_time
                                );
                                if (!slot) return null;
                                return (
                                  <SlotPill
                                    key={slot.id}
                                    slot={slot}
                                    isSelected={selectedSlotIds.includes(slot.id)}
                                    onToggle={() => toggleSlot(slot.id)}
                                    compact={true}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* AFTERNOON */}
                        {afternoonTimes.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400">
                              <Sun className="h-3 w-3" />
                              AFTERNOON
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {afternoonTimes.map((interval) => {
                                const slot = activeCourtSlots.find(
                                  (s) =>
                                    s.start_time === interval.start_time &&
                                    s.end_time === interval.end_time
                                );
                                if (!slot) return null;
                                return (
                                  <SlotPill
                                    key={slot.id}
                                    slot={slot}
                                    isSelected={selectedSlotIds.includes(slot.id)}
                                    onToggle={() => toggleSlot(slot.id)}
                                    compact={true}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* EVENING */}
                        {eveningTimes.length > 0 && (
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400">
                              <Moon className="h-3 w-3" />
                              EVENING
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {eveningTimes.map((interval) => {
                                const slot = activeCourtSlots.find(
                                  (s) =>
                                    s.start_time === interval.start_time &&
                                    s.end_time === interval.end_time
                                );
                                if (!slot) return null;
                                return (
                                  <SlotPill
                                    key={slot.id}
                                    slot={slot}
                                    isSelected={selectedSlotIds.includes(slot.id)}
                                    onToggle={() => toggleSlot(slot.id)}
                                    compact={true}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {activeCourtSlots.length === 0 && (
                          <div className="py-12 text-center text-cream-muted">
                            No available slots for this court on the selected date.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Multi-court grid */}
                    <div className="hidden md:block">
                      <div className="overflow-x-auto pb-4">
                        <div className="min-w-[620px]">
                          {/* Court Column Headers */}
                          <div
                            className="grid gap-3 pb-4 text-center"
                            style={{
                              gridTemplateColumns: `repeat(${courts.length}, minmax(0, 1fr))`,
                            }}
                          >
                            {courts.map((court) => (
                              <div
                                key={court.id}
                                className="font-display text-sm font-extrabold tracking-wider uppercase text-gold-400"
                              >
                                {court.name}
                              </div>
                            ))}
                          </div>

                          {/* Period Sections */}
                          <div className="space-y-7">
                            {/* MORNING */}
                            {morningTimes.length > 0 && (
                              <PeriodSection
                                title="MORNING"
                                icon={<CloudSun className="h-4 w-4 text-gold-400" />}
                                courts={courts}
                                timeIntervals={morningTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                              />
                            )}

                            {/* AFTERNOON */}
                            {afternoonTimes.length > 0 && (
                              <PeriodSection
                                title="AFTERNOON"
                                icon={<Sun className="h-4 w-4 text-gold-400" />}
                                courts={courts}
                                timeIntervals={afternoonTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                              />
                            )}

                            {/* EVENING */}
                            {eveningTimes.length > 0 && (
                              <PeriodSection
                                title="EVENING"
                                icon={<Moon className="h-4 w-4 text-gold-400" />}
                                courts={courts}
                                timeIntervals={eveningTimes}
                                getSlotForCourtAndTime={getSlotForCourtAndTime}
                                selectedSlotIds={selectedSlotIds}
                                onToggleSlot={toggleSlot}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Reservation Summary Bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-forest-600 bg-forest-800/90 p-5 sm:flex-row">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                      Selected Slots
                    </span>
                    <div className="font-display text-lg font-bold text-cream">
                      {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} chosen
                      {selectedSlotIds.length > 0 && (
                        <span className="ml-2 font-sans text-sm font-semibold text-gold-400">
                          ({formatCurrency(totalSelected)})
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => navigate('/booking')}
                    disabled={selectedSlotIds.length === 0}
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                    className="w-full sm:w-auto"
                  >
                    Proceed to Reservation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-forest-500 bg-forest-900 py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Why CenterCourt
            </span>
            <h2 className="section-title mt-2">Built for Players</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
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
                  className="card p-6"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10">
                    <Icon className="h-6 w-6 text-gold-400" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-cream">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream-muted">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Simple Process
            </span>
            <h2 className="section-title mt-2">How It Works</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
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
                <div className="mb-4 font-display text-4xl font-bold text-gold-400/30">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-bold text-cream">{item.title}</h3>
                <p className="mt-2 text-sm text-cream-muted">{item.desc}</p>
                {i < 3 && (
                  <div className="mt-4 hidden h-px bg-gradient-to-r from-gold-400/40 to-transparent md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Period Section Subcomponent (Desktop)
function PeriodSection({
  title,
  icon,
  courts,
  timeIntervals,
  getSlotForCourtAndTime,
  selectedSlotIds,
  onToggleSlot,
}: {
  title: string;
  icon: React.ReactNode;
  courts: Court[];
  timeIntervals: { start_time: string; end_time: string }[];
  getSlotForCourtAndTime: (courtId: string, startTime: string, endTime: string) => TimeSlot | undefined;
  selectedSlotIds: string[];
  onToggleSlot: (slotId: string) => void;
}) {
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold tracking-widest uppercase text-gold-400">
          {title}
        </span>
        <div className="h-px flex-1 bg-forest-700/80" />
      </div>

      <div className="space-y-2.5">
        {timeIntervals.map((interval) => (
          <div
            key={`${interval.start_time}-${interval.end_time}`}
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${courts.length}, minmax(0, 1fr))`,
            }}
          >
            {courts.map((court) => {
              const slot = getSlotForCourtAndTime(court.id, interval.start_time, interval.end_time);

              if (!slot) {
                return (
                  <div
                    key={`${court.id}-${interval.start_time}`}
                    className="flex h-11 items-center justify-center rounded-xl border border-forest-800 bg-forest-950/40 text-xs text-forest-600 select-none"
                  >
                    —
                  </div>
                );
              }

              return (
                <SlotPill
                  key={slot.id}
                  slot={slot}
                  isSelected={selectedSlotIds.includes(slot.id)}
                  onToggle={() => onToggleSlot(slot.id)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Slot Pill Component
function SlotPill({
  slot,
  isSelected,
  onToggle,
  compact = false,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const isAvailable = slot.is_available;
  const isPending = (slot as unknown as { is_pending?: boolean }).is_pending;

  let styleClasses =
    'border-forest-600/70 bg-forest-800 text-cream-muted hover:border-gold-400/60 hover:bg-forest-700/80 hover:text-cream cursor-pointer';

  if (!isAvailable) {
    styleClasses = 'border-red-500/30 bg-red-500/10 text-red-400/75 line-through cursor-not-allowed';
  } else if (isPending) {
    styleClasses = 'border-amber-500/30 bg-amber-500/10 text-amber-300/80 cursor-not-allowed';
  } else if (isSelected) {
    styleClasses = 'border-gold-400 bg-gold-400 text-forest-950 font-bold shadow-glow-gold';
  }

  if (compact) {
    return (
      <button
        onClick={isAvailable && !isPending ? onToggle : undefined}
        disabled={!isAvailable || isPending}
        className={`flex h-10 w-full items-center justify-center rounded-xl border text-[11px] font-semibold tracking-wide transition-all ${styleClasses}`}
      >
        <span>{formatTimeRange(slot.start_time, slot.end_time)}</span>
      </button>
    );
  }

  return (
    <button
      onClick={isAvailable && !isPending ? onToggle : undefined}
      disabled={!isAvailable || isPending}
      className={`flex h-11 w-full items-center justify-center rounded-xl border text-xs font-semibold tracking-wide transition-all ${styleClasses}`}
    >
      <span>{formatTimeRange(slot.start_time, slot.end_time)}</span>
    </button>
  );
}