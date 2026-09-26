import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Save, TrendingUp, Clock } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdminStore } from '@/stores/adminStore';
import { formatCurrency } from '@/utils/format';
import type { Court } from '@/types';
import { PricingRulesEditor } from '@/components/ui/PricingRulesEditor';


// Local form-state shape: numeric fields are strings while editing so the
// user can clear the field. Coerced to number on save.
interface PricingRuleForm {
  court_id: string;
  peak_start: string;
  peak_end: string;
  peak_price: number | '';
  off_peak_price: number | '';
  weekend_multiplier: number | '';
}

export function Pricing() {
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateCourt = useAdminStore((state) => state.updateCourt);

  const [rules, setRules] = useState<Record<string, PricingRuleForm>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  // Seed rules for any newly loaded court. Existing rules are PRESERVED so
  // that a background store update (e.g. after another court is saved) does
  // not wipe what the user is currently typing into a different court's form.
  useEffect(() => {
    setRules((prev) => {
      const next: Record<string, PricingRuleForm> = {};
      courts.forEach((c) => {
        if (!c) return;
        next[c.id] =
          prev[c.id] ?? {
            court_id: c.id,
            peak_start: '17:00',
            peak_end: '21:00',
            peak_price: c.peak_price_per_hour ?? 0,
            off_peak_price: c.price_per_hour ?? 0,
            weekend_multiplier: 1.0,
          };
      });
      return next;
    });
  }, [courts]);

  const updateRule = (
    courtId: string,
    field: keyof PricingRuleForm,
    value: string | number
  ) => {
    setRules((prev) => ({
      ...prev,
      [courtId]: { ...prev[courtId], [field]: value },
    }));
  };

  // Helper: only converts to Number, never coerces "" to 0
  const handleNumericChange = (
    courtId: string,
    field: keyof PricingRuleForm,
    raw: string
  ) => {
    if (raw === '') {
      updateRule(courtId, field, '');
      return;
    }
    const n = Number(raw);
    if (!Number.isNaN(n)) updateRule(courtId, field, n);
  };

  const handleSave = async (court: Court) => {
    if (!court) return;
    const rule = rules[court.id];
    if (!rule) return;

    setSavingId(court.id);
    try {
      await updateCourt({
        ...court,
        price_per_hour: Number(rule.off_peak_price) || 0,
        peak_price_per_hour: Number(rule.peak_price) || 0,
      });

      // After save, sync this court's rule from the freshly-updated store so
      // the "Active Rates" summary reflects exactly what the backend stored
      // (in case it normalized/rounded anything). This does NOT wipe other
      // courts' in-progress edits.
      const updated = useAdminStore.getState().courts.find((c) => c.id === court.id);
      if (updated) {
        setRules((prev) => ({
          ...prev,
          [court.id]: {
            ...prev[court.id],
            peak_price: updated.peak_price_per_hour ?? 0,
            off_peak_price: updated.price_per_hour ?? 0,
          },
        }));
      }
    } catch {
      // Store already recorded the error. Keep the user's input so they
      // can retry without retyping.
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="container-page py-6 sm:py-8 text-cream">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
            Pricing Rules
          </h1>
          <p className="mt-1 text-xs text-cream-muted sm:text-sm">
            Set dynamic pricing for peak and off-peak hours per court
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-16" />
        ) : courts.length === 0 ? (
          <div className="card rounded-2xl border border-forest-700/80 bg-forest-900/60 py-12 text-center shadow-xl backdrop-blur-sm">
            <Tag className="mx-auto h-12 w-12 text-cream-muted/40" />
            <p className="mt-4 text-sm font-medium text-cream-muted">
              No courts available to configure.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {courts.map((court, i) => {
              if (!court) return null;

              const rule = rules[court.id];
              if (!rule) return null;

              return (
                <motion.div
                  key={court.id || `court-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-6"
                >
                  <div className="mb-5 flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-blue-400/30 bg-brand-blue-500/20 text-brand-blue-300 shadow-inner">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-cream">
                        {court?.name || 'Unnamed Court'}
                      </h3>
                      <p className="text-xs text-cream-muted">
                        Active Rates:{' '}
                        <span className="font-semibold text-brand-blue-200">
                          {formatCurrency(Number(rule.off_peak_price) || 0)}/hr
                        </span>{' '}
                        off-peak ·{' '}
                        <span className="font-semibold text-brand-blue-200">
                          {formatCurrency(Number(rule.peak_price) || 0)}/hr
                        </span>{' '}
                        peak
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    <Input
                      label="Off-Peak Price"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={rule.off_peak_price === '' ? '' : rule.off_peak_price}
                      onChange={(e) =>
                        handleNumericChange(court.id, 'off_peak_price', e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      leftIcon={<span className="text-xs font-bold text-brand-blue-300">₱</span>}
                    />
                    <Input
                      label="Peak Price"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={rule.peak_price === '' ? '' : rule.peak_price}
                      onChange={(e) =>
                        handleNumericChange(court.id, 'peak_price', e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      leftIcon={<span className="text-xs font-bold text-brand-blue-300">₱</span>}
                    />
                    <Input
                      label="Peak Start Time"
                      type="time"
                      value={rule.peak_start || '17:00'}
                      onChange={(e) => updateRule(court.id, 'peak_start', e.target.value)}
                      leftIcon={<Clock className="h-4 w-4 text-brand-blue-300" />}
                    />
                    <Input
                      label="Peak End Time"
                      type="time"
                      value={rule.peak_end || '21:00'}
                      onChange={(e) => updateRule(court.id, 'peak_end', e.target.value)}
                      leftIcon={<Clock className="h-4 w-4 text-brand-blue-300" />}
                    />
                  </div>

                  <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                    <Input
                      label="Weekend Multiplier"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={rule.weekend_multiplier === '' ? '' : rule.weekend_multiplier}
                      onChange={(e) =>
                        handleNumericChange(court.id, 'weekend_multiplier', e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      leftIcon={<TrendingUp className="h-4 w-4 text-brand-blue-300" />}
                      hint="e.g. 1.2 for 20% weekend surcharge"
                    />
                    <div className="flex items-end">
                      <div className="w-full rounded-xl border border-forest-700/80 bg-forest-950/70 p-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cream-muted">
                          Calculated Weekend Peak Rate
                        </p>
                        <p className="font-display text-xl font-extrabold text-brand-blue-300">
                          {formatCurrency(
                            Math.round(
                              (Number(rule.peak_price) || 0) *
                                (Number(rule.weekend_multiplier) || 1.0)
                            )
                          )}
                          <span className="text-xs font-normal text-cream-muted"> / hr</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ─── Day-based pricing rules ─── */}
<PricingRulesEditor courtId={court.id} />

<div className="mt-5 border-t border-forest-700/80 pt-4">
  <Button
    size="sm"
    leftIcon={<Save className="h-4 w-4" />}
    isLoading={savingId === court.id}
    disabled={savingId !== null && savingId !== court.id}
    onClick={() => handleSave(court)}
  >
    Save Pricing
  </Button>
</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 2hr Fixed Slot Info */}
        <div className="mt-6 card rounded-2xl border border-brand-blue-500/40 bg-forest-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-brand-blue-300">
            <Tag className="h-5 w-5" />
            <h3 className="font-display text-lg font-bold text-cream">
              2hr Fixed Slot (4:00 PM – 6:00 PM)
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-cream-muted sm:text-sm">
            This special block is automatically priced at{' '}
            <strong className="font-semibold text-brand-blue-200">
              2x the off-peak hourly rate
            </strong>{' '}
            for each court. It replaces individual 4–5 PM and 5–6 PM slots and cannot be split or
            combined with standard hourly rates.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {courts.map((c) => {
              if (!c) return null;
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-forest-700/80 bg-forest-950/70 p-3.5"
                >
                  <p className="text-xs font-semibold text-cream-muted">
                    {c?.name || 'Unnamed Court'}
                  </p>
                  <p className="font-display text-xl font-extrabold text-brand-blue-300 mt-0.5">
                    {formatCurrency((c?.price_per_hour || 0) * 2)}
                  </p>
                  <p className="text-[10px] text-cream-muted/70">Fixed 2-hour rate</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}