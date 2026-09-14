import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  Pencil,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore, getSelectedSlotItems, getSelectedTotal } from '@/stores/bookingStore';
import { formatTimeRange, formatCurrency, formatDateLong } from '@/utils/format';
import { FIXED_SLOT } from '@/utils/constants';
import type { CustomerDetails } from '@/types';

// Normalize PH mobile: strip spaces/dashes/parens, convert +63/63 → 0
const normalizePhone = (value: string) =>
  value
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?63/, '0');

const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is required')
    .max(80, 'Name is too long')
    .regex(/^[A-Za-zÀ-ÿ.'\-\s]+$/, "Name can only contain letters, spaces, and . ' -"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(120, 'Email is too long'),

  phone: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .transform(normalizePhone)
    .refine((v) => /^09\d{9}$/.test(v), {
      message: 'Enter a valid PH mobile number (e.g. 0917 123 4567)',
    }),

  notes: z.string().max(500, 'Notes are too long').optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export function Booking() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const {
    courts,
    selectedDate,
    loadingCourts,
    error,
    loadCourts,
    setCustomer,
    createBooking,
    slots,
  } = useBookingStore();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    mode: 'onBlur',
    defaultValues: useBookingStore.getState().customer,
  });

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
  }, [courts.length, loadCourts]);

  useEffect(() => {
    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  const storeState = useBookingStore();
  const selectedSlots = getSelectedSlotItems(storeState);
  const total = getSelectedTotal(storeState);

  const getSelectedCourts = () => {
    const courtMap = new Map();
    const selectedTimeSlots = slots.filter((s) => storeState.selectedSlotIds.includes(s.id));
    selectedTimeSlots.forEach((slot) => {
      const court = courts.find((c) => c.id === slot.court_id);
      if (court && !courtMap.has(court.id)) {
        courtMap.set(court.id, court);
      }
    });
    return Array.from(courtMap.values());
  };

  const selectedCourts = getSelectedCourts();

  const getCourtForSlot = (slotId: string) => {
    const timeSlot = slots.find((s) => s.id === slotId);
    if (!timeSlot) return null;
    return courts.find((c) => c.id === timeSlot.court_id);
  };

  const onSubmit = async (data: CustomerForm) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      setCustomer(data);
      await createBooking();

      const created = useBookingStore.getState().currentBooking;
      if (created?.reference_code) {
        localStorage.setItem('pendingBookingRef', created.reference_code);
      }

      navigate('/checkout');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSummaryButtonClick = () => {
    handleSubmit(onSubmit)();
  };

  if (loadingCourts && courts.length === 0) {
    return (
      <div className="min-h-screen bg-charcoal">
        <Navbar />
        <LoadingSpinner className="pt-32" />
        <Footer />
      </div>
    );
  }

  if (selectedSlots.length === 0) {
    return (
      <div className="min-h-screen bg-charcoal">
        <Navbar />
        <div className="container-page flex flex-col items-center justify-center gap-4 pt-32 pb-24 text-center">
          <CalendarDays className="h-10 w-10 text-cream-muted/40" />
          <div>
            <h1 className="text-lg font-bold text-cream">No court or time selected yet</h1>
            <p className="mt-1 text-sm text-cream-muted">
              Head back to the homepage to pick a court and a time slot first.
            </p>
          </div>
          <Button size="md" to="/" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Choose Court & Time
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-28 lg:pb-16">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">Confirm & Book</h1>
          <p className="text-xs text-cream-muted sm:text-sm">
            Review your selection, then enter your details.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/20 bg-error/10 p-3 text-xs font-medium text-error">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Selection Summary */}
            <div className="card rounded-2xl border border-forest-700/70 bg-forest-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-blue-300" />
                  Your Selection ({selectedCourts.length} court{selectedCourts.length > 1 ? 's' : ''})
                </h2>
                <Link
                  to="/"
                  className="flex items-center gap-1 text-[11px] font-semibold text-cream-muted underline decoration-dotted transition hover:text-brand-blue-300"
                >
                  <Pencil className="h-3 w-3" />
                  Edit selection
                </Link>
              </div>

              <p className="mb-3 text-xs font-medium text-cream-muted">
                {formatDateLong(selectedDate)}
              </p>

              {/* Court Cards */}
              <div className="space-y-2.5">
                {selectedCourts.map((court) => {
                  const courtSlots = selectedSlots.filter((s) => {
                    const timeSlot = slots.find((t) => t.id === s.slot_id);
                    return timeSlot?.court_id === court.id;
                  });
                  return (
                    <div
                      key={court.id}
                      className="flex items-center gap-3.5 rounded-xl border border-brand-blue-500/40 bg-forest-950/60 p-3.5 transition"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-forest-700 sm:h-16 sm:w-16">
                        <img
                          src={court.image}
                          alt={court.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-cream sm:text-base">
                          {court.name}
                        </h3>
                        <p className="truncate text-xs text-cream-muted">
                          {court.surface || court.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-brand-blue-300">
                          {formatCurrency(courtSlots.reduce((sum, s) => sum + s.price, 0))}
                        </p>
                        <p className="text-[10px] text-cream-muted">
                          {courtSlots.length} slot{courtSlots.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slot Row Pills */}
              <div className="mt-3.5 space-y-2">
                {selectedSlots.map((slot) => {
                  const court = getCourtForSlot(slot.slot_id);
                  return (
                    <div
                      key={slot.slot_id}
                      className="flex items-center justify-between rounded-xl border border-forest-700/60 bg-forest-800/80 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-brand-blue-300" />
                        <span className="text-xs font-medium text-cream sm:text-sm">
                          {court?.name || 'Court'} · {formatTimeRange(slot.start_time, slot.end_time)}
                        </span>
                        {slot.type === 'fixed_2hr' && (
                          <span className="rounded-full bg-brand-blue-500/30 border border-brand-blue-400/40 px-2 py-0.5 text-[9px] font-bold text-brand-blue-200">
                            {FIXED_SLOT.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-brand-blue-300 sm:text-sm">
                        {formatCurrency(slot.price)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-forest-700/80 pt-3.5">
                <span className="text-xs text-cream-muted">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                </span>
                <span className="font-display text-xl font-extrabold text-brand-blue-300">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Customer Details Form */}
            <div
              ref={formRef}
              className="card rounded-2xl border border-forest-700/70 bg-forest-900/80 p-4 scroll-mt-24 sm:p-5 shadow-xl backdrop-blur-sm"
            >
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-blue-300">
                Your Details
              </h2>
              <form id="bookingForm" onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Input
                    id="name"
                    label="Full Name"
                    placeholder="Juan Dela Cruz"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="0917 123 4567"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  inputMode="email"
                  placeholder="juan@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Textarea
                  label="Notes (optional)"
                  rows={2}
                  placeholder="Any special requests or equipment rental notes..."
                  {...register('notes')}
                />

                {submitError && (
                  <p className="rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs font-medium text-error">
                    {submitError}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right: Booking Summary Sidebar */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24 space-y-3">
              <div className="card rounded-2xl border border-forest-700/70 bg-forest-900/90 p-5 shadow-xl">
                <h2 className="mb-3.5 font-display text-base font-bold text-cream">
                  Booking Summary
                </h2>

                <div className="mb-3.5 space-y-2">
                  {selectedCourts.map((court) => {
                    const courtSlots = selectedSlots.filter((s) => {
                      const timeSlot = slots.find((t) => t.id === s.slot_id);
                      return timeSlot?.court_id === court.id;
                    });
                    return (
                      <div
                        key={court.id}
                        className="rounded-xl border border-forest-700/60 bg-forest-950/60 p-3"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                          Court
                        </p>
                        <p className="text-sm font-bold text-cream">{court.name}</p>
                        <p className="text-[10px] text-cream-muted">{formatDateLong(selectedDate)}</p>
                        <p className="mt-1.5 text-xs font-semibold text-brand-blue-300">
                          {courtSlots.length} slot{courtSlots.length > 1 ? 's' : ''} ·{' '}
                          {formatCurrency(courtSlots.reduce((sum, s) => sum + s.price, 0))}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <AnimatePresence mode="popLayout">
                  <motion.div
                    key="slots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1.5"
                  >
                    {selectedSlots.map((slot) => {
                      const court = getCourtForSlot(slot.slot_id);
                      return (
                        <div
                          key={slot.slot_id}
                          className="flex items-center justify-between rounded-lg bg-forest-800/80 px-3 py-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate font-medium text-cream">
                              {court?.name || 'Court'} · {formatTimeRange(slot.start_time, slot.end_time)}
                            </p>
                            {slot.type === 'fixed_2hr' && (
                              <span className="text-[9px] font-bold text-brand-blue-300">
                                {FIXED_SLOT.label}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 font-bold text-brand-blue-300">
                            {formatCurrency(slot.price)}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-4 border-t border-forest-700/80 pt-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cream-muted">
                      {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                    </span>
                    <span className="font-display text-2xl font-extrabold text-brand-blue-300">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  fullWidth
                  className="mt-4"
                  isLoading={submitting}
                  onClick={handleSummaryButtonClick}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Proceed to Checkout
                </Button>
              </div>

              <div className="rounded-xl border border-forest-700/70 bg-forest-900/60 p-3.5">
                <p className="text-xs text-cream-muted leading-relaxed">
                  <span className="font-semibold text-brand-blue-300">Note:</span> Court slots are
                  temporarily reserved once you proceed to checkout. Complete payment within 15 minutes
                  to secure your schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-700/80 bg-forest-950/95 p-3.5 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-cream-muted">
              {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-xl font-extrabold text-brand-blue-300">{formatCurrency(total)}</p>
          </div>
          <Button
            size="md"
            isLoading={submitting}
            onClick={handleSummaryButtonClick}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="shrink-0 px-6"
          >
            Checkout
          </Button>
        </div>
        {submitError && (
          <p className="mt-2 rounded-lg border border-error/30 bg-error/10 p-2 text-xs font-medium text-error">
            {submitError}
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}

export type { CustomerDetails };