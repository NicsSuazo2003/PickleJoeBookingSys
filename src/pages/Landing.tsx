import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Zap,
  CalendarDays,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore } from '@/stores/bookingStore';
import { courtService } from '@/services/courtService';
import { COURT_IMAGES, APP_CONFIG, FIXED_SLOT } from '@/utils/constants';
import { formatTimeRange, formatCurrency, todayISO, formatDate } from '@/utils/format';
import type { TimeSlot } from '@/types';

export function Landing() {
  const { courts, loadCourts } = useBookingStore();
  const [todaySlots, setTodaySlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  useEffect(() => {
    if (courts.length > 0) {
      courtService.getAvailability(courts[0].id, todayISO()).then((slots) => {
        setTodaySlots(slots);
        setLoadingSlots(false);
      });
    }
  }, [courts]);

  const availableSlots = todaySlots.filter((s) => s.is_available);
  const fixedSlot = todaySlots.find((s) => s.type === 'fixed_2hr' && s.is_available);

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src={COURT_IMAGES.hero}
            alt="Pickleball court"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-950/40" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="container-page relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium text-gold-300">
                Premium Pickleball Courts in the City
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-cream sm:text-6xl lg:text-7xl">
              Pickle<span className="text-gold-400">Joe</span>
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

      {/* Today's Availability */}
      <section className="border-y border-forest-500 bg-forest-900 py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold-400" />
                <span className="text-sm font-semibold uppercase tracking-wider text-gold-400">
                  Today's Availability
                </span>
              </div>
              <h2 className="section-title">{formatDate(todayISO())}</h2>
              <p className="mt-2 text-cream-muted">
                {courts[0] ? `Live slots for ${courts[0].name}` : 'Live slots for all courts'}
              </p>
            </div>
            <Button variant="secondary" size="md" to="/booking" rightIcon={<ArrowRight className="h-4 w-4" />}>
              See All Slots
            </Button>
          </div>

          {loadingSlots ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-4">
              {/* Featured fixed 2hr slot */}
              {fixedSlot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="lg:col-span-1"
                >
                  <div className="relative h-full overflow-hidden rounded-2xl border-2 border-gold-400 bg-gradient-to-br from-forest-700 to-forest-800 p-6 shadow-glow-gold">
                    <div className="absolute right-4 top-4">
                      <span className="badge bg-gold-400 text-forest-950">
                        <Sparkles className="h-3 w-3" />
                        {FIXED_SLOT.label}
                      </span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">
                      Featured Slot
                    </p>
                    <p className="mt-3 font-display text-2xl font-bold text-cream">
                      4:00 PM - 6:00 PM
                    </p>
                    <p className="mt-1 text-sm text-cream-muted">2 hours of prime play time</p>
                    <div className="mt-4 border-t border-gold-400/20 pt-4">
                      <p className="text-3xl font-bold text-gold-400">
                        {formatCurrency(fixedSlot.price)}
                      </p>
                      <p className="text-xs text-cream-muted">for 2 hours</p>
                    </div>
                    <Link
                      to="/booking"
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gold-400 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-300"
                    >
                      Reserve Now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Standard slots preview */}
              <div className="grid grid-cols-2 gap-3 lg:col-span-3 sm:grid-cols-3 lg:grid-cols-4">
                {availableSlots
                  .filter((s) => s.type === 'standard')
                  .slice(0, 8)
                  .map((slot, i) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-forest-500 bg-forest-700 p-4 transition hover:border-gold-400/50"
                    >
                      <p className="text-xs font-medium text-cream-muted">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </p>
                      <p className="mt-2 text-lg font-bold text-cream">
                        {formatCurrency(slot.price)}
                      </p>
                      {slot.is_peak && (
                        <span className="mt-1 inline-block text-[10px] font-semibold text-gold-300">
                          Peak
                        </span>
                      )}
                    </motion.div>
                  ))}
                {availableSlots.filter((s) => s.type === 'standard').length === 0 && (
                  <p className="col-span-full py-8 text-center text-cream-muted">
                    No standard slots available today. Check the booking page for more dates.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Court Showcase */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Our Courts
            </span>
            <h2 className="section-title mt-2">Choose Your Court</h2>
            <p className="mx-auto mt-4 max-w-2xl text-cream-muted">
              Three premium courts designed for every level of play, from casual rallies to
              competitive tournaments.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {courts.map((court, i) => (
              <motion.div
                key={court.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group overflow-hidden rounded-2xl border border-forest-500 bg-forest-700"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {court.is_indoor ? (
                      <span className="badge bg-forest-700/90 text-cream">Indoor</span>
                    ) : (
                      <span className="badge bg-forest-700/90 text-cream">Outdoor</span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-cream">{court.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-cream-muted">
                    {court.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {court.amenities.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="rounded-md bg-forest-600 px-2 py-0.5 text-[11px] text-cream-muted"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-forest-500 pt-4">
                    <div>
                      <span className="text-xs text-cream-muted">from</span>
                      <p className="text-lg font-bold text-gold-400">
                        {formatCurrency(court.price_per_hour)}
                        <span className="text-xs font-normal text-cream-muted">/hr</span>
                      </p>
                    </div>
                    <Button size="sm" to="/booking" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      Book
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-forest-500 bg-forest-900 py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Why PickleJoe
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

      {/* How It Works */}
      <section className="py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold-400">
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

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 to-forest-950" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container-page relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mx-auto max-w-2xl text-balance">
              Ready to Hit the Court?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-cream-muted">
              Book your slot now and get playing in minutes. Courts fill up fast during peak hours.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" to="/booking" leftIcon={<CalendarPlus className="h-5 w-5" />}>
                Book Now
              </Button>
              <div className="flex items-center gap-2 text-sm text-cream-muted">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Free cancellation up to 24 hours before
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
