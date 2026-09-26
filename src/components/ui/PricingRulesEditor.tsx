// src/components/ui/PricingRulesEditor.tsx
import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Clock, CloudSun, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdminStore } from '@/stores/adminStore';
import { apiRequest } from '@/services/api';
import { formatCurrency } from '@/utils/format';
import type { DayOfWeek, PricingRule, TimeSlot } from '@/types';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

interface EditorForm {
  id: string | null;
  label: string;
  days: DayOfWeek[];
  start_time: string;
  end_time: string;
  price_per_hour: number | '';
  priority: number | '';
}

const EMPTY_FORM: EditorForm = {
  id: null,
  label: '',
  days: [],
  start_time: '',
  end_time: '',
  price_per_hour: '',
  priority: 0,
};

function formatTimeShort(time: string): string {
  if (!time) return '';
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return minute === 0
    ? `${hour12}${ampm}`
    : `${hour12}:${String(minute).padStart(2, '0')}${ampm}`;
}

/**
 * Group intervals by period (morning / afternoon / evening), deduping
 * identical start-end pairs across the day.
 */
function groupSlotsByPeriod(slots: TimeSlot[]) {
  const morningMap = new Map<string, { start_time: string; end_time: string }>();
  const afternoonMap = new Map<string, { start_time: string; end_time: string }>();
  const eveningMap = new Map<string, { start_time: string; end_time: string }>();

  slots.forEach((slot) => {
    if (!slot.start_time || !slot.end_time) return;
    const hour = parseInt(slot.start_time.split(':')[0], 10);
    const key = `${slot.start_time}-${slot.end_time}`;
    const obj = { start_time: slot.start_time, end_time: slot.end_time };

    if (hour < 12) morningMap.set(key, obj);
    else if (hour < 17) afternoonMap.set(key, obj);
    else eveningMap.set(key, obj);
  });

  const sortFn = (a: { start_time: string }, b: { start_time: string }) =>
    a.start_time.localeCompare(b.start_time);

  return {
    morning: Array.from(morningMap.values()).sort(sortFn),
    afternoon: Array.from(afternoonMap.values()).sort(sortFn),
    evening: Array.from(eveningMap.values()).sort(sortFn),
  };
}

export function PricingRulesEditor({ courtId }: { courtId: string }) {
  const court = useAdminStore((s) => s.courts.find((c) => c.id === courtId));
  const loadPricingRules = useAdminStore((s) => s.loadPricingRules);
  const addPricingRule = useAdminStore((s) => s.addPricingRule);
  const editPricingRule = useAdminStore((s) => s.editPricingRule);
  const removePricingRule = useAdminStore((s) => s.removePricingRule);

  const [form, setForm] = useState<EditorForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Slot picker state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    if (courtId) loadPricingRules(courtId).catch(() => {});
  }, [courtId, loadPricingRules]);

  // Fetch this court's availability for today so the picker shows real intervals.
  // Backend route: GET /api/courts/{id}/availability?date=YYYY-MM-DD
  useEffect(() => {
    if (!courtId) return;
    let cancelled = false;

    (async () => {
      setLoadingSlots(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const res = await apiRequest<any>(
          `/api/courts/${courtId}/availability?date=${today}`
        );
        const rawList = Array.isArray(res) ? res : res?.data ?? [];

        const normalized: TimeSlot[] = rawList.map((item: any) => ({
          id: item.id ?? '',
          court_id: item.courtId ?? item.court_id ?? courtId,
          date: item.date ?? today,
          start_time: item.startTime ?? item.start_time ?? '',
          end_time: item.endTime ?? item.end_time ?? '',
          type: 'standard',
          price: Number(item.price ?? 0),
          is_available: item.isAvailable ?? item.is_available ?? true,
          is_peak: item.isPeak ?? item.is_peak ?? false,
        }));

        if (!cancelled) setSlots(normalized);
      } catch (err) {
        if (!cancelled) setSlots([]);
        console.warn('[PricingRulesEditor] Slot fetch failed:', err);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courtId]);

  const { morning, afternoon, evening } = useMemo(
    () => groupSlotsByPeriod(slots),
    [slots]
  );

  const allIntervals = useMemo(
    () => [...morning, ...afternoon, ...evening],
    [morning, afternoon, evening]
  );

  const rules = court?.pricing_rules ?? [];

  const openCreate = () => {
    setLocalError(null);
    setManualMode(false);
    setForm({ ...EMPTY_FORM });
  };

  const openEdit = (rule: PricingRule) => {
    setLocalError(null);
    setManualMode(false);
    setForm({
      id: rule.id,
      label: rule.label,
      days: rule.days
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter((d): d is DayOfWeek => DAYS.some((x) => x.key === d)),
      start_time: rule.start_time,
      end_time: rule.end_time,
      price_per_hour: rule.price_per_hour,
      priority: rule.priority,
    });
  };

  const close = () => {
    if (saving) return;
    setForm(null);
    setLocalError(null);
    setManualMode(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    if (!form) return;
    const has = form.days.includes(day);
    setForm({
      ...form,
      days: has ? form.days.filter((d) => d !== day) : [...form.days, day],
    });
  };

  const selectEveryDay = () => {
    if (!form) return;
    setForm({ ...form, days: DAYS.map((d) => d.key) });
  };

  const clearDays = () => {
    if (!form) return;
    setForm({ ...form, days: [] });
  };

  // ─── Slot range logic ────────────────────────────────────────

  const isInRange = (
    start: string,
    end: string,
    interval: { start_time: string; end_time: string }
  ): boolean => {
    if (!start) return false;
    if (!end || start === end) {
      return interval.start_time === start;
    }
    return interval.start_time >= start && interval.end_time <= end;
  };

  /**
   * Click behavior:
   *  - Nothing selected → this pill becomes start & end.
   *  - Clicking the current start pill → clear selection.
   *  - Clicking a later pill than start → extends end to that pill.
   *  - Clicking an earlier pill than start → shifts start earlier.
   *  - The range always stays continuous — every pill between start and
   *    end is highlighted automatically.
   */
  const handleSlotClick = (interval: { start_time: string; end_time: string }) => {
    if (!form) return;
    const s = form.start_time;
    const e = form.end_time;
    const clickedStart = interval.start_time;
    const clickedEnd = interval.end_time;

    // Nothing selected yet → start here
    if (!s) {
      setForm({ ...form, start_time: clickedStart, end_time: clickedEnd });
      return;
    }

    // Clicking the current start pill → clear
    if (s === clickedStart && e === clickedEnd) {
      setForm({ ...form, start_time: '', end_time: '' });
      return;
    }

    // Clicked after current start → extend end
    if (clickedStart > s) {
      setForm({ ...form, start_time: s, end_time: clickedEnd });
      return;
    }

    // Clicked before current start → shift start earlier
    if (clickedStart < s) {
      setForm({
        ...form,
        start_time: clickedStart,
        end_time: e || clickedEnd,
      });
      return;
    }

    // Fallback: same start time
    setForm({ ...form, start_time: s, end_time: clickedEnd });
  };

  const selectWholeDay = () => {
    if (!form || allIntervals.length === 0) return;
    const first = allIntervals.reduce(
      (min, x) => (x.start_time < min.start_time ? x : min),
      allIntervals[0]
    );
    const last = allIntervals.reduce(
      (max, x) => (x.end_time > max.end_time ? x : max),
      allIntervals[0]
    );
    setForm({ ...form, start_time: first.start_time, end_time: last.end_time });
  };

  const selectMorning = () => {
    if (!form || morning.length === 0) return;
    const first = morning[0];
    const last = morning[morning.length - 1];
    setForm({ ...form, start_time: first.start_time, end_time: last.end_time });
  };

  const selectAfternoon = () => {
    if (!form || afternoon.length === 0) return;
    const first = afternoon[0];
    const last = afternoon[afternoon.length - 1];
    setForm({ ...form, start_time: first.start_time, end_time: last.end_time });
  };

  const selectEvening = () => {
    if (!form || evening.length === 0) return;
    const first = evening[0];
    const last = evening[evening.length - 1];
    setForm({ ...form, start_time: first.start_time, end_time: last.end_time });
  };

  const clearRange = () => {
    if (!form) return;
    setForm({ ...form, start_time: '', end_time: '' });
  };

  const handleSubmit = async () => {
    if (!form) return;
    setLocalError(null);

    if (!form.label.trim()) {
      setLocalError('Please enter a label (e.g. "Weekend All Day").');
      return;
    }
    if (!form.start_time || !form.end_time) {
      setLocalError('Please pick a start and end time.');
      return;
    }
    if (form.end_time <= form.start_time) {
      setLocalError('End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        days: form.days.join(','),
        start_time: form.start_time,
        end_time: form.end_time,
        price_per_hour: Number(form.price_per_hour) || 0,
        priority: Number(form.priority) || 0,
      };

      if (form.id) {
        await editPricingRule(form.id, payload);
      } else {
        await addPricingRule(courtId, payload);
      }
      setForm(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule: PricingRule) => {
    if (!confirm(`Delete pricing rule "${rule.label}"?`)) return;
    try {
      await removePricingRule(courtId, rule.id);
    } catch {
      // store surfaces error
    }
  };

  const formatDays = (csv: string): string => {
    if (!csv.trim()) return 'Every day';
    const parts = csv.split(',').map((d) => d.trim().toLowerCase());
    if (parts.length === 7) return 'Every day';
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
  };

  const formatRange = (start: string, end: string) =>
    `${formatTimeShort(start)} – ${formatTimeShort(end)}`;

  // ─── Render ──────────────────────────────────────────────────

  const renderSlotGroup = (
    title: string,
    icon: React.ReactNode,
    intervals: { start_time: string; end_time: string }[]
  ) => {
    if (intervals.length === 0) return null;
    return (
      <div key={title}>
        <div className="mb-2 flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-wider text-court-300">
            {title}
          </span>
          <div className="h-px flex-1 bg-forest-700/60" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {intervals.map((it) => {
            const active = form ? isInRange(form.start_time, form.end_time, it) : false;
            return (
              <button
                key={`${it.start_time}-${it.end_time}`}
                type="button"
                onClick={() => handleSlotClick(it)}
                className={`flex h-9 items-center justify-center rounded-lg border px-1.5 text-[11px] font-semibold tracking-tight transition-all ${
                  active
                    ? 'border-court-300 bg-court-600 text-white shadow-glow-court'
                    : 'border-forest-700/80 bg-forest-950/60 text-cream-muted hover:border-court-400/50 hover:text-cream'
                }`}
              >
                {formatTimeShort(it.start_time)}–{formatTimeShort(it.end_time)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-5 border-t border-forest-700/80 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-blue-300">
            Day-Based Pricing Rules
          </p>
          <p className="text-[11px] text-cream-muted">
            Override the base rate for specific days and time windows.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={openCreate}
        >
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-forest-700/80 bg-forest-950/40 p-4 text-center text-xs text-cream-muted">
          No rules yet. Base and peak prices above apply to all slots.
        </div>
      ) : (
        <div className="space-y-2">
          {rules
            .slice()
            .sort((a, b) => b.priority - a.priority)
            .map((rule) => (
              <div
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest-700/80 bg-forest-950/60 px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 shrink-0 text-brand-blue-300" />
                    <span className="truncate text-sm font-bold text-cream">
                      {rule.label}
                    </span>
                    {rule.priority > 0 && (
                      <span className="rounded-md border border-brand-blue-400/40 bg-brand-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-blue-200">
                        P{rule.priority}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-cream-muted">
                    {formatDays(rule.days)} · {formatTimeShort(rule.start_time)}–
                    {formatTimeShort(rule.end_time)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-display text-base font-bold text-brand-blue-300">
                    {formatCurrency(rule.price_per_hour)}
                    <span className="text-[10px] font-normal text-cream-muted">/hr</span>
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(rule)}
                    className="rounded-lg border border-forest-600 bg-forest-800 p-1.5 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300 active:scale-95"
                    title="Edit rule"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule)}
                    className="rounded-lg border border-forest-600 bg-forest-800 p-1.5 text-cream-muted transition hover:border-red-400 hover:text-red-400 active:scale-95"
                    title="Delete rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {form && (
        <Modal
          isOpen={!!form}
          onClose={close}
          title={form.id ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Label"
              placeholder='e.g. "Saturday All Day", "Weekday Peak"'
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />

            {/* ─── Days ─── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  Days
                </p>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={selectEveryDay}
                    className="text-brand-blue-300 underline hover:text-brand-blue-200"
                  >
                    Every day
                  </button>
                  <button
                    type="button"
                    onClick={clearDays}
                    className="text-cream-muted underline hover:text-cream"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => {
                  const isSelected = form.days.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`min-w-[52px] rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? 'border-brand-blue-400 bg-brand-blue-500 text-white'
                          : 'border-forest-700/80 bg-forest-950/60 text-cream-muted hover:border-brand-blue-400/40 hover:text-cream'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-cream-muted">
                Leave all off to apply this rule to <strong>every day</strong>.
              </p>
            </div>

            {/* ─── Time Range ─── */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  Time Range
                </p>
                <button
                  type="button"
                  onClick={() => setManualMode((m) => !m)}
                  className="text-[11px] text-brand-blue-300 underline hover:text-brand-blue-200"
                >
                  {manualMode ? 'Pick from slots' : 'Enter manually'}
                </button>
              </div>

              {/* Selected range preview + quick presets */}
              <div className="mb-3 rounded-lg border border-brand-blue-500/30 bg-brand-blue-500/10 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-brand-blue-300" />
                  {form.start_time && form.end_time ? (
                    <span className="font-semibold text-cream">
                      {formatRange(form.start_time, form.end_time)}
                    </span>
                  ) : (
                    <span className="text-cream-muted">
                      Tap a slot to set the start, then tap later slots to extend.
                    </span>
                  )}
                </div>

                {!manualMode && allIntervals.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={selectWholeDay}
                      className="rounded-lg border border-brand-blue-400/40 bg-brand-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-brand-blue-200 transition hover:bg-brand-blue-500/25"
                    >
                      Whole day
                    </button>
                    {morning.length > 0 && (
                      <button
                        type="button"
                        onClick={selectMorning}
                        className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2.5 py-1 text-[11px] text-cream-muted transition hover:border-court-400/40 hover:text-cream"
                      >
                        Morning
                      </button>
                    )}
                    {afternoon.length > 0 && (
                      <button
                        type="button"
                        onClick={selectAfternoon}
                        className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2.5 py-1 text-[11px] text-cream-muted transition hover:border-court-400/40 hover:text-cream"
                      >
                        Afternoon
                      </button>
                    )}
                    {evening.length > 0 && (
                      <button
                        type="button"
                        onClick={selectEvening}
                        className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2.5 py-1 text-[11px] text-cream-muted transition hover:border-court-400/40 hover:text-cream"
                      >
                        Evening
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearRange}
                      className="rounded-lg border border-forest-700/80 bg-forest-950/60 px-2.5 py-1 text-[11px] text-cream-muted transition hover:text-error"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {manualMode ? (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Input
                    label="Start Time"
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
              ) : loadingSlots ? (
                <div className="rounded-xl border border-forest-700/80 bg-forest-950/40 py-6 text-center">
                  <LoadingSpinner />
                </div>
              ) : allIntervals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-forest-700/80 bg-forest-950/40 p-4 text-center text-xs text-cream-muted">
                  No time slots found for this court.{' '}
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className="text-brand-blue-300 underline"
                  >
                    Enter manually
                  </button>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-forest-700/80 bg-forest-950/40 p-3.5">
                  {renderSlotGroup(
                    'Morning',
                    <CloudSun className="h-3.5 w-3.5 text-court-300" />,
                    morning
                  )}
                  {renderSlotGroup(
                    'Afternoon',
                    <Sun className="h-3.5 w-3.5 text-court-300" />,
                    afternoon
                  )}
                  {renderSlotGroup(
                    'Evening',
                    <Moon className="h-3.5 w-3.5 text-court-300" />,
                    evening
                  )}
                </div>
              )}
            </div>

            {/* ─── Price & Priority ─── */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Input
                label="Price per Hour"
                type="number"
                inputMode="decimal"
                min="0"
                value={form.price_per_hour === '' ? '' : form.price_per_hour}
                onChange={(e) => {
                  const raw = e.target.value;
                  setForm({
                    ...form,
                    price_per_hour: raw === '' ? '' : Number(raw),
                  });
                }}
                onFocus={(e) => e.target.select()}
                leftIcon={<span className="text-xs font-bold text-brand-blue-300">₱</span>}
              />
              <Input
                label="Priority"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.priority === '' ? '' : form.priority}
                onChange={(e) => {
                  const raw = e.target.value;
                  setForm({
                    ...form,
                    priority: raw === '' ? '' : Number(raw),
                  });
                }}
                onFocus={(e) => e.target.select()}
                hint="Higher wins on overlap. Default 0."
              />
            </div>

            {localError && (
              <div className="rounded-xl border border-error/30 bg-error/10 p-2.5 text-xs text-error">
                {localError}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-1">
              <Button
                size="md"
                fullWidth
                isLoading={saving}
                onClick={handleSubmit}
              >
                {form.id ? 'Save Changes' : 'Create Rule'}
              </Button>
              <Button
                size="md"
                variant="ghost"
                fullWidth
                className="sm:w-auto"
                onClick={close}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}