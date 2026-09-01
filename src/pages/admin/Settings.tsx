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
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import { adminService } from '@/services/adminService';
import { formatDateLong, todayISO, toISODate, addDays } from '@/utils/format';
import { APP_CONFIG } from '@/utils/constants';
import type { ClientSettings } from '@/types';
import { StaffManagement } from '@/components/ui/StaffManagement';

export function Settings() {
  const { user } = useAuthStore(); // ✅ Get user for role check
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const blockedDates = useAdminStore((state) => state.blockedDates);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const loadBlockedDates = useAdminStore((state) => state.loadBlockedDates);
  const addBlockedDate = useAdminStore((state) => state.addBlockedDate);
  const removeBlockedDate = useAdminStore((state) => state.removeBlockedDate);

  const { updateProfile, changePassword } = useAuthStore();

  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [blockDate, setBlockDate] = useState(toISODate(addDays(new Date(), 7)));
  const [blockReason, setBlockReason] = useState('');

  // ── Profile form state ──────────────────────────────
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Password form state ─────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── GCash / client settings state ───────────────────
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashAccountName, setGcashAccountName] = useState('');
  const [savingGcash, setSavingGcash] = useState(false);
  const [gcashMsg, setGcashMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ✅ Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadCourts();
    loadBlockedDates();
    (async () => {
      try {
        const settings = await adminService.getSettings();
        setClientSettings(settings);
        setGcashNumber(settings.gcash_number ?? '');
        setGcashAccountName(settings.gcash_account_name ?? '');
      } catch (err) {
        console.error('Failed to load client settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourtId) {
      setSelectedCourtId(courts[0]?.id || '');
    }
  }, [courts]);

  useEffect(() => {
    setProfileName(user?.name ?? '');
    setProfileEmail(user?.email ?? '');
    setProfilePhone(user?.phone ?? '');
  }, [user]);

  const handleAddBlock = async () => {
    if (!selectedCourtId || !blockDate) return;
    await addBlockedDate({
      court_id: selectedCourtId,
      date: blockDate,
      reason: blockReason || 'Maintenance',
    });
    setBlockReason('');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile({ name: profileName, email: profileEmail, phone: profilePhone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveGcash = async () => {
    // ✅ Only admin can save GCash settings
    if (!isAdmin) {
      setGcashMsg({ type: 'error', text: 'You do not have permission to update payment settings.' });
      return;
    }
    
    setSavingGcash(true);
    setGcashMsg(null);
    try {
      const updated = await adminService.updateSettings({
        gcash_number: gcashNumber,
        gcash_account_name: gcashAccountName,
      });
      setClientSettings(updated);
      setGcashMsg({ type: 'success', text: 'Payment settings updated successfully.' });
    } catch (err) {
      setGcashMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update payment settings.',
      });
    } finally {
      setSavingGcash(false);
    }
  };

  const filteredBlocked = selectedCourtId
    ? blockedDates.filter((b) => b.court_id === selectedCourtId)
    : blockedDates;

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  // ✅ Choose layout based on role
  const Layout = user?.role === 'staff' ? StaffLayout : AdminLayout;

  return (
    <Layout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Settings</h1>
          <p className="mt-1 text-sm text-cream-muted">
            Manage your account, payment configuration, and blocked dates
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="space-y-6">
            {/* Account Info — now editable */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <SettingsIcon className="h-5 w-5 text-gold-400" />
                Account
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Admin Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
                <Input
                  label="Phone"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </div>

              {profileMsg && (
                <div
                  className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
                    profileMsg.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  {profileMsg.text}
                </div>
              )}

              <Button
                className="mt-4"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={savingProfile}
                onClick={handleSaveProfile}
              >
                Save Profile
              </Button>
            </div>

            {/* Change Password */}
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                <Lock className="h-5 w-5 text-gold-400" />
                Change Password
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  hint="At least 8 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordMsg && (
                <div
                  className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
                    passwordMsg.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  {passwordMsg.text}
                </div>
              )}

              <Button
                className="mt-4"
                variant="secondary"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={savingPassword}
                onClick={handleChangePassword}
              >
                Update Password
              </Button>
            </div>

            {/* GCash Settings — only for admins */}
            {isAdmin && (
              <div className="card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                  <CreditCard className="h-5 w-5 text-gold-400" />
                  Payment Configuration
                </h2>

                {loadingSettings ? (
                  <LoadingSpinner className="py-6" />
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="GCash Number"
                        value={gcashNumber}
                        onChange={(e) => setGcashNumber(e.target.value)}
                        placeholder="09XX XXX XXXX"
                      />
                      <Input
                        label="GCash Account Name"
                        value={gcashAccountName}
                        onChange={(e) => setGcashAccountName(e.target.value)}
                        placeholder="Account holder name"
                      />
                      <Input
                        label="Payment Timer (minutes)"
                        type="number"
                        value={APP_CONFIG.paymentTimerSeconds / 60}
                        readOnly
                        hint="Contact support to change"
                      />
                      <Input
                        label="Demo Mode"
                        value={APP_CONFIG.demoMode ? 'Enabled' : 'Disabled'}
                        readOnly
                        hint="Toggle via VITE_DEMO_MODE env var"
                      />
                    </div>

                    {gcashMsg && (
                      <div
                        className={`mt-3 flex items-center gap-2 rounded-lg p-3 text-sm ${
                          gcashMsg.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                        }`}
                      >
                        {gcashMsg.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        {gcashMsg.text}
                      </div>
                    )}

                    <Button
                      className="mt-4"
                      leftIcon={<Save className="h-4 w-4" />}
                      isLoading={savingGcash}
                      onClick={handleSaveGcash}
                    >
                      Save Payment Settings
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Blocked Dates - only for admins */}
            {isAdmin && (
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
                    {courts.map((c) => {
                      if (!c) return null;
                      return (
                        <button
                          key={c.id || `court-${Math.random()}`}
                          onClick={() => setSelectedCourtId(c.id)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            selectedCourtId === c.id
                              ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                              : 'border-forest-500 text-cream-muted hover:border-gold-400/40'
                          }`}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {c?.name || 'Unnamed Court'}
                        </button>
                      );
                    })}
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
            )}

            {/* Staff Management - only for admins */}
            {isAdmin && (
              <div className="card p-6">
                <StaffManagement />
              </div>
            )}

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
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs text-cream-muted">Developer</p>
                  <p className="text-sm font-medium text-cream">{APP_CONFIG.developer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}