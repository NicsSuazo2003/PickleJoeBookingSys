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

// Distinct accent color per court column
const COURT_ACCENTS = [
  { header: 'text-blue-400', dot: 'bg-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-200', hoverBorder: 'hover:border-blue-400/70', hoverBg: 'hover:bg-blue-500/20' },
  { header: 'text-purple-400', dot: 'bg-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-200', hoverBorder: 'hover:border-purple-400/70', hoverBg: 'hover:bg-purple-500/20' },
  { header: 'text-teal-400', dot: 'bg-teal-400', border: 'border-teal-500/40', bg: 'bg-teal-500/10', text: 'text-teal-200', hoverBorder: 'hover:border-teal-400/70', hoverBg: 'hover:bg-teal-500/20' },
  { header: 'text-pink-400', dot: 'bg-pink-400', border: 'border-pink-500/40', bg: 'bg-pink-500/10', text: 'text-pink-200', hoverBorder: 'hover:border-pink-400/70', hoverBg: 'hover:bg-pink-500/20' },
  { header: 'text-cyan-400', dot: 'bg-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-200', hoverBorder: 'hover:border-cyan-400/70', hoverBg: 'hover:bg-cyan-500/20' },
  { header: 'text-indigo-400', dot: 'bg-indigo-400', border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-200', hoverBorder: 'hover:border-indigo-400/70', hoverBg: 'hover:bg-indigo-500/20' },
];

function getCourtAccent(index: number) {
  return COURT_ACCENTS[index % COURT_ACCENTS.length];
}

// Helper to format time as "7PM-8PM"
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
  } = useBookingStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
  }, [courts.length, loadCourts]);

  useEffect(() => {
    if (courts.length > 0) {
      loadAllCourtsSlots();
    }
  }, [selectedDate, courts.length, loadAllCourtsSlots]);

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

      {/* Structured Multi-Court Booking Section */}
      <section className="relative z-20 border-y border-forest-500 bg-forest-950 py-8 md:py-16">
        <div className="container-page max-w-7xl">
          <div className="overflow-hidden rounded-2xl border border-forest-600/60 bg-forest-900 shadow-2xl md:rounded-3xl">
            
            {/* Header Banner */}
            <div className="border-b border-forest-700 bg-forest-950 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-7">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight text-cream sm:text-xl md:text-3xl">
                    Book a Court
                  </h2>
                  <p className="hidden text-xs text-cream-muted sm:block md:text-sm">
                    Pick a date, then tap any number of time slots
                  </p>
                </div>
                <div className="hidden rounded-xl border border-forest-600/50 bg-forest-800/80 p-2 text-gold-400 sm:block md:p-3">
                  <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-8">
              {/* STEP 1: Date Selection Carousel */}
              <div className="mb-6 md:mb-10">
                <div className="mb-3 flex items-center gap-2 md:mb-5 md:gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-forest-950 shadow-sm md:h-7 md:w-7 md:text-xs">
                    1
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-gold-400 md:text-[11px]">
                      STEP 1
                    </span>
                    <h3 className="font-display text-sm font-bold text-cream md:text-lg">Choose Date</h3>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 md:gap-2">
                  <button
                    onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
                    disabled={weekOffset === 0}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-gold-400/60 hover:text-gold-300 disabled:opacity-30 sm:h-11 sm:w-11 md:h-12 md:w-12 md:rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                  </button>

                  <div className="grid flex-1 grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">
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
                          className={`relative flex flex-col items-center justify-center rounded-lg border py-2 transition-all sm:rounded-xl sm:py-2.5 md:py-3 ${
                            isSelected
                              ? 'border-gold-400 bg-gold-400 text-forest-950 font-bold shadow-glow-gold'
                              : 'border-forest-600/70 bg-forest-800 text-cream-muted hover:border-gold-400/50 hover:bg-forest-700/80 hover:text-cream'
                          }`}
                        >
                          {isToday && (
                            <span
                              className={`absolute -top-2 right-1 rounded-full px-1.5 py-0.5 text-[6px] font-extrabold uppercase tracking-wider sm:-top-2.5 sm:right-1.5 sm:px-2 sm:text-[7px] md:px-2 md:text-[8px] ${
                                isSelected
                                  ? 'bg-forest-950 text-gold-400'
                                  : 'bg-gold-400 text-forest-950'
                              }`}
                            >
                              TODAY
                            </span>
                          )}
                          <span
                            className={`text-[7px] font-semibold tracking-wider sm:text-[8px] md:text-[10px] ${
                              isSelected ? 'text-forest-900' : 'text-cream-muted/80'
                            }`}
                          >
                            {dayName}
                          </span>
                          <span className="my-0.5 text-sm font-extrabold sm:text-base md:text-lg">
                            {dayNumber}
                          </span>
                          <span
                            className={`text-[6px] uppercase sm:text-[7px] md:text-[9px] ${
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-forest-600 bg-forest-800 text-cream-muted transition hover:border-gold-400/60 hover:text-gold-300 sm:h-11 sm:w-11 md:h-12 md:w-12 md:rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>

              {/* STEP 2 */}
              <div>
                <div className="mb-3 flex items-center gap-2 md:mb-5 md:gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-forest-950 shadow-sm md:h-7 md:w-7 md:text-xs">
                    2
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold uppercase tracking-widest text-gold-400 md:text-[11px]">
                      STEP 2
                    </span>
                    <h3 className="font-display text-sm font-bold text-cream md:text-lg">
                      Choose Court and Time
                    </h3>
                  </div>
                </div>

                {/* Status Legend Bar */}
                <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-forest-700/80 pb-2 text-[10px] font-semibold sm:gap-2.5 md:gap-3 md:pb-4 md:text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-forest-500 bg-forest-800/80 px-2 py-1 text-cream-muted sm:px-3 sm:py-1.5">
                    <Check className="h-2.5 w-2.5 text-gold-400 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-300 sm:px-3 sm:py-1.5">
                    <Clock3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                    Pending
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-400 sm:px-3 sm:py-1.5">
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                    Booked
                  </span>
                </div>

                {/* Date Highlight Badge */}
                <div className="mb-4 flex justify-center md:mb-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-forest-800/90 px-3 py-1 text-[10px] font-bold text-gold-300 shadow-inner sm:gap-2 sm:px-4 sm:py-1.5 sm:text-xs md:px-5 md:py-1.5">
                    <CalendarDays className="h-3 w-3 text-gold-400 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    {formatDateLong(selectedDate)}
                  </div>
                </div>

                {/* Multi-Court Column Table with Sticky Headers */}
                {loadingSlots || loadingCourts ? (
                  <LoadingSpinner className="py-8 md:py-16" />
                ) : error ? (
                  <div className="py-6 text-center font-medium text-red-400 md:py-12">{error}</div>
                ) : courts.length === 0 ? (
                  <div className="py-6 text-center text-sm font-medium text-cream-muted md:py-12">
                    No courts found.
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-2 md:pb-4">
                    <div className="min-w-[320px] sm:min-w-[380px] md:min-w-[520px]">
                      
                      {/* ✅ Sticky Court Column Headers */}
                      <div
                        className="sticky top-0 z-10 grid gap-2 bg-forest-900 pb-3 text-center text-[10px] font-extrabold uppercase tracking-wider text-gold-400 sm:gap-2.5 sm:pb-4 md:gap-3 md:pb-4 md:text-sm"
                        style={{
                          gridTemplateColumns: `repeat(${courts.length}, minmax(50px, 1fr))`,
                        }}
                      >
                        {courts.map((court, idx) => {
                          const accent = getCourtAccent(idx);
                          return (
                            <div
                              key={court.id}
                              className={`flex items-center justify-center gap-1.5 truncate bg-forest-900 px-1 py-2 text-[9px] sm:text-[10px] md:text-sm ${accent.header}`}
                            >
                              <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 md:h-2 md:w-2 ${accent.dot}`} />
                              <span className="truncate font-bold">{court.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Period Sections */}
                      <div className="space-y-3 md:space-y-5">
                        {morningTimes.length > 0 && (
                          <PeriodSection
                            title="MORNING"
                            icon={<CloudSun className="h-3 w-3 text-gold-400 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />}
                            courts={courts}
                            timeIntervals={morningTimes}
                            getSlotForCourtAndTime={getSlotForCourtAndTime}
                            selectedSlotIds={selectedSlotIds}
                            onToggleSlot={toggleSlot}
                            compact={true}
                          />
                        )}

                        {afternoonTimes.length > 0 && (
                          <PeriodSection
                            title="AFTERNOON"
                            icon={<Sun className="h-3 w-3 text-gold-400 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />}
                            courts={courts}
                            timeIntervals={afternoonTimes}
                            getSlotForCourtAndTime={getSlotForCourtAndTime}
                            selectedSlotIds={selectedSlotIds}
                            onToggleSlot={toggleSlot}
                            compact={true}
                          />
                        )}

                        {eveningTimes.length > 0 && (
                          <PeriodSection
                            title="EVENING"
                            icon={<Moon className="h-3 w-3 text-gold-400 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />}
                            courts={courts}
                            timeIntervals={eveningTimes}
                            getSlotForCourtAndTime={getSlotForCourtAndTime}
                            selectedSlotIds={selectedSlotIds}
                            onToggleSlot={toggleSlot}
                            compact={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Reservation Summary Bar */}
                <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-forest-600 bg-forest-800/90 p-3 sm:mt-6 sm:flex-row sm:gap-4 sm:p-4 md:mt-10 md:p-5">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted sm:text-xs md:text-xs">
                      Selected Slots
                    </span>
                    <div className="font-display text-sm font-bold text-cream sm:text-base md:text-lg">
                      {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 && 's'} chosen
                      {selectedSlotIds.length > 0 && (
                        <span className="ml-1.5 font-sans text-xs font-semibold text-gold-400 sm:ml-2 sm:text-sm">
                          ({formatCurrency(totalSelected)})
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="md"
                    onClick={() => navigate('/booking')}
                    disabled={selectedSlotIds.length === 0}
                    rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
                    className="w-full text-sm sm:w-auto"
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

// Period Section Subcomponent
function PeriodSection({
  title,
  icon,
  courts,
  timeIntervals,
  getSlotForCourtAndTime,
  selectedSlotIds,
  onToggleSlot,
  compact = false,
}: {
  title: string;
  icon: React.ReactNode;
  courts: Court[];
  timeIntervals: { start_time: string; end_time: string }[];
  getSlotForCourtAndTime: (courtId: string, startTime: string, endTime: string) => TimeSlot | undefined;
  selectedSlotIds: string[];
  onToggleSlot: (slotId: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <div className={`mb-1.5 flex items-center gap-1.5 sm:mb-2 sm:gap-2 md:mb-3.5`}>
        <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4">{icon}</span>
        <span className={`font-bold tracking-widest uppercase text-gold-400 text-[9px] sm:text-[10px] md:text-xs`}>
          {title}
        </span>
        <div className="h-px flex-1 bg-forest-700/80" />
      </div>

      <div className={`space-y-1.5 sm:space-y-2 md:space-y-2.5`}>
        {timeIntervals.map((interval) => (
          <div
            key={`${interval.start_time}-${interval.end_time}`}
            className="grid gap-1.5 sm:gap-2 md:gap-2.5"
            style={{
              gridTemplateColumns: `repeat(${courts.length}, minmax(55px, 1fr))`,
            }}
          >
            {courts.map((court, idx) => {
              const slot = getSlotForCourtAndTime(court.id, interval.start_time, interval.end_time);
              const accent = getCourtAccent(idx);

              if (!slot) {
                return (
                  <div
                    key={`${court.id}-${interval.start_time}`}
                    className={`flex items-center justify-center rounded-full border border-forest-800/60 bg-forest-950/60 text-[10px] text-forest-700 select-none h-9 sm:h-10 md:h-11`}
                  >
                    —
                  </div>
                );
              }

              return (
                <div key={slot.id}>
                  <SlotPill
                    slot={slot}
                    isSelected={selectedSlotIds.includes(slot.id)}
                    onToggle={() => onToggleSlot(slot.id)}
                    compact={compact}
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

type CourtAccent = ReturnType<typeof getCourtAccent>;

// Slot Pill Component
function SlotPill({
  slot,
  isSelected,
  onToggle,
  compact = false,
  accent,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onToggle: () => void;
  compact?: boolean;
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
    styleClasses = 'border-gold-400 bg-gold-400 text-forest-950 font-bold shadow-glow-gold';
  }

  const height = compact ? 'h-9 sm:h-10 md:h-12' : 'h-12';
  const textSize = compact ? 'text-[10px] sm:text-[11px] md:text-sm' : 'text-sm';
  const padding = compact ? 'px-1.5 sm:px-2.5' : 'px-3';

  return (
    <button
      onClick={isAvailable && !isPending ? onToggle : undefined}
      disabled={!isAvailable || isPending}
      className={`flex w-full items-center justify-center rounded-full border font-medium tracking-tight transition-all ${height} ${textSize} ${padding} ${styleClasses}`}
    >
      <span className="truncate font-semibold">
        {formatTimeRangeShort(slot.start_time, slot.end_time)}
      </span>
    </button>
  );
}