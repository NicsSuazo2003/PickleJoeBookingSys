import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';
import {
  formatTimeRange,
  formatCurrency,
  formatDateLong,
  formatDateTime,
} from '@/utils/format';
import type { Booking, BookingStatus } from '@/types';

const statusOptions: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'payment_submitted', label: 'Payment Submitted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

export function Bookings() {
  const { user } = useAuthStore();
  const bookings = useAdminStore((state) => state.bookings);
  const courts = useAdminStore((state) => state.courts);
  const loadingBookings = useAdminStore((state) => state.loadingBookings);
  const loadBookings = useAdminStore((state) => state.loadBookings);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateBookingStatus = useAdminStore((state) => state.updateBookingStatus);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [courtFilter, setCourtFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // ✅ Track which status action is in flight, not just a shared boolean
  const [updatingStatus, setUpdatingStatus] = useState<BookingStatus | null>(null);

  useEffect(() => {
    loadBookings();
    // ✅ /api/admin/courts is admin-only — staff would get a 403 and an
    // empty court filter every time, so only fetch it for admins.
    if (user?.role === 'admin') {
      loadCourts();
    }
  }, [loadBookings, loadCourts, user?.role]);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (courtFilter !== 'all' && b.court_id !== courtFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.reference_code?.toLowerCase().includes(q) ||
        b.customer?.name?.toLowerCase().includes(q) ||
        b.customer?.email?.toLowerCase().includes(q) ||
        b.court_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    setUpdatingStatus(status);
    try {
      await updateBookingStatus(bookingId, status);
      setSelectedBooking((prev) => (prev && prev.id === bookingId ? { ...prev, status } : prev));
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ✅ Choose layout based on role
  const Layout = user?.role === 'staff' ? StaffLayout : AdminLayout;

  return (
    <Layout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Bookings</h1>
          <p className="mt-1 text-sm text-cream-muted">Manage and update all court bookings</p>
        </div>

        <div className="mb-6 card p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Search by name, email, ref code..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="input-field"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-forest-800">
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="input-field"
            >
              <option value="all" className="bg-forest-800">All Courts</option>
              {courts.map((c) => {
                // ✅ Skip if court is undefined
                if (!c) return null;
                return (
                  <option key={c.id || `court-${Math.random()}`} value={c.id} className="bg-forest-800">
                    {c?.name || 'Unnamed Court'}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-cream-muted">
            <Filter className="h-3.5 w-3.5" />
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>

        {loadingBookings ? (
          <LoadingSpinner className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-sm text-cream-muted">No bookings match your filters.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-forest-500 text-left text-xs uppercase text-cream-muted">
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Court</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Slots</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b border-forest-600 transition hover:bg-forest-600/30">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-gold-400">{b.reference_code || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-cream">{b.customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-cream-muted">{b.customer?.email || 'No email'}</p>
                      </td>
                      <td className="px-4 py-3 text-cream">{b.court_name || 'Unknown Court'}</td>
                      <td className="px-4 py-3 text-cream-muted">{formatDateLong(b.date)}</td>
                      <td className="px-4 py-3 text-cream-muted">
                        {b.slots?.map((s) => formatTimeRange(s.start_time, s.end_time)).join(', ') || 'No slots'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gold-400">
                        {formatCurrency(b.total_amount || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="rounded-lg border border-forest-500 p-1.5 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filtered.map((b) => (
                <div key={b.id} className="rounded-xl bg-forest-800 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gold-400">{b.reference_code || 'N/A'}</span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="mt-2 font-medium text-cream">{b.customer?.name || 'Unknown'}</p>
                  <p className="text-xs text-cream-muted">{b.court_name || 'Unknown Court'} — {formatDateLong(b.date)}</p>
                  <p className="mt-1 text-xs text-cream-muted">
                    {b.slots?.map((s) => formatTimeRange(s.start_time, s.end_time)).join(', ') || 'No slots'}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-forest-600 pt-3">
                    <span className="font-semibold text-gold-400">{formatCurrency(b.total_amount || 0)}</span>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedBooking(b)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <Modal
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            title={`Booking ${selectedBooking.reference_code || 'N/A'}`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedBooking.status} />
                <span className="text-xs text-cream-muted">
                  Created {formatDateTime(selectedBooking.created_at)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs font-semibold text-gold-300">Customer</p>
                  <p className="mt-1 text-sm text-cream">{selectedBooking.customer?.name || 'Unknown'}</p>
                  <p className="text-xs text-cream-muted">{selectedBooking.customer?.email || 'No email'}</p>
                  <p className="text-xs text-cream-muted">{selectedBooking.customer?.phone || 'No phone'}</p>
                  {selectedBooking.customer?.notes && (
                    <p className="mt-2 text-xs italic text-cream-muted">"{selectedBooking.customer.notes}"</p>
                  )}
                </div>
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs font-semibold text-gold-300">Booking</p>
                  <p className="mt-1 text-sm text-cream">{selectedBooking.court_name || 'Unknown Court'}</p>
                  <p className="text-xs text-cream-muted">{formatDateLong(selectedBooking.date)}</p>
                  <p className="mt-1 text-xs text-cream-muted">
                    {selectedBooking.slots?.map((s) => formatTimeRange(s.start_time, s.end_time)).join(', ') || 'No slots'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gold-400/10 p-4">
                <span className="text-sm text-cream-muted">Total Amount</span>
                <span className="font-display text-xl font-bold text-gold-400">
                  {formatCurrency(selectedBooking.total_amount || 0)}
                </span>
              </div>

              {selectedBooking.payment_screenshot_url && (
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="mb-2 text-xs font-semibold text-gold-300">Payment Screenshot</p>
                  <img
                    src={selectedBooking.payment_screenshot_url}
                    alt="Payment screenshot"
                    className="max-h-64 w-full rounded-lg object-contain bg-forest-900"
                  />
                </div>
              )}

              <div className="border-t border-forest-500 pt-4">
                <p className="mb-3 text-sm font-semibold text-cream">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status !== 'confirmed' && (
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={updatingStatus === 'confirmed'}
                      disabled={updatingStatus !== null}
                      leftIcon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    >
                      Confirm
                    </Button>
                  )}
                  {selectedBooking.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={updatingStatus === 'completed'}
                      disabled={updatingStatus !== null}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={updatingStatus === 'cancelled'}
                      disabled={updatingStatus !== null}
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  )}
                  {selectedBooking.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={updatingStatus === 'rejected'}
                      disabled={updatingStatus !== null}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </Layout>
  );
}