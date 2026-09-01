import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock,
  Sparkles,
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
    loadingCourts,
    error,
    loadCourts,
    setCustomer,
    createBooking,
  } = useBookingStore();

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

  // Auto-scroll to the form on mount — the person is coming straight from
  // picking their slots on the landing page, so jump them to what's new here.
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

  const handleSummaryButtonClick = () => {
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

  // Nothing selected (direct link, refresh, or back navigation that cleared
  // state) — send them back to the picker instead of showing an empty form.
  if (!selectedCourt || selectedSlots.length === 0) {
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
    <div className="min-h-screen bg-charcoal">
      <Navbar />

      <div className="container-page pt-20 pb-24 lg:pb-12">
        <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
          <div>
            <h1 className="text-xl font-bold text-cream sm:text-2xl">Confirm & Book</h1>
            <p className="text-xs text-cream-muted sm:text-sm">
              Review your selection, then enter your details.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-error/10 p-3 text-xs text-error">{error}</div>
        )}

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* Left: Selection summary + form */}
          <div className="space-y-4 lg:col-span-2">
            {/* Selection Summary — read-only, editable via link back to landing */}
            <div className="card p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Your Selection
                </h2>
                <Link
                  to="/"
                  className="flex items-center gap-1 text-[11px] font-semibold text-cream-muted underline decoration-dotted transition hover:text-gold-300"
                >
                  <Pencil className="h-3 w-3" />
                  Edit selection
                </Link>
              </div>

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
                    {formatDateLong(selectedDate)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                {selectedSlots.map((slot) => (
                  <div
                    key={slot.slot_id}
                    className="flex items-center justify-between rounded-lg bg-forest-800 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-cream-muted" />
                      <span className="text-xs font-medium text-cream sm:text-sm">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                      {slot.type === 'fixed_2hr' && (
                        <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[9px] font-bold text-forest-950">
                          {FIXED_SLOT.label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gold-400 sm:text-sm">
                      {formatCurrency(slot.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-forest-600 pt-3">
                <span className="text-xs text-cream-muted">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                </span>
                <span className="font-display text-lg font-bold text-gold-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Customer Details Form */}
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

                {/* Inline submit — hidden on mobile in favor of the sticky bar */}
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

          {/* Right: Booking Summary — desktop only, sticky (mirrors the left
              summary, kept visible while filling the form) */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-24">
              <div className="card p-4">
                <h2 className="mb-3 font-display text-base font-bold text-cream">Booking Summary</h2>

                <div className="mb-3 rounded-lg bg-forest-800 p-2.5">
                  <p className="text-[10px] text-cream-muted">Court</p>
                  <p className="text-sm font-semibold text-cream">{selectedCourt.name}</p>
                  <p className="text-[10px] text-cream-muted">{formatDateLong(selectedDate)}</p>
                </div>

                <AnimatePresence mode="popLayout">
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
                </AnimatePresence>

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

      {/* Sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-500 bg-charcoal/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-cream-muted">
              {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
            </p>
            <p className="text-lg font-bold text-gold-400">{formatCurrency(total)}</p>
          </div>
          <Button
            size="md"
            isLoading={submitting}
            onClick={handleSummaryButtonClick}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="flex-shrink-0"
          >
            Checkout
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