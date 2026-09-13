// src/pages/admin/StaffCreateBookingModal.tsx
import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAdminStore } from '@/stores/adminStore';
import { courtService } from '@/services/courtService';
import { formatCurrency, formatTimeRange, todayISO } from '@/utils/format';
import type { TimeSlot } from '@/types';

type PaymentMode = 'cash' | 'gcash' | 'pay_later' | 'free';

const PAYMENT_MODES: { value: PaymentMode; label: string; hint: string }[] = [
  { value: 'cash',       label: 'Cash',           hint: 'Paid now — booking confirmed immediately' },
  { value: 'gcash',      label: 'GCash',          hint: 'Pending — 15 min to upload proof' },
  { value: 'pay_later',  label: 'Pay on Arrival', hint: 'Pending — payment collected at the venue' },
  { value: 'free',       label: 'Free / Comp',    hint: 'No payment required — booking confirmed' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function StaffCreateBookingModal({ isOpen, onClose, onCreated }: Props) {
  const courts = useAdminStore((s) => s.courts);
  const loadCourts = useAdminStore((s) => s.loadCourts);
  const createManualBooking = useAdminStore((s) => s.createManualBooking);

  const [courtId, setCourtId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [amountOverride, setAmountOverride] = useState<string>('');
  const [sendConfirmation, setSendConfirmation] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load courts on first open
  useEffect(() => {
    if (isOpen && courts.length === 0) loadCourts();
  }, [isOpen, courts.length, loadCourts]);

  // Default court
  useEffect(() => {
    if (isOpen && !courtId && courts.length > 0) setCourtId(courts[0].id);
  }, [isOpen, courtId, courts]);

  // Load availability whenever court or date changes
  useEffect(() => {
    if (!isOpen || !courtId || !date) return;

    let cancelled = false;
    setLoadingSlots(true);
    setSelectedSlotIds([]);

    (async () => {
      try {
        const result = await courtService.getAvailability(courtId, date);
        if (!cancelled) setSlots(result.filter((s) => s.is_available));
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, courtId, date]);

  const reset = () => {
    setCourtId(courts[0]?.id || '');
    setDate(todayISO());
    setSlots([]);
    setSelectedSlotIds([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setStaffNotes('');
    setPaymentMode('cash');
    setAmountOverride('');
    setSendConfirmation(false);
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const toggleSlot = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  };

  const selectedSlots = slots.filter((s) => selectedSlotIds.includes(s.id));
  const autoAmount = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const effectiveAmount = amountOverride.trim() === '' ? autoAmount : Number(amountOverride) || 0;

  const handleSubmit = async () => {
    setError(null);

    if (!courtId) return setError('Please select a court');
    if (!date) return setError('Please pick a date');
    if (selectedSlotIds.length === 0) return setError('Please select at least one time slot');
    if (!customerName.trim()) return setError('Customer name is required');
    if (!customerPhone.trim()) return setError('Customer phone is required');
    if (sendConfirmation && !customerEmail.trim())
      return setError('Add an email address or turn off confirmation email');

    setSubmitting(true);
    try {
      await createManualBooking({
        court_id: courtId,
        date,
        slots: selectedSlots.map((s) => ({ start_time: s.start_time, end_time: s.end_time })),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim(),
        notes: notes.trim() || undefined,
        payment_mode: paymentMode,
        total_amount: amountOverride.trim() === '' ? undefined : effectiveAmount,
        staff_notes: staffNotes.trim() || undefined,
        send_confirmation: sendConfirmation,
      });

      onCreated();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Booking"
      size="lg"
    >
      <div className="space-y-4">
        {/* ─── Court + Date ─── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-cream">Court *</label>
            <select
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              className="input-field text-sm"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* ─── Slots ─── */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-cream">
            Available Slots *{' '}
            {loadingSlots && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}
          </label>

          {loadingSlots ? (
            <p className="text-xs text-cream-muted">Loading availability…</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-yellow-400">No slots available for this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {slots.map((slot) => {
                const selected = selectedSlotIds.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => toggleSlot(slot.id)}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition ${
                      selected
                        ? 'border-gold-400 bg-gold-400/15 text-gold-300'
                        : 'border-forest-500 text-cream-muted hover:border-gold-400/40'
                    }`}
                  >
                    {formatTimeRange(slot.start_time, slot.end_time)}
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlotIds.length > 0 && (
            <p className="mt-2 text-xs text-success">
              {selectedSlotIds.length} slot(s) selected — auto total {formatCurrency(autoAmount)}
            </p>
          )}
        </div>

        {/* ─── Customer ─── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Customer Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            label="Phone *"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Email (optional)"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </div>

        {/* ─── Payment Mode ─── */}
        <div>
          <label className="mb-2 block text-xs font-medium text-cream">Payment *</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_MODES.map((mode) => {
              const selected = paymentMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setPaymentMode(mode.value)}
                  className={`rounded-lg border p-2.5 text-left transition ${
                    selected
                      ? 'border-gold-400 bg-gold-400/10'
                      : 'border-forest-500 hover:border-gold-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${selected ? 'text-gold-300' : 'text-cream'}`}>
                      {mode.label}
                    </span>
                    {selected && <Check className="h-3.5 w-3.5 text-gold-400" />}
                  </div>
                  <p className="mt-0.5 text-[10px] text-cream-muted">{mode.hint}</p>
                </button>
              );
            })}
          </div>

          {paymentMode !== 'free' && (
            <div className="mt-2">
              <Input
                label="Amount override (optional)"
                type="number"
                min={0}
                step="0.01"
                placeholder={`Auto: ${formatCurrency(autoAmount)}`}
                value={amountOverride}
                onChange={(e) => setAmountOverride(e.target.value)}
              />
              <p className="mt-1 text-[10px] text-cream-muted">
                Leave blank to use the automatic total ({formatCurrency(effectiveAmount)})
              </p>
            </div>
          )}
        </div>

        {/* ─── Notes ─── */}
        <Textarea
          label="Customer notes (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Requests or preferences the customer mentioned"
        />
        <Textarea
          label="Staff notes (internal)"
          rows={2}
          value={staffNotes}
          onChange={(e) => setStaffNotes(e.target.value)}
          placeholder="e.g. Called at 3 PM, paid cash on arrival"
        />

        {/* ─── Confirmation email ─── */}
        <label className="flex items-center gap-2 text-xs text-cream">
          <input
            type="checkbox"
            checked={sendConfirmation}
            onChange={(e) => setSendConfirmation(e.target.checked)}
            className="h-4 w-4 accent-gold-400"
          />
          Send booking confirmation to the customer's email
        </label>

        {/* ─── Error ─── */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-error/10 p-2.5 text-xs text-error">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Buttons ─── */}
        <div className="flex flex-col gap-2 border-t border-forest-500 pt-4 sm:flex-row sm:gap-3">
          <Button
            fullWidth
            isLoading={submitting}
            onClick={handleSubmit}
          >
            Create Booking
          </Button>
          <Button variant="ghost" fullWidth className="sm:w-auto" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}