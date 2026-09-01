import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CalendarDays,
  Check,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBookingStore, getSelectedSlotItems, getSelectedTotal } from '@/stores/bookingStore';
import {
  formatTimeRange,
  formatCurrency,
  formatDate,
  formatDateLong,
  toISODate,
  todayISO,
  addDays,
} from '@/utils/format';
import { FIXED_SLOT } from '@/utils/constants';
import type { CustomerDetails } from '@/types';

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  notes: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export function Booking() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const {
    courts,
    selectedCourt,
    selectedDate,
    slots,
    selectedSlotIds,
    loadingCourts,
    loadingSlots,
    error,
    loadCourts,
    setDate,
    toggleSlot,
    setCustomer,
    createBooking,
  } = useBookingStore();

  const [weekOffset, setWeekOffset] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: useBookingStore.getState().customer,
  });

  useEffect(() => {
    if (courts.length === 0) {
      loadCourts();
    }
  }, [courts.length, loadCourts]);

  // Auto-scroll to form when component mounts (if coming from landing page)
  useEffect(() => {
    const hasSelectedSlots = useBookingStore.getState().selectedSlotIds.length > 0;
    if (hasSelectedSlots && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const storeState = useBookingStore();
  const selectedSlots = getSelectedSlotItems(storeState);
  const total = getSelectedTotal(storeState);

  const fixedSlots = slots.filter((s) => s.type === 'fixed_2hr');
  const standardSlots = slots.filter((s) => s.type !== 'fixed_2hr');

  // Single source of truth for submission — used by both the in-form button
  // and the summary/sticky-bar button. No DOM-reading, no synthetic events.
  const onSubmit = async (data: CustomerForm) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      setCustomer(data);
      await createBooking();
      navigate('/checkout');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // If slots aren't picked yet, scroll to the form instead of submitting
  // (validation will still catch empty fields once they do submit).
  const handleSummaryButtonClick = () => {
    if (selectedSlots.length === 0) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    handleSubmit(onSubmit)();
  };

  if (loadingCourts && courts.length === 0) {
    return (
      <div className="min-h-screen bg-charcoal">
        <Navbar />
        <LoadingSpinner size="lg" className="pt-32" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-20 pb-24 lg:pb-12">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold text-cream sm:text-2xl">Book a Court</h1>
          <p className="text-xs text-cream-muted sm:text-sm">
            Review your court and slots, then enter your details.
          </p>
        </div>

        {/* Selected Court Display (Read-only) — compact */}
        <div className="mb-4 sm:mb-6">
          {selectedCourt ? (
            <div className="flex items-center gap-3 rounded-xl border border-gold-400/30 bg-forest-700/50 p-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                <img
                  src={selectedCourt.image}
                  alt={selectedCourt.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-cream sm:text-base">
                  {selectedCourt.name}
                </h3>
                <p className="truncate text-xs text-cream-muted">
                  {selectedCourt.surface || selectedCourt.description}
                </p>
                <p className="text-xs font-semibold text-gold-400">
                  {formatCurrency(selectedCourt.price_per_hour)}/hr
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-forest-500 bg-forest-700/50 p-3 text-center text-xs text-cream-muted">
              No court selected. Please go back to the homepage to select a court.
            </div>
          )}
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Left: Date + Slots */}
          <div className="space-y-4 lg:col-span-2">
            {/* Date Picker — horizontal scroll on mobile, no forced 7-col squeeze */}
            <div className="card p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Select Date
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w - 1)}
                    className="rounded-lg border border-forest-500 p-1 text-cream-muted transition hover:border-gold-400 hover:text-gold-300 disabled:opacity-30"
                    disabled={weekOffset === 0}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] text-cream-muted">
                    {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset}w` : 'Past'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="rounded-lg border border-forest-500 p-1 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-visible sm:px-0">
                {weekDays.map((day) => {
                  const iso = toISODate(day);
                  const isSelected = selectedDate === iso;
                  const isToday = iso === todayISO();
                  const isPast = iso < todayISO();
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => !isPast && setDate(iso)}
                      disabled={isPast}
                      className={`flex w-12 flex-shrink-0 flex-col items-center rounded-lg border py-2 transition-all sm:w-auto ${
                        isSelected
                          ? 'border-gold-400 bg-gold-400 text-forest-950'
                          : isPast
                            ? 'border-forest-600 bg-forest-800/50 text-cream-muted/40 cursor-not-allowed'
                            : 'border-forest-500 bg-forest-700 text-cream hover:border-gold-400/50'
                      }`}
                    >
                      <span className="text-[9px] font-medium uppercase">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="mt-0.5 text-sm font-bold">{day.getDate()}</span>
                      {isToday && !isSelected && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-gold-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots — compact */}
            <div className="card p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400">
                  <Clock className="h-3.5 w-3.5" />
                  Time Slots
                </h2>
                <span className="text-[11px] text-cream-muted">{formatDateLong(selectedDate)}</span>
              </div>

              {loadingSlots ? (
                <LoadingSpinner className="py-8" />
              ) : error ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-error">{error}</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-cream-muted/40" />
                  <p className="mt-2 text-xs text-cream-muted">
                    No available time slots for this court on this date.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Fixed 2hr Slots */}
                  {fixedSlots.length > 0 &&
                    fixedSlots.map((slot) => {
                      const isSelected = selectedSlotIds.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => slot.is_available && toggleSlot(slot.id)}
                          disabled={!slot.is_available}
                          className={`flex w-full items-center justify-between rounded-xl border-2 p-3 transition-all ${
                            isSelected
                              ? 'border-gold-400 bg-gold-400/15 shadow-glow-gold'
                              : slot.is_available
                                ? 'border-gold-400/40 bg-gradient-to-r from-forest-700 to-forest-800 hover:border-gold-400'
                                : 'border-forest-600 bg-forest-800/40 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold-400/20">
                              <Sparkles className="h-4 w-4 text-gold-400" />
                            </div>
                            <div className="text-left">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-sm font-bold text-cream">
                                  {formatTimeRange(slot.start_time, slot.end_time)}
                                </span>
                                <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[9px] font-bold text-forest-950">
                                  {FIXED_SLOT.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-cream-muted">Best value — prime hours</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gold-400">
                              {formatCurrency(slot.price)}
                            </span>
                            {isSelected && <Check className="h-4 w-4 text-gold-400" />}
                          </div>
                        </button>
                      );
                    })}

                  {/* Standard 1hr Slots */}
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                      Standard 1-Hour Slots
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {standardSlots.map((slot) => {
                        const isSelected = selectedSlotIds.includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => slot.is_available && toggleSlot(slot.id)}
                            disabled={!slot.is_available}
                            className={`flex flex-col items-start rounded-lg border p-2 transition-all ${
                              isSelected
                                ? 'border-gold-400 bg-gold-400/15'
                                : slot.is_available
                                  ? 'border-forest-500 bg-forest-700 hover:border-gold-400/50'
                                  : 'border-forest-600 bg-forest-800/40 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-[11px] font-medium text-cream">
                              {formatTimeRange(slot.start_time, slot.end_time)}
                            </span>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gold-400">
                                {formatCurrency(slot.price)}
                              </span>
                              {slot.is_peak && (
                                <span className="text-[8px] font-semibold uppercase text-gold-300">
                                  Peak
                                </span>
                              )}
                            </div>
                            {isSelected && <Check className="mt-0.5 h-3 w-3 text-gold-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Details Form — compact */}
            <div ref={formRef} className="card p-3 scroll-mt-20 sm:p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold-400">
                Your Details
              </h2>
              <form id="bookingForm" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
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
                  placeholder="juan@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Textarea
                  label="Notes (optional)"
                  rows={2}
                  placeholder="Any special requests or instructions..."
                  {...register('notes')}
                />

                {/* Inline submit — hidden on mobile in favor of the sticky bar,
                    still present for desktop / no-JS-scroll fallback */}
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  isLoading={submitting}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="hidden lg:flex"
                >
                  Proceed to Checkout
                </Button>

                {submitError && (
                  <p className="rounded-lg bg-error/10 p-2 text-xs text-error">{submitError}</p>
                )}
              </form>
            </div>
          </div>

          {/* Right: Booking Summary — desktop only, sticky */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24">
              <div className="card p-4">
                <h2 className="mb-3 font-display text-base font-bold text-cream">Booking Summary</h2>

                {selectedCourt && (
                  <div className="mb-3 rounded-lg bg-forest-800 p-2.5">
                    <p className="text-[10px] text-cream-muted">Court</p>
                    <p className="text-sm font-semibold text-cream">{selectedCourt.name}</p>
                    <p className="text-[10px] text-cream-muted">{formatDate(selectedDate)}</p>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {selectedSlots.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-6 text-center"
                    >
                      <Clock className="mx-auto h-7 w-7 text-cream-muted/40" />
                      <p className="mt-2 text-xs text-cream-muted">
                        Select time slots to see your summary
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="slots"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5"
                    >
                      {selectedSlots.map((slot) => (
                        <div
                          key={slot.slot_id}
                          className="flex items-center justify-between rounded-lg bg-forest-800 p-2"
                        >
                          <div>
                            <p className="text-xs font-medium text-cream">
                              {formatTimeRange(slot.start_time, slot.end_time)}
                            </p>
                            {slot.type === 'fixed_2hr' && (
                              <span className="text-[9px] font-semibold text-gold-400">
                                {FIXED_SLOT.label}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gold-400">
                            {formatCurrency(slot.price)}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedSlots.length > 0 && (
                  <>
                    <div className="mt-3 border-t border-forest-500 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-cream-muted">
                          {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-xl font-bold text-gold-400">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      fullWidth
                      className="mt-3"
                      isLoading={submitting}
                      onClick={handleSummaryButtonClick}
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-3 rounded-lg border border-forest-500 bg-forest-700/50 p-3">
                <p className="text-[11px] text-cream-muted">
                  <span className="font-semibold text-gold-300">Tip:</span> The 4–6 PM slot is our
                  best value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile bar — always visible, shows running total, drives the single
          submission path (handleSummaryButtonClick), no duplicate DOM-reading logic */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-500 bg-charcoal/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {selectedSlots.length > 0 ? (
              <>
                <p className="text-[10px] text-cream-muted">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                </p>
                <p className="text-lg font-bold text-gold-400">{formatCurrency(total)}</p>
              </>
            ) : (
              <p className="text-xs text-cream-muted">Select a time slot to continue</p>
            )}
          </div>
          <Button
            size="md"
            isLoading={submitting}
            onClick={handleSummaryButtonClick}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="flex-shrink-0"
          >
            {selectedSlots.length > 0 ? 'Checkout' : 'Select Slots'}
          </Button>
        </div>
        {submitError && (
          <p className="mt-2 rounded-lg bg-error/10 p-2 text-xs text-error">{submitError}</p>
        )}
      </div>

      <Footer />
    </div>
  );
}

export type { CustomerDetails };