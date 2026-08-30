import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Save, TrendingUp, Clock } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdminStore } from '@/stores/adminStore';
import { formatCurrency } from '@/utils/format';
import type { Court, PricingRule } from '@/types';

export function Pricing() {
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateCourt = useAdminStore((state) => state.updateCourt);

  const [rules, setRules] = useState<Record<string, PricingRule>>({});

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    const initial: Record<string, PricingRule> = {};
    courts.forEach((c) => {
      if (!c) return; // ✅ Skip if court is undefined
      initial[c.id] = {
        court_id: c.id,
        peak_start: '17:00',
        peak_end: '21:00',
        peak_price: c.peak_price_per_hour || 0,
        off_peak_price: c.price_per_hour || 0,
        weekend_multiplier: 1.0,
      };
    });
    setRules(initial);
  }, [courts]);

  const updateRule = (courtId: string, field: keyof PricingRule, value: string | number) => {
    setRules((prev) => ({
      ...prev,
      [courtId]: { ...prev[courtId], [field]: value },
    }));
  };

  const handleSave = async (court: Court) => {
    if (!court) return; // ✅ Skip if court is undefined
    const rule = rules[court.id];
    if (!rule) return;
    await updateCourt({
      ...court,
      price_per_hour: rule.off_peak_price,
      peak_price_per_hour: rule.peak_price,
    });
  };

  return (
    <AdminLayout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Pricing Rules</h1>
          <p className="mt-1 text-sm text-cream-muted">
            Set dynamic pricing for peak and off-peak hours per court
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="space-y-6">
            {courts.map((court, i) => {
              // ✅ Skip if court is undefined or null
              if (!court) return null;
              
              const rule = rules[court.id];
              if (!rule) return null;
              
              return (
                <motion.div
                  key={court.id || `court-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10">
                      <Tag className="h-5 w-5 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-cream">{court?.name || 'Unnamed Court'}</h3>
                      <p className="text-xs text-cream-muted">
                        Current: {formatCurrency(court?.price_per_hour || 0)}/hr off-peak,{' '}
                        {formatCurrency(court?.peak_price_per_hour || 0)}/hr peak
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Input
                      label="Off-Peak Price"
                      type="number"
                      value={rule.off_peak_price || 0}
                      onChange={(e) =>
                        updateRule(court.id, 'off_peak_price', Number(e.target.value))
                      }
                      leftIcon={<span className="text-xs">₱</span>}
                    />
                    <Input
                      label="Peak Price"
                      type="number"
                      value={rule.peak_price || 0}
                      onChange={(e) =>
                        updateRule(court.id, 'peak_price', Number(e.target.value))
                      }
                      leftIcon={<span className="text-xs">₱</span>}
                    />
                    <Input
                      label="Peak Start"
                      type="time"
                      value={rule.peak_start || '17:00'}
                      onChange={(e) => updateRule(court.id, 'peak_start', e.target.value)}
                      leftIcon={<Clock className="h-4 w-4" />}
                    />
                    <Input
                      label="Peak End"
                      type="time"
                      value={rule.peak_end || '21:00'}
                      onChange={(e) => updateRule(court.id, 'peak_end', e.target.value)}
                      leftIcon={<Clock className="h-4 w-4" />}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Weekend Multiplier"
                      type="number"
                      step="0.1"
                      value={rule.weekend_multiplier || 1.0}
                      onChange={(e) =>
                        updateRule(court.id, 'weekend_multiplier', Number(e.target.value))
                      }
                      leftIcon={<TrendingUp className="h-4 w-4" />}
                      hint="e.g. 1.2 for 20% weekend surcharge"
                    />
                    <div className="flex items-end">
                      <div className="w-full rounded-xl bg-forest-800 p-4">
                        <p className="text-xs text-cream-muted">Weekend Peak Price</p>
                        <p className="font-display text-xl font-bold text-gold-400">
                          {formatCurrency(
                            Math.round((rule.peak_price || 0) * (rule.weekend_multiplier || 1.0))
                          )}
                          <span className="text-xs font-normal text-cream-muted">/hr</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-forest-500 pt-4">
                    <Button
                      size="sm"
                      leftIcon={<Save className="h-4 w-4" />}
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
        <div className="mt-6 card border-gold-400/30 p-6">
          <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-gold-300">
            <Tag className="h-5 w-5" />
            2hr Fixed Slot (4:00 PM - 6:00 PM)
          </h3>
          <p className="text-sm text-cream-muted">
            This special slot is automatically priced at <strong className="text-gold-400">2x the off-peak hourly rate</strong> for each court.
            It replaces the individual 4-5 PM and 5-6 PM slots and cannot be combined with standard slots in that time range.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {courts.map((c) => {
              // ✅ Skip if court is undefined
              if (!c) return null;
              return (
                <div key={c.id} className="rounded-lg bg-forest-800 p-3">
                  <p className="text-xs text-cream-muted">{c?.name || 'Unnamed Court'}</p>
                  <p className="font-display text-lg font-bold text-gold-400">
                    {formatCurrency((c?.price_per_hour || 0) * 2)}
                  </p>
                  <p className="text-[10px] text-cream-muted">for 2 hours</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}