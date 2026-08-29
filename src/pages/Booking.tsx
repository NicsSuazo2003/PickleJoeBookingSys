import { useEffect, useState } from 'react';
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
    selectCourt,
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

  const weekStart = addDays(new Date(), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const storeState = useBookingStore();
  const selectedSlots = getSelectedSlotItems(storeState);
  const total = getSelectedTotal(storeState);

  const fixedSlots = slots.filter((s) => s.type === 'fixed_2hr');
  const standardSlots = slots.filter((s) => s.type !== 'fixed_2hr');

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

      <div className="container-page pt-24 pb-12">
        <div className="mb-8">
          <h1 className="section-title">Book a Court</h1>
          <p className="mt-2 text-cream-muted">
            Select your court, date, and time slots to get started.
          </p>
        </div>

        {/* Court Selector */}
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-400">
            <MapPin className="h-4 w-4" />
            Choose Your Court
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {courts.map((court) => {
              const isSelected = selectedCourt?.id === court.id;
              return (
                <button
                  key={court.id}
                  type="button"
                  onClick={() => selectCourt(court)}
                  className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-gold-400 shadow-glow-gold'
                      : 'border-forest-500 hover:border-gold-400/50'
                  }`}
                >
                  <div className="relative h-32 overflow-hidden bg-forest-900">
                    <img
                      src={court.image}
                      alt={court.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950 to-transparent" />
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-forest-950">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="bg-forest-700 p-4">
                    <h3 className="font-display text-base font-bold text-cream">{court.name}</h3>
                    <p className="mt-1 text-xs text-cream-muted line-clamp-1">{court.surface || court.description}</p>
                    <p className="mt-2 text-sm font-semibold text-gold-400">
                      {formatCurrency(court.price_per_hour)}
                      <span className="text-xs font-normal text-cream-muted">/hr</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Date + Slots + Customer Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date Picker */}
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-400">
                  <CalendarDays className="h-4 w-4" />
                  Select Date
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w - 1)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300 disabled:opacity-30"
                    disabled={weekOffset === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-cream-muted">
                    {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} Week${weekOffset > 1 ? 's' : ''}` : 'Past'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
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
                      className={`flex flex-col items-center rounded-xl border py-3 transition-all ${
                        isSelected
                          ? 'border-gold-400 bg-gold-400 text-forest-950'
                          : isPast
                            ? 'border-forest-600 bg-forest-800/50 text-cream-muted/40 cursor-not-allowed'
                            : 'border-forest-500 bg-forest-700 text-cream hover:border-gold-400/50'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="mt-0.5 text-lg font-bold">{day.getDate()}</span>
                      {isToday && !isSelected && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-gold-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gold-400">
                  <Clock className="h-4 w-4" />
                  Available Time Slots
                </h2>
                <span className="text-xs text-cream-muted">{formatDateLong(selectedDate)}</span>
              </div>

              {loadingSlots ? (
                <LoadingSpinner className="py-12" />
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-error">{error}</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarDays className="mx-auto h-10 w-10 text-cream-muted/40" />
                  <p className="mt-3 text-sm text-cream-muted">
                    No available time slots found for this court on this date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
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
                          className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                            isSelected
                              ? 'border-gold-400 bg-gold-400/15 shadow-glow-gold'
                              : slot.is_available
                                ? 'border-gold-400/40 bg-gradient-to-r from-forest-700 to-forest-800 hover:border-gold-400'
                                : 'border-forest-600 bg-forest-800/40 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/20">
                              <Sparkles className="h-5 w-5 text-gold-400" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-base font-bold text-cream">
                                  {formatTimeRange(slot.start_time, slot.end_time)}
                                </span>
                                <span className="badge bg-gold-400 text-forest-950">
                                  {FIXED_SLOT.label}
                                </span>
                              </div>
                              <p className="text-xs text-cream-muted">
                                2 hours of prime afternoon play
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gold-400">
                              {formatCurrency(slot.price)}
                            </span>
                            {isSelected && <Check className="h-5 w-5 text-gold-400" />}
                          </div>
                        </button>
                      );
                    })}

                  {/* Standard 1hr Slots */}
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cream-muted">
                      Standard 1-Hour Slots
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {standardSlots.map((slot) => {
                        const isSelected = selectedSlotIds.includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => slot.is_available && toggleSlot(slot.id)}
                            disabled={!slot.is_available}
                            className={`flex flex-col items-start rounded-xl border p-3 transition-all ${
                              isSelected
                                ? 'border-gold-400 bg-gold-400/15'
                                : slot.is_available
                                  ? 'border-forest-500 bg-forest-700 hover:border-gold-400/50'
                                  : 'border-forest-600 bg-forest-800/40 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-xs font-medium text-cream">
                              {formatTimeRange(slot.start_time, slot.end_time)}
                            </span>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-sm font-bold text-gold-400">
                                {formatCurrency(slot.price)}
                              </span>
                              {slot.is_peak && (
                                <span className="text-[9px] font-semibold uppercase text-gold-300">
                                  Peak
                                </span>
                              )}
                            </div>
                            {isSelected && <Check className="mt-1 h-3.5 w-3.5 text-gold-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Details Form */}
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
                Your Details
              </h2>
              <form id="bookingForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder="Juan Dela Cruz"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="0917 123 4567"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="juan@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Textarea
                  label="Notes (optional)"
                  rows={3}
                  placeholder="Any special requests or instructions..."
                  {...register('notes')}
                />
              </form>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="card p-5">
                <h2 className="mb-4 font-display text-lg font-bold text-cream">
                  Booking Summary
                </h2>

                {selectedCourt && (
                  <div className="mb-4 rounded-xl bg-forest-800 p-3">
                    <p className="text-xs text-cream-muted">Court</p>
                    <p className="font-semibold text-cream">{selectedCourt.name}</p>
                    <p className="text-xs text-cream-muted">{formatDate(selectedDate)}</p>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {selectedSlots.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 text-center"
                    >
                      <Clock className="mx-auto h-8 w-8 text-cream-muted/40" />
                      <p className="mt-2 text-sm text-cream-muted">
                        Select time slots to see your summary
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="slots"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      {selectedSlots.map((slot) => (
                        <div
                          key={slot.slot_id}
                          className="flex items-center justify-between rounded-lg bg-forest-800 p-2.5"
                        >
                          <div>
                            <p className="text-xs font-medium text-cream">
                              {formatTimeRange(slot.start_time, slot.end_time)}
                            </p>
                            {slot.type === 'fixed_2hr' && (
                              <span className="text-[10px] font-semibold text-gold-400">
                                {FIXED_SLOT.label}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-gold-400">
                            {formatCurrency(slot.price)}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedSlots.length > 0 && (
                  <>
                    <div className="mt-4 border-t border-forest-500 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cream-muted">
                          {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                        </span>
                        <span className="font-display text-2xl font-bold text-gold-400">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      form="bookingForm"
                      size="lg"
                      fullWidth
                      className="mt-4"
                      isLoading={submitting}
                      rightIcon={<ArrowRight className="h-5 w-5" />}
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                )}

                {submitError && (
                  <p className="mt-3 rounded-lg bg-error/10 p-2 text-xs text-error">
                    {submitError}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-forest-500 bg-forest-700/50 p-4">
                <p className="text-xs text-cream-muted">
                  <span className="font-semibold text-gold-300">Tip:</span> The 4:00 PM - 6:00 PM
                  slot is our best value — 2 hours of prime play time at a special rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export type { CustomerDetails };