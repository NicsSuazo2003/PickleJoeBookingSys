import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  CalendarOff,
  Plus,
  Trash2,
  Save,
  Building2,
  CreditCard,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDateLong, todayISO, toISODate, addDays } from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';

export function Settings() {
  // ✅ Use individual selectors
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const blockedDates = useAdminStore((state) => state.blockedDates);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const loadBlockedDates = useAdminStore((state) => state.loadBlockedDates);
  const addBlockedDate = useAdminStore((state) => state.addBlockedDate);
  const removeBlockedDate = useAdminStore((state) => state.removeBlockedDate);

  const { user } = useAuthStore();

  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [blockDate, setBlockDate] = useState(toISODate(addDays(new Date(), 7)));
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    loadCourts();
    loadBlockedDates();
  }, []);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts]);

  const handleAddBlock = async () => {
    if (!selectedCourtId || !blockDate) return;
    await addBlockedDate({
      court_id: selectedCourtId,
      date: blockDate,
      reason: blockReason || 'Maintenance',
    });
    setBlockReason('');
  };

  const filteredBlocked = selectedCourtId
    ? blockedDates.filter((b) => b.court_id === selectedCourtId)
    : blockedDates;

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  return (
    <AdminLayout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Settings</h1>
          <p className="mt-1 text-sm text-cream-muted">
            Manage blocked dates, account info, and app configuration
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <SettingsIcon className="h-5 w-5 text-gold-400" />
                Account
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs text-cream-muted">Admin Name</p>
                  <p className="text-sm font-medium text-cream">{user?.name ?? 'Admin'}</p>
                </div>
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs text-cream-muted">Email</p>
                  <p className="text-sm font-medium text-cream">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* GCash Settings */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <CreditCard className="h-5 w-5 text-gold-400" />
                Payment Configuration
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="GCash Number"
                  value={APP_CONFIG.gcashNumber}
                  readOnly
                  hint="Contact support to change"
                />
                <Input
                  label="GCash Account Name"
                  value={APP_CONFIG.gcashAccountName}
                  readOnly
                  hint="Contact support to change"
                />
                <Input
                  label="Payment Timer (minutes)"
                  type="number"
                  value={APP_CONFIG.paymentTimerSeconds / 60}
                  readOnly
                  hint="15-minute default"
                />
                <Input
                  label="Demo Mode"
                  value={APP_CONFIG.demoMode ? 'Enabled' : 'Disabled'}
                  readOnly
                  hint="Toggle via VITE_DEMO_MODE env var"
                />
              </div>
            </div>

            {/* Blocked Dates */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <CalendarOff className="h-5 w-5 text-gold-400" />
                Blocked Dates
              </h2>
              <p className="mb-4 text-sm text-cream-muted">
                Block courts for maintenance, holidays, or events.
              </p>

              {/* Court selector */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-cream">Select Court</label>
                <div className="flex flex-wrap gap-2">
                  {courts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourtId(c.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        selectedCourtId === c.id
                          ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                          : 'border-forest-500 text-cream-muted hover:border-gold-400/40'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add blocked date form */}
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <Input
                  label="Date to Block"
                  type="date"
                  min={todayISO()}
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
                <Input
                  label="Reason"
                  placeholder="Maintenance, holiday, event..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    fullWidth
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={handleAddBlock}
                    disabled={!blockDate || !selectedCourtId}
                  >
                    Block Date
                  </Button>
                </div>
              </div>

              {/* Existing blocked dates */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-cream">
                  {selectedCourt ? `${selectedCourt.name} — ` : ''}Blocked Dates
                </p>
                {filteredBlocked.length === 0 ? (
                  <div className="rounded-xl bg-forest-800 py-8 text-center">
                    <CalendarOff className="mx-auto h-8 w-8 text-cream-muted/40" />
                    <p className="mt-2 text-sm text-cream-muted">No blocked dates for this court.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredBlocked.map((block) => (
                      <motion.div
                        key={block.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between rounded-xl bg-forest-800 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-cream">
                            {formatDateLong(block.date)}
                          </p>
                          <p className="text-xs text-cream-muted">{block.reason}</p>
                        </div>
                        <button
                          onClick={() => removeBlockedDate(block.id)}
                          className="rounded-lg border border-forest-500 p-2 text-cream-muted transition hover:border-error hover:text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* App Info */}
            <div className="card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-cream">App Information</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs text-cream-muted">App Name</p>
                  <p className="text-sm font-medium text-cream">{APP_CONFIG.name}</p>
                </div>
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs text-cream-muted">Established</p>
                  <p className="text-sm font-medium text-cream">Est. {APP_CONFIG.established}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}