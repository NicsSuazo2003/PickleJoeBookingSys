// src/pages/admin/OpenPlayManagement.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  CalendarDays,
  Clock,
  UserCircle2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { useAdminStore } from '@/stores/adminStore';
import { courtService } from '@/services/courtService';
import {
  formatDateLong,
  formatTimeRange,
  formatCurrency,
  todayISO,
  formatDateTime,
} from '@/utils/format';
import type {
  OpenPlaySession,
  CreateOpenPlaySessionPayload,
  UpdateOpenPlaySessionPayload,
  OpenPlaySkillLevel,
  OpenPlayPlayer,
  Booking,
  BookingStatus,
  TimeSlot,
} from '@/types';

const SKILL_LEVELS: OpenPlaySkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-forest-600 text-cream-muted' },
  active: { label: 'Active Now', className: 'bg-green-500/15 text-green-400' },
  full: { label: 'Full', className: 'bg-red-500/15 text-red-400' },
  past: { label: 'Past', className: 'bg-forest-700 text-cream-muted/60' },
  cancelled: { label: 'Cancelled', className: 'bg-forest-700 text-cream-muted/60' },
};

const PAYMENT_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending_payment: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-400' },
  payment_submitted: { label: 'Submitted', className: 'bg-blue-500/15 text-blue-400' },
  confirmed: { label: 'Confirmed', className: 'bg-green-500/15 text-green-400' },
  completed: { label: 'Completed', className: 'bg-green-500/15 text-green-400' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-400' },
  expired: { label: 'Expired', className: 'bg-gray-500/15 text-gray-400' },
  rejected: { label: 'Rejected', className: 'bg-red-500/15 text-red-400' },
};



export function OpenPlayManagement() {
  const {
    adminSessions,
    loadingAdminSessions,
    error,
    adminLoadSessions,
    adminCreateSession,
    adminUpdateSession,
    adminDeleteSession,
    adminLoadPlayers,
    adminLoadStats,
    players,
    loadingPlayers,
    stats,
    clearError,
  } = useOpenPlayStore();

  // Combined into a single destructure — was called twice before for no reason
  const { courts, loadCourts, updateBookingStatus } = useAdminStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<OpenPlaySession | null>(null);
  const [viewingPlayers, setViewingPlayers] = useState<string | null>(null);
  const [selectedPlayerBooking, setSelectedPlayerBooking] = useState<Booking | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<BookingStatus | null>(null);

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  const [formData, setFormData] = useState<CreateOpenPlaySessionPayload>({
    court_id: '',
    date: todayISO(),
    start_time: '',
    end_time: '',
    max_players: 12,
    price_per_player: 200,
    skill_level: 'All Levels',
    host_name: '',
    description: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Load courts + sessions once on mount. (No dependency-array footguns here —
  // intentionally empty, this really should only run once.)
  useState(() => {
    loadCourts();
    adminLoadSessions();
  });

  // Fetches slots for an EXPLICIT court/date instead of reading them from
  // `formData` — this is what fixes the stale-closure bug. Every call site
  // below passes the values it actually wants, so there's no dependency on
  // when React flushes a prior setFormData().
  const fetchAndSetSlots = async (
    courtId: string,
    date: string,
    match?: { start: string; end: string }
  ) => {
    if (!courtId || !date) {
      setAvailableSlots([]);
      setSelectedSlotId('');
      return;
    }

    setLoadingSlots(true);
    try {
      const slots = await courtService.getAvailability(courtId, date);
      const available = slots.filter((s) => s.is_available);
      setAvailableSlots(available);

      if (match) {
        const found = available.find(
          (s) => s.start_time === match.start && s.end_time === match.end
        );
        if (found) {
          setSelectedSlotId(found.id);
          return;
        }
      }

      if (available.length > 0) {
        setSelectedSlotId(available[0].id);
        setFormData((prev) => ({
          ...prev,
          start_time: available[0].start_time,
          end_time: available[0].end_time,
        }));
      } else {
        setSelectedSlotId('');
        setFormData((prev) => ({ ...prev, start_time: '', end_time: '' }));
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
      setAvailableSlots([]);
      setSelectedSlotId('');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCourtChange = (courtId: string) => {
    setFormData((prev) => ({ ...prev, court_id: courtId, start_time: '', end_time: '' }));
    setSelectedSlotId('');
    fetchAndSetSlots(courtId, formData.date);
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, date, start_time: '', end_time: '' }));
    setSelectedSlotId('');
    fetchAndSetSlots(formData.court_id, date);
  };

  const handleSlotSelect = (slotId: string) => {
    const slot = availableSlots.find((s) => s.id === slotId);
    if (slot) {
      setSelectedSlotId(slotId);
      setFormData((prev) => ({
        ...prev,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      court_id: courts[0]?.id || '',
      date: todayISO(),
      start_time: '',
      end_time: '',
      max_players: 12,
      price_per_player: 200,
      skill_level: 'All Levels',
      host_name: '',
      description: '',
    });
    setSelectedSlotId('');
    setAvailableSlots([]);
    setFormError(null);
  };

  const handleCreate = async () => {
    if (!formData.court_id) {
      setFormError('Please select a court');
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      setFormError('Please select a time slot');
      return;
    }
    if (formData.max_players < 2 || formData.max_players > 20) {
      setFormError('Max players must be between 2 and 20');
      return;
    }
    if (formData.price_per_player <= 0) {
      setFormError('Price per player must be greater than 0');
      return;
    }

    setLoadingAction(true);
    setFormError(null);

    try {
      await adminCreateSession(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingSession) return;
    if (!formData.court_id) {
      setFormError('Please select a court');
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      setFormError('Please select a time slot');
      return;
    }
    if (formData.max_players < 2 || formData.max_players > 20) {
      setFormError('Max players must be between 2 and 20');
      return;
    }
    if (formData.price_per_player <= 0) {
      setFormError('Price per player must be greater than 0');
      return;
    }

    setLoadingAction(true);
    setFormError(null);

    try {
      const payload: UpdateOpenPlaySessionPayload = {
        ...formData,
        is_active: editingSession.is_active,
      };
      await adminUpdateSession(editingSession.id, payload);
      setEditingSession(null);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id: string, session: OpenPlaySession) => {
    if (session.current_players > 0) {
      if (!confirm(`This session has ${session.current_players} player(s). Delete anyway?`)) {
        return;
      }
    } else {
      if (!confirm('Delete this session?')) {
        return;
      }
    }

    try {
      await adminDeleteSession(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const openEditModal = (session: OpenPlaySession) => {
    setEditingSession(session);
    setFormData({
      court_id: session.court_id,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      max_players: session.max_players,
      price_per_player: session.price_per_player,
      skill_level: session.skill_level,
      host_name: session.host_name || '',
      description: session.description || '',
    });
    setFormError(null);
    // Explicit values from the session being edited — not from formData,
    // so there's no race with the setFormData call above.
    fetchAndSetSlots(session.court_id, session.date, {
      start: session.start_time,
      end: session.end_time,
    });
  };

  const openCreateModal = () => {
    const defaultCourt = courts[0]?.id || '';
    const defaultDate = todayISO();
    setFormData({
      court_id: defaultCourt,
      date: defaultDate,
      start_time: '',
      end_time: '',
      max_players: 12,
      price_per_player: 200,
      skill_level: 'All Levels',
      host_name: '',
      description: '',
    });
    setSelectedSlotId('');
    setAvailableSlots([]);
    setFormError(null);
    setShowCreateModal(true);
    if (defaultCourt) {
      fetchAndSetSlots(defaultCourt, defaultDate);
    }
  };

  const toggleActive = async (session: OpenPlaySession) => {
    try {
      const payload: UpdateOpenPlaySessionPayload = {
        court_id: session.court_id,
        date: session.date,
        start_time: session.start_time,
        end_time: session.end_time,
        max_players: session.max_players,
        price_per_player: session.price_per_player,
        skill_level: session.skill_level,
        host_name: session.host_name || '',
        description: session.description || '',
        is_active: !session.is_active,
      };
      await adminUpdateSession(session.id, payload);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update session');
    }
  };

  const handlePlayerStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    setUpdatingStatus(status);
    try {
      await updateBookingStatus(bookingId, status);
      if (viewingPlayers) {
        adminLoadPlayers(viewingPlayers);
        adminLoadStats(viewingPlayers);
      }
      setSelectedPlayerBooking((prev) => (prev && prev.id === bookingId ? { ...prev, status } : prev));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openPlayerDetails = (player: OpenPlayPlayer) => {
  const booking: Booking = {
    id: player.booking_id,
    reference_code: player.reference_code,
    court_id: '',
    court_name: '',
    date: player.joined_at,
    slots: [],
    customer: {
      name: player.customer_name,
      email: player.customer_email,
      phone: player.customer_phone ?? '',   // ← handles null and undefined
      notes: '',
    },
    total_amount: player.amount_paid,
    status: player.status as BookingStatus,
    payment_screenshot_url: undefined,
    payment_reference: undefined,
    gcash_number: '',
    created_at: player.joined_at,
    updated_at: player.joined_at,
    open_play_session_id: viewingPlayers || '',
  };
  setSelectedPlayerBooking(booking);
};

  if (loadingAdminSessions) {
    return (
      <div className="py-10 text-center sm:py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-cream sm:text-lg">
            <Users className="h-4 w-4 text-gold-400 sm:h-5 sm:w-5" />
            Open Play Sessions
          </h2>
          <p className="text-xs text-cream-muted sm:text-sm">
            Create and manage social group play sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={adminLoadSessions}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openCreateModal}
          >
            New Session
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-error/10 p-2.5 text-xs text-error sm:p-3 sm:text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={clearError} className="ml-auto text-error/70 hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sessions List */}
      {adminSessions.length === 0 ? (
        <div className="rounded-xl border border-forest-500 bg-forest-800/50 p-6 text-center sm:p-8">
          <Users className="mx-auto h-8 w-8 text-cream-muted/40 sm:h-10 sm:w-10" />
          <p className="mt-2 text-xs text-cream-muted sm:text-sm">No Open Play sessions created yet.</p>
          <p className="text-[11px] text-cream-muted/60 sm:text-xs">Create your first session to get started.</p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {adminSessions.map((session) => {
            const status = STATUS_BADGE[session.status] ?? STATUS_BADGE.upcoming;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-forest-500 bg-forest-800/50 p-3 sm:gap-3 sm:p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm font-medium text-cream sm:text-base">{session.court_name}</h3>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:px-2 sm:text-[10px] ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="rounded-full bg-gold-400/10 px-1.5 py-0.5 text-[9px] font-bold text-gold-300 sm:px-2 sm:text-[10px]">
                      {session.skill_level}
                    </span>
                    {!session.is_active && (
                      <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold text-red-400 sm:px-2 sm:text-[10px]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-cream-muted sm:gap-x-4 sm:text-xs">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {formatDateLong(session.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {formatTimeRange(session.start_time, session.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {session.current_players}/{session.max_players} players
                    </span>
                    <span className="font-medium text-gold-400">
                      {formatCurrency(session.price_per_player)}/player
                    </span>
                    {session.host_name && (
                      <span className="flex items-center gap-1">
                        <UserCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {session.host_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setViewingPlayers(session.id)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                    title="View players"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <button
                    onClick={() => toggleActive(session)}
                    className={`rounded-lg border p-1.5 transition ${
                      session.is_active
                        ? 'border-green-500/30 text-green-400 hover:border-green-400'
                        : 'border-forest-500 text-cream-muted hover:border-gold-400'
                    }`}
                    title={session.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {session.is_active ? (
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(session)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(session.id, session)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-red-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingSession}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSession(null);
          resetForm();
        }}
        title={editingSession ? 'Edit Session' : 'Create Open Play Session'}
        size="lg"
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Court Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-cream sm:text-sm">Court *</label>
            <select
              value={formData.court_id}
              onChange={(e) => handleCourtChange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Select a court</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Skill Level */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Date *"
              type="date"
              min={todayISO()}
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-cream sm:text-sm">Skill Level *</label>
              <select
                value={formData.skill_level}
                onChange={(e) =>
                  setFormData({ ...formData, skill_level: e.target.value as OpenPlaySkillLevel })
                }
                className="input-field text-sm"
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cream sm:text-sm">
              Time Slot *
              {loadingSlots && <span className="text-[11px] text-cream-muted">Loading...</span>}
            </label>

            {!formData.court_id || !formData.date ? (
              <p className="text-[11px] text-cream-muted sm:text-xs">Please select a court and date first</p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 py-2">
                <LoadingSpinner size="sm" />
                <span className="text-[11px] text-cream-muted sm:text-xs">Loading available slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-[11px] text-yellow-400 sm:text-xs">No available slots for this court on this date</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSlotSelect(slot.id)}
                      className={`rounded-lg border p-2 text-center text-[11px] transition-all sm:text-xs ${
                        isSelected
                          ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                          : 'border-forest-500 text-cream-muted hover:border-gold-400/50 hover:text-cream'
                      }`}
                    >
                      <span className="font-mono">{formatTimeRange(slot.start_time, slot.end_time)}</span>
                      {slot.is_peak && (
                        <span className="ml-1 text-[8px] uppercase text-gold-400">Peak</span>
                      )}
                      <span className="block text-[8px] text-cream-muted/60">
                        {formatCurrency(slot.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedSlotId && !loadingSlots && (
              <p className="mt-1 text-[11px] text-green-400 sm:text-xs">
                Selected: {formatTimeRange(formData.start_time, formData.end_time)}
              </p>
            )}
          </div>

          {/* Max Players and Price */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Input
              label="Max Players *"
              type="number"
              min={2}
              max={20}
              value={formData.max_players}
              onChange={(e) =>
                setFormData({ ...formData, max_players: parseInt(e.target.value) || 2 })
              }
              hint="2-20 players"
            />

            <Input
              label="Price Per Player (₱) *"
              type="number"
              min={0}
              step={50}
              value={formData.price_per_player}
              onChange={(e) =>
                setFormData({ ...formData, price_per_player: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          {/* Host Name and Description */}
          <Input
            label="Host Name (optional)"
            placeholder="e.g. John Doe"
            value={formData.host_name || ''}
            onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
          />

          <Input
            label="Description (optional)"
            placeholder="e.g. Casual games for all skill levels"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-error/10 p-2 text-xs text-error">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {formError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2.5 border-t border-forest-500 pt-3 sm:flex-row sm:gap-3 sm:pt-4">
            <Button
              fullWidth
              isLoading={loadingAction}
              onClick={editingSession ? handleUpdate : handleCreate}
            >
              {editingSession ? 'Update Session' : 'Create Session'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              className="sm:w-auto"
              onClick={() => {
                setShowCreateModal(false);
                setEditingSession(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Players Modal */}
      <Modal
        isOpen={!!viewingPlayers}
        onClose={() => setViewingPlayers(null)}
        title="Players"
        size="lg"
      >
        {loadingPlayers ? (
          <div className="py-6 text-center sm:py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {stats && (
              <div className="mb-3 grid grid-cols-3 gap-2 sm:mb-4 sm:gap-3">
                <div className="rounded-lg bg-forest-800 p-2 text-center sm:p-3">
                  <p className="text-[10px] text-cream-muted sm:text-xs">Players</p>
                  <p className="text-lg font-bold text-cream sm:text-xl">
                    {stats.total_players}/{stats.max_players}
                  </p>
                </div>
                <div className="rounded-lg bg-forest-800 p-2 text-center sm:p-3">
                  <p className="text-[10px] text-cream-muted sm:text-xs">Confirmed</p>
                  <p className="text-lg font-bold text-green-400 sm:text-xl">
                    {stats.confirmed_count}
                  </p>
                </div>
                <div className="rounded-lg bg-forest-800 p-2 text-center sm:p-3">
                  <p className="text-[10px] text-cream-muted sm:text-xs">Revenue</p>
                  <p className="text-lg font-bold text-gold-400 sm:text-xl">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                </div>
              </div>
            )}

            {players.length === 0 ? (
              <div className="py-6 text-center text-xs text-cream-muted sm:py-8 sm:text-sm">
                No players have joined this session yet.
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player) => {
                  const status = PAYMENT_STATUS_BADGE[player.status] ?? PAYMENT_STATUS_BADGE.pending_payment;
                  return (
                    <div
                      key={player.booking_id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-forest-800 p-2.5 sm:p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-cream">{player.customer_name}</p>
                        <p className="truncate text-[11px] text-cream-muted sm:text-xs">{player.customer_email}</p>
                        {player.customer_phone && (
                          <p className="text-[11px] text-cream-muted/60 sm:text-xs">{player.customer_phone}</p>
                        )}
                        <p className="font-mono text-[11px] text-gold-400/60 sm:text-xs">
                          {player.reference_code}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold sm:text-[10px] ${status.className}`}
                          >
                            {status.label}
                          </span>
                          <p className="mt-1 text-[11px] text-cream-muted sm:text-xs">
                            {formatCurrency(player.amount_paid)} paid
                          </p>
                          <p className="text-[9px] text-cream-muted/60 sm:text-[10px]">
                            Joined {new Date(player.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => openPlayerDetails(player)}
                          className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                          title="Manage payment"
                        >
                          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Player Booking Details Modal */}
      <Modal
        isOpen={!!selectedPlayerBooking}
        onClose={() => setSelectedPlayerBooking(null)}
        title={`Booking ${selectedPlayerBooking?.reference_code || 'N/A'}`}
        size="lg"
      >
        {selectedPlayerBooking && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={selectedPlayerBooking.status} />
              <span className="text-[11px] text-cream-muted sm:text-xs">
                Created {formatDateTime(selectedPlayerBooking.created_at)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-xl bg-forest-800 p-3 sm:p-4">
                <p className="text-[11px] font-semibold text-gold-300 sm:text-xs">Customer</p>
                <p className="mt-1 text-sm text-cream">{selectedPlayerBooking.customer?.name || 'Unknown'}</p>
                <p className="text-[11px] text-cream-muted sm:text-xs">{selectedPlayerBooking.customer?.email || 'No email'}</p>
                <p className="text-[11px] text-cream-muted sm:text-xs">{selectedPlayerBooking.customer?.phone || 'No phone'}</p>
                {selectedPlayerBooking.customer?.notes && (
                  <p className="mt-2 text-[11px] italic text-cream-muted sm:text-xs">"{selectedPlayerBooking.customer.notes}"</p>
                )}
              </div>
              <div className="rounded-xl bg-forest-800 p-3 sm:p-4">
                <p className="text-[11px] font-semibold text-gold-300 sm:text-xs">Booking</p>
                <p className="mt-1 text-sm text-cream">Open Play Session</p>
                <p className="text-[11px] text-cream-muted sm:text-xs">{formatDateLong(selectedPlayerBooking.date)}</p>
                <p className="text-[11px] text-cream-muted sm:text-xs">
                  Ref: {selectedPlayerBooking.reference_code}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gold-400/10 p-3 sm:p-4">
              <span className="text-xs text-cream-muted sm:text-sm">Total Amount</span>
              <span className="text-lg font-bold text-gold-400 sm:text-xl">
                {formatCurrency(selectedPlayerBooking.total_amount || 0)}
              </span>
            </div>

            <div className="border-t border-forest-500 pt-3 sm:pt-4">
              <p className="mb-2.5 text-xs font-semibold text-cream sm:mb-3 sm:text-sm">Update Payment Status</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlayerBooking.status !== 'confirmed' && (
                  <Button
                    size="sm"
                    variant="success"
                    isLoading={updatingStatus === 'confirmed'}
                    disabled={updatingStatus !== null}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    onClick={() => handlePlayerStatusUpdate(selectedPlayerBooking.id, 'confirmed')}
                  >
                    Confirm Payment
                  </Button>
                )}
                {selectedPlayerBooking.status !== 'completed' && selectedPlayerBooking.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={updatingStatus === 'completed'}
                    disabled={updatingStatus !== null}
                    onClick={() => handlePlayerStatusUpdate(selectedPlayerBooking.id, 'completed')}
                  >
                    Mark Completed
                  </Button>
                )}
                {selectedPlayerBooking.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={updatingStatus === 'cancelled'}
                    disabled={updatingStatus !== null}
                    leftIcon={<XCircle className="h-4 w-4" />}
                    onClick={() => handlePlayerStatusUpdate(selectedPlayerBooking.id, 'cancelled')}
                  >
                    Cancel Booking
                  </Button>
                )}
                {selectedPlayerBooking.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={updatingStatus === 'rejected'}
                    disabled={updatingStatus !== null}
                    onClick={() => handlePlayerStatusUpdate(selectedPlayerBooking.id, 'rejected')}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}