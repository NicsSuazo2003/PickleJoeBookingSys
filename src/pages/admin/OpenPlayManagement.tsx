// src/pages/admin/OpenPlayManagement.tsx
import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useOpenPlayStore } from '@/stores/openPlayStore';
import { useAdminStore } from '@/stores/adminStore';
import {
  formatDateLong,
  formatTimeRange,
  formatCurrency,
  todayISO,
} from '@/utils/format';
import type {
  OpenPlaySession,
  CreateOpenPlaySessionPayload,
  UpdateOpenPlaySessionPayload,
  OpenPlaySkillLevel,
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

  const { courts, loadCourts } = useAdminStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<OpenPlaySession | null>(null);
  const [viewingPlayers, setViewingPlayers] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const [formData, setFormData] = useState<CreateOpenPlaySessionPayload>({
    court_id: '',
    date: todayISO(),
    start_time: '09:00',
    end_time: '10:00',
    max_players: 12,
    price_per_player: 200,
    skill_level: 'All Levels',
    host_name: '',
    description: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadCourts();
    adminLoadSessions();
  }, []);

  useEffect(() => {
    if (viewingPlayers) {
      adminLoadPlayers(viewingPlayers);
      adminLoadStats(viewingPlayers);
    }
  }, [viewingPlayers]);

  const resetForm = () => {
    setFormData({
      court_id: courts[0]?.id || '',
      date: todayISO(),
      start_time: '09:00',
      end_time: '10:00',
      max_players: 12,
      price_per_player: 200,
      skill_level: 'All Levels',
      host_name: '',
      description: '',
    });
    setFormError(null);
  };

  const handleCreate = async () => {
    if (!formData.court_id) {
      setFormError('Please select a court');
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
  };

  const openCreateModal = () => {
    const defaultCourt = courts[0]?.id || '';
    setFormData({
      ...formData,
      court_id: defaultCourt,
    });
    setShowCreateModal(true);
    setFormError(null);
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

  if (loadingAdminSessions) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-cream">
            <Users className="h-5 w-5 text-gold-400" />
            Open Play Sessions
          </h2>
          <p className="text-sm text-cream-muted">
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
            Refresh
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
        <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={clearError} className="ml-auto text-error/70 hover:text-error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sessions List */}
      {adminSessions.length === 0 ? (
        <div className="rounded-xl border border-forest-500 bg-forest-800/50 p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-cream-muted/40" />
          <p className="mt-2 text-sm text-cream-muted">No Open Play sessions created yet.</p>
          <p className="text-xs text-cream-muted/60">Create your first session to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adminSessions.map((session) => {
            const status = STATUS_BADGE[session.status] ?? STATUS_BADGE.upcoming;
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest-500 bg-forest-800/50 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-cream">{session.court_name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="rounded-full bg-gold-400/10 px-2 py-0.5 text-[10px] font-bold text-gold-300">
                      {session.skill_level}
                    </span>
                    {!session.is_active && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cream-muted">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDateLong(session.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeRange(session.start_time, session.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {session.current_players}/{session.max_players} players
                    </span>
                    <span className="font-medium text-gold-400">
                      {formatCurrency(session.price_per_player)}/player
                    </span>
                    {session.host_name && (
                      <span className="flex items-center gap-1">
                        <UserCircle2 className="h-3.5 w-3.5" />
                        {session.host_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setViewingPlayers(session.id)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                    title="View players"
                  >
                    <Eye className="h-4 w-4" />
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
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(session)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                    title="Edit"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(session.id, session)}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-red-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
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
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-cream">Court *</label>
            <select
              value={formData.court_id}
              onChange={(e) => setFormData({ ...formData, court_id: e.target.value })}
              className="input-field"
            >
              <option value="">Select a court</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date *"
              type="date"
              min={todayISO()}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-cream">Skill Level *</label>
              <select
                value={formData.skill_level}
                onChange={(e) =>
                  setFormData({ ...formData, skill_level: e.target.value as OpenPlaySkillLevel })
                }
                className="input-field"
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start Time *"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />

            <Input
              label="End Time *"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="flex gap-3 border-t border-forest-500 pt-4">
            <Button
              fullWidth
              isLoading={loadingAction}
              onClick={editingSession ? handleUpdate : handleCreate}
            >
              {editingSession ? 'Update Session' : 'Create Session'}
            </Button>
            <Button
              variant="ghost"
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
          <div className="py-8 text-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {stats && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-forest-800 p-3 text-center">
                  <p className="text-xs text-cream-muted">Players</p>
                  <p className="font-display text-xl font-bold text-cream">
                    {stats.total_players}/{stats.max_players}
                  </p>
                </div>
                <div className="rounded-lg bg-forest-800 p-3 text-center">
                  <p className="text-xs text-cream-muted">Confirmed</p>
                  <p className="font-display text-xl font-bold text-green-400">
                    {stats.confirmed_count}
                  </p>
                </div>
                <div className="rounded-lg bg-forest-800 p-3 text-center">
                  <p className="text-xs text-cream-muted">Revenue</p>
                  <p className="font-display text-xl font-bold text-gold-400">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                </div>
              </div>
            )}

            {players.length === 0 ? (
              <div className="py-8 text-center text-sm text-cream-muted">
                No players have joined this session yet.
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player) => {
                  const status = PAYMENT_STATUS_BADGE[player.status] ?? PAYMENT_STATUS_BADGE.pending_payment;
                  return (
                    <div
                      key={player.booking_id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-forest-800 p-3"
                    >
                      <div>
                        <p className="font-medium text-cream">{player.customer_name}</p>
                        <p className="text-xs text-cream-muted">{player.customer_email}</p>
                        {player.customer_phone && (
                          <p className="text-xs text-cream-muted/60">{player.customer_phone}</p>
                        )}
                        <p className="text-xs font-mono text-gold-400/60">
                          {player.reference_code}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                        <p className="mt-1 text-xs text-cream-muted">
                          {formatCurrency(player.amount_paid)} paid
                        </p>
                        <p className="text-[10px] text-cream-muted/60">
                          Joined {new Date(player.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}