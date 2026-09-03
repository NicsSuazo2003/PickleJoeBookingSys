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
  Clock,
  Wallet,
  QrCode,
  Smartphone,
  Banknote,
  Edit3,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
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
import type { ClientSettings, PaymentMethod } from '@/types';
import { StaffManagement } from '@/components/ui/StaffManagement';
import { Modal } from '@/components/ui/Modal';

// ✅ Payment method type options
const PAYMENT_TYPE_OPTIONS = [
  { value: 'gcash', label: 'GCash', icon: '📱' },
  { value: 'qr_ph', label: 'QR Ph (Bank QR)', icon: '📷' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'e_wallet', label: 'E-Wallet', icon: '💳' },
  { value: 'other', label: 'Other', icon: '🔗' },
];

// ✅ Icon options for payment methods
const ICON_OPTIONS = [
  { value: 'Smartphone', icon: Smartphone },
  { value: 'QrCode', icon: QrCode },
  { value: 'Banknote', icon: Banknote },
  { value: 'CreditCard', icon: CreditCard },
  { value: 'Wallet', icon: Wallet },
  { value: 'Building2', icon: Building2 },
];

export function Settings() {
  const { user } = useAuthStore();
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const blockedDates = useAdminStore((state) => state.blockedDates);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const loadBlockedDates = useAdminStore((state) => state.loadBlockedDates);
  const addBlockedDate = useAdminStore((state) => state.addBlockedDate);
  const removeBlockedDate = useAdminStore((state) => state.removeBlockedDate);

  const { updateProfile, changePassword } = useAuthStore();

  // ── Profile state ──────────────────────────────────
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [blockDate, setBlockDate] = useState(toISODate(addDays(new Date(), 7)));
  const [blockReason, setBlockReason] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [isFullDay, setIsFullDay] = useState(true);

  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Payment Methods State ─────────────────────────
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);
  const [methodMsg, setMethodMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // ── QR Upload state ───────────────────────────────
  const [uploadingQR, setUploadingQR] = useState(false);

  // ── New/Edit Payment Method Form ──────────────────
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    name: '',
    type: 'other',
    icon: 'Smartphone',
    enabled: true,
    config: {
      account_name: '',
      account_number: '',
      qr_image_url: '',
      instructions: '',
    },
  });

  // ── Client Settings State ─────────────────────────
  const [clientSettings, setClientSettings] = useState<ClientSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const isAdmin = user?.role === 'admin';

  // ── Load Data ──────────────────────────────────────
  useEffect(() => {
    loadCourts();
    loadBlockedDates();
    loadPaymentMethods();
    (async () => {
      try {
        const settings = await adminService.getSettings();
        setClientSettings(settings);
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

 // ── Load Payment Methods ───────────────────────────
const loadPaymentMethods = async () => {
  setLoadingPaymentMethods(true);
  try {
    const settings = await adminService.getSettings();
    console.log('📡 Loaded settings:', settings);
    console.log('📡 Payment methods from API:', settings.payment_methods);
    
    if (settings.payment_methods && settings.payment_methods.length > 0) {
      setPaymentMethods(settings.payment_methods);
    } else {
      // Default payment methods
      setPaymentMethods([
        {
          id: '1',
          name: 'GCash',
          type: 'gcash',
          icon: 'Smartphone',
          enabled: true,
          config: {
            account_name: APP_CONFIG.gcashAccountName || 'PickleJoe Courts',
            account_number: APP_CONFIG.gcashNumber || '09XX XXX XXXX',
          },
          sort_order: 0,
        },
      ]);
    }
  } catch (error) {
    console.error('Failed to load payment methods:', error);
  } finally {
    setLoadingPaymentMethods(false);
  }
};

  // ── Save Payment Methods ───────────────────────────
const savePaymentMethods = async (methods: PaymentMethod[]) => {
  try {
    const result = await adminService.updateSettings({
      payment_methods: methods,
    });
    // ✅ Update local state with the saved methods
    setPaymentMethods(methods);
    console.log('✅ Payment methods saved successfully:', methods);
    return true;
  } catch (error) {
    console.error('Failed to save payment methods:', error);
    setMethodMsg({ type: 'error', text: 'Failed to save payment methods' });
    return false;
  }
};

  // ── Handle QR Code Upload ──────────────────────────
const handleQrUpload = async (file: File): Promise<string | null> => {
  setUploadingQR(true);
  setMethodMsg(null);
  
  try {
    const uploadData = new FormData();
    uploadData.append('file', file);

    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    const imageUrl = data.url;
    
    if (imageUrl) {
      setFormData({
        ...formData,
        config: { ...formData.config, qr_image_url: imageUrl },
      });
      setMethodMsg({ type: 'success', text: 'QR code uploaded successfully!' });
      return imageUrl;
    } else {
      throw new Error('No URL returned from upload');
    }
  } catch (error) {
    setMethodMsg({ 
      type: 'error', 
      text: error instanceof Error ? error.message : 'Failed to upload QR code' 
    });
    console.error('QR upload error:', error);
    return null;
  } finally {
    setUploadingQR(false);
  }
};

 // ── Add Payment Method ─────────────────────────────
const handleAddMethod = async () => {
  if (!formData.name?.trim()) {
    setMethodMsg({ type: 'error', text: 'Payment method name is required.' });
    return;
  }

  setSavingMethod(true);
  setMethodMsg(null);

  const newMethod: PaymentMethod = {
    id: Date.now().toString(),
    name: formData.name.trim(),
    type: (formData.type as PaymentMethod['type']) || 'other',
    icon: formData.icon || 'Smartphone',
    enabled: formData.enabled !== undefined ? formData.enabled : true,
    config: {
      account_name: formData.config?.account_name || '',
      account_number: formData.config?.account_number || '',
      qr_image_url: formData.config?.qr_image_url || '',
      instructions: formData.config?.instructions || '',
    },
    sort_order: paymentMethods.length,
  };

  const updated = [...paymentMethods, newMethod];
  const success = await savePaymentMethods(updated);
  
  if (success) {
    setMethodMsg({ type: 'success', text: `"${newMethod.name}" added successfully.` });
    setShowAddModal(false);
    resetForm();
    // ✅ Reload payment methods to get the latest data
    await loadPaymentMethods();
  }
  setSavingMethod(false);
};

  // ── Edit Payment Method ────────────────────────────
  const handleEditMethod = async () => {
    if (!editingMethod) return;
    if (!formData.name?.trim()) {
      setMethodMsg({ type: 'error', text: 'Payment method name is required.' });
      return;
    }

    setSavingMethod(true);
    setMethodMsg(null);

    const updatedMethod: PaymentMethod = {
      ...editingMethod,
      name: formData.name.trim(),
      type: (formData.type as PaymentMethod['type']) || editingMethod.type,
      icon: formData.icon || editingMethod.icon,
      enabled: formData.enabled !== undefined ? formData.enabled : editingMethod.enabled,
      config: {
        account_name: formData.config?.account_name || editingMethod.config?.account_name || '',
        account_number: formData.config?.account_number || editingMethod.config?.account_number || '',
        qr_image_url: formData.config?.qr_image_url || editingMethod.config?.qr_image_url || '',
        instructions: formData.config?.instructions || editingMethod.config?.instructions || '',
      },
    };

    const updated = paymentMethods.map((m) =>
      m.id === editingMethod.id ? updatedMethod : m
    );
    
    const success = await savePaymentMethods(updated);
    
    if (success) {
      setMethodMsg({ type: 'success', text: `"${updatedMethod.name}" updated successfully.` });
      setEditingMethod(null);
      resetForm();
      await loadPaymentMethods();
    } else {
      setMethodMsg({ type: 'error', text: 'Failed to update payment method.' });
    }
    setSavingMethod(false);
  };

  // ── Toggle Payment Method ──────────────────────────
  const handleToggleMethod = async (id: string) => {
    const method = paymentMethods.find((m) => m.id === id);
    if (!method) return;

    const updated = paymentMethods.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    
    await savePaymentMethods(updated);
    setPaymentMethods(updated);
  };

  // ── Delete Payment Method ──────────────────────────
  const handleDeleteMethod = async (id: string) => {
    const method = paymentMethods.find((m) => m.id === id);
    if (!method) return;
    
    if (!confirm(`Remove "${method.name}" from payment options?`)) return;

    const updated = paymentMethods.filter((m) => m.id !== id);
    const success = await savePaymentMethods(updated);
    
    if (success) {
      setPaymentMethods(updated);
    }
  };

  // ── Reset Form ─────────────────────────────────────
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      icon: 'Smartphone',
      enabled: true,
      config: {
        account_name: '',
        account_number: '',
        qr_image_url: '',
        instructions: '',
      },
    });
    setMethodMsg(null);
  };

  // ── Edit Click Handler ─────────────────────────────
  const handleEditClick = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      icon: method.icon,
      enabled: method.enabled,
      config: { ...method.config },
    });
    setMethodMsg(null);
  };

  // ── Blocked Date Handlers ──────────────────────────
  const handleAddBlock = async () => {
    if (!selectedCourtId || !blockDate) return;
    
    const payload: any = {
      court_id: selectedCourtId,
      date: blockDate,
      reason: blockReason || 'Maintenance',
    };

    if (!isFullDay && blockStartTime && blockEndTime) {
      payload.startTime = blockStartTime;
      payload.endTime = blockEndTime;
    }

    await addBlockedDate(payload);
    setBlockReason('');
    setBlockStartTime('');
    setBlockEndTime('');
    setIsFullDay(true);
  };

  // ── Profile Handlers ───────────────────────────────
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

  const filteredBlocked = selectedCourtId
    ? blockedDates.filter((b) => b.court_id === selectedCourtId)
    : blockedDates;

  const selectedCourt = courts.find((c) => c.id === selectedCourtId);

  const Layout = user?.role === 'staff' ? StaffLayout : AdminLayout;

  return (
    <Layout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Settings</h1>
          <p className="mt-1 text-sm text-cream-muted">
            Manage your account, payment methods, and blocked dates
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="space-y-6">
            {/* ── Account Info ── */}
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

            {/* ── Change Password ── */}
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

            {/* ── Payment Methods ── */}
            {isAdmin && (
              <div className="card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-cream">
                      <Wallet className="h-5 w-5 text-gold-400" />
                      Payment Methods
                    </h2>
                    <p className="text-sm text-cream-muted">
                      Add, edit, or remove payment methods available at checkout.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                  >
                    Add Method
                  </Button>
                </div>

                {loadingPaymentMethods ? (
                  <LoadingSpinner className="py-6" />
                ) : paymentMethods.length === 0 ? (
                  <div className="rounded-xl bg-forest-800 py-8 text-center">
                    <Wallet className="mx-auto h-10 w-10 text-cream-muted/40" />
                    <p className="mt-3 text-sm text-cream-muted">No payment methods added yet.</p>
                    <p className="text-xs text-cream-muted/60">Add your first payment method to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((method) => {
                        const IconComponent =
                          ICON_OPTIONS.find((i) => i.value === method.icon)?.icon || Smartphone;
                        return (
                          <div
                            key={method.id}
                            className="flex items-center justify-between rounded-xl border border-forest-500 bg-forest-800/50 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10">
                                <IconComponent className="h-5 w-5 text-gold-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-cream">{method.name}</p>
                                  <span
                                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                                      method.enabled ? 'text-success' : 'text-error'
                                    }`}
                                  >
                                    {method.enabled ? 'Active' : 'Disabled'}
                                  </span>
                                </div>
                                <p className="text-xs text-cream-muted">
                                  {method.type.replace('_', ' ').toUpperCase()}
                                  {method.config?.account_name && (
                                    <span className="ml-2">· {method.config.account_name}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={method.enabled}
                                  onChange={() => handleToggleMethod(method.id)}
                                  className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-forest-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-forest-400 after:bg-white after:transition-all after:content-[''] peer-checked:bg-gold-400 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                              </label>
                              <button
                                onClick={() => handleEditClick(method)}
                                className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMethod(method.id)}
                                className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-error hover:text-error"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* ── Blocked Dates ── */}
            {isAdmin && (
              <div className="card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-cream">
                  <CalendarOff className="h-5 w-5 text-gold-400" />
                  Blocked Dates
                </h2>
                <p className="mb-4 text-sm text-cream-muted">
                  Block courts for maintenance, holidays, or events. You can block full days or specific time ranges.
                </p>

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

                <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <Input
                    label="Date to Block"
                    type="date"
                    min={todayISO()}
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                  />
                  
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-cream pb-1">
                      <input
                        type="checkbox"
                        checked={isFullDay}
                        onChange={(e) => {
                          setIsFullDay(e.target.checked);
                          if (e.target.checked) {
                            setBlockStartTime('');
                            setBlockEndTime('');
                          }
                        }}
                        className="h-4 w-4 accent-gold-400"
                      />
                      <span className="text-cream-muted">Full Day</span>
                    </label>
                  </div>

                  {!isFullDay && (
                    <>
                      <Input
                        label="Start Time"
                        type="time"
                        value={blockStartTime}
                        onChange={(e) => setBlockStartTime(e.target.value)}
                        leftIcon={<Clock className="h-4 w-4" />}
                      />
                      <Input
                        label="End Time"
                        type="time"
                        value={blockEndTime}
                        onChange={(e) => setBlockEndTime(e.target.value)}
                        leftIcon={<Clock className="h-4 w-4" />}
                      />
                    </>
                  )}

                  <Input
                    label="Reason"
                    placeholder="Maintenance, holiday, event..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <Button
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={handleAddBlock}
                    disabled={!blockDate || !selectedCourtId}
                  >
                    Block Date
                  </Button>
                </div>

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
                              {(block as any).startTime && (block as any).endTime && (
                                <span className="ml-2 text-xs text-gold-400">
                                  {(block as any).startTime} - {(block as any).endTime}
                                </span>
                              )}
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

            {/* ── Staff Management ── */}
            {isAdmin && (
              <div className="card p-6">
                <StaffManagement />
              </div>
            )}

            {/* ── App Info ── */}
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

      {/* ── Add/Edit Payment Method Modal ── */}
      <Modal
        isOpen={showAddModal || !!editingMethod}
        onClose={() => {
          setShowAddModal(false);
          setEditingMethod(null);
          resetForm();
        }}
        title={editingMethod ? `Edit ${editingMethod.name}` : 'Add Payment Method'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Payment Method Name"
            placeholder="e.g. GCash, BPI, Maya, RCBC QR Pay"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream">Payment Type</label>
            <select
              value={formData.type || 'other'}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })
              }
              className="input-field"
            >
              {PAYMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream">Icon</label>
            <select
              value={formData.icon || 'Smartphone'}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="input-field"
            >
              {ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <option key={opt.value} value={opt.value}>
                    <Icon className="inline h-4 w-4" /> {opt.value}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="border-t border-forest-500 pt-4">
            <p className="mb-3 text-sm font-semibold text-cream">Configuration</p>
            
            <Input
              label="Account Name"
              placeholder="Account holder name"
              value={formData.config?.account_name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, account_name: e.target.value },
                })
              }
            />

            {(formData.type === 'gcash' || formData.type === 'e_wallet') && (
              <Input
                label="Account Number"
                placeholder="e.g. 09XX XXX XXXX"
                value={formData.config?.account_number || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, account_number: e.target.value },
                  })
                }
              />
            )}

            {/* ── QR Code Upload ── */}
            {(formData.type === 'qr_ph' || formData.type === 'gcash') && (
              <div className="space-y-3">
                <label className="mb-1.5 block text-sm font-medium text-cream">
                  QR Code Image
                  {uploadingQR && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
                </label>
                
                {formData.config?.qr_image_url ? (
                  <div className="relative rounded-xl border border-forest-500 bg-forest-800/50 p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.config.qr_image_url}
                        alt="QR Code"
                        className="h-24 w-24 rounded-lg object-contain border border-forest-500"
                      />
                      <div>
                        <p className="text-sm text-cream">QR code uploaded</p>
                        <p className="text-xs text-cream-muted">
                          {formData.config.qr_image_url.split('/').pop()?.slice(0, 30)}...
                        </p>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              config: { ...formData.config, qr_image_url: '' },
                            });
                          }}
                          className="mt-2 text-xs text-error hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-forest-500 p-6 text-center hover:border-gold-400/50 transition">
                    <ImageIcon className="mx-auto h-10 w-10 text-cream-muted/40" />
                    <p className="mt-2 text-sm text-cream-muted">
                      Drag and drop or click to upload QR code
                    </p>
                    <p className="text-xs text-cream-muted/60">
                      PNG, JPG, SVG (max 5MB)
                    </p>
                    <label className="mt-3 inline-block cursor-pointer">
                      <span className="rounded-lg border border-gold-400 px-4 py-2 text-sm font-medium text-gold-300 transition hover:bg-gold-400/10">
                        {uploadingQR ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Choose Image'
                        )}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingQR}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleQrUpload(file);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
                
                <p className="text-xs text-cream-muted/60">
                  Upload the QR code image that customers will scan to pay.
                </p>
              </div>
            )}

            <Textarea
              label="Instructions (optional)"
              rows={3}
              placeholder="e.g. Send payment to this account, include reference code as description..."
              value={formData.config?.instructions || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  config: { ...formData.config, instructions: e.target.value },
                })
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-cream">
              <input
                type="checkbox"
                checked={formData.enabled !== undefined ? formData.enabled : true}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="h-4 w-4 accent-gold-400"
              />
              Enabled (visible at checkout)
            </label>
          </div>

          {methodMsg && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                methodMsg.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}
            >
              {methodMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {methodMsg.text}
            </div>
          )}

          <div className="flex gap-3 border-t border-forest-500 pt-4">
            <Button
              fullWidth
              isLoading={savingMethod}
              leftIcon={<Save className="h-4 w-4" />}
              onClick={editingMethod ? handleEditMethod : handleAddMethod}
            >
              {editingMethod ? 'Update Payment Method' : 'Add Payment Method'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setEditingMethod(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}