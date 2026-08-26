import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useAdminStore } from '@/stores/adminStore';
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
  const { bookings, courts, loadingBookings, loadBookings, loadCourts, updateBookingStatus } =
    useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [courtFilter, setCourtFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBookings();
    loadCourts();
  }, [loadBookings, loadCourts]);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (courtFilter !== 'all' && b.court_id !== courtFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.reference_code.toLowerCase().includes(q) ||
        b.customer.name.toLowerCase().includes(q) ||
        b.customer.email.toLowerCase().includes(q) ||
        b.court_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    setUpdating(true);
    try {
      await updateBookingStatus(bookingId, status);
      setSelectedBooking((prev) => (prev && prev.id === bookingId ? { ...prev, status } : prev));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Bookings</h1>
          <p className="mt-1 text-sm text-cream-muted">Manage and update all court bookings</p>
        </div>

        {/* Filters */}
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
              {courts.map((c) => (
                <option key={c.id} value={c.id} className="bg-forest-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-cream-muted">
            <Filter className="h-3.5 w-3.5" />
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </div>

        {/* Table */}
        {loadingBookings ? (
          <LoadingSpinner className="py-12" />
        ) : filtered.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-sm text-cream-muted">No bookings match your filters.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* Desktop table */}
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
                    <tr
                      key={b.id}
                      className="border-b border-forest-600 transition hover:bg-forest-600/30"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-gold-400">
                          {b.reference_code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-cream">{b.customer.name}</p>
                        <p className="text-xs text-cream-muted">{b.customer.email}</p>
                      </td>
                      <td className="px-4 py-3 text-cream">{b.court_name}</td>
                      <td className="px-4 py-3 text-cream-muted">{formatDateLong(b.date)}</td>
                      <td className="px-4 py-3 text-cream-muted">
                        {b.slots.map((s) => formatTimeRange(s.start_time, s.end_time)).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gold-400">
                        {formatCurrency(b.total_amount)}
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

            {/* Mobile cards */}
            <div className="space-y-3 p-4 md:hidden">
              {filtered.map((b) => (
                <div key={b.id} className="rounded-xl bg-forest-800 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gold-400">{b.reference_code}</span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="mt-2 font-medium text-cream">{b.customer.name}</p>
                  <p className="text-xs text-cream-muted">{b.court_name} — {formatDateLong(b.date)}</p>
                  <p className="mt-1 text-xs text-cream-muted">
                    {b.slots.map((s) => formatTimeRange(s.start_time, s.end_time)).join(', ')}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-forest-600 pt-3">
                    <span className="font-semibold text-gold-400">{formatCurrency(b.total_amount)}</span>
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

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <Modal
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            title={`Booking ${selectedBooking.reference_code}`}
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
                  <p className="mt-1 text-sm text-cream">{selectedBooking.customer.name}</p>
                  <p className="text-xs text-cream-muted">{selectedBooking.customer.email}</p>
                  <p className="text-xs text-cream-muted">{selectedBooking.customer.phone}</p>
                  {selectedBooking.customer.notes && (
                    <p className="mt-2 text-xs italic text-cream-muted">
                      "{selectedBooking.customer.notes}"
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="text-xs font-semibold text-gold-300">Booking</p>
                  <p className="mt-1 text-sm text-cream">{selectedBooking.court_name}</p>
                  <p className="text-xs text-cream-muted">{formatDateLong(selectedBooking.date)}</p>
                  <p className="mt-1 text-xs text-cream-muted">
                    {selectedBooking.slots.map((s) => formatTimeRange(s.start_time, s.end_time)).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gold-400/10 p-4">
                <span className="text-sm text-cream-muted">Total Amount</span>
                <span className="font-display text-xl font-bold text-gold-400">
                  {formatCurrency(selectedBooking.total_amount)}
                </span>
              </div>

              {selectedBooking.payment_screenshot_url && (
                <div className="rounded-xl bg-forest-800 p-4">
                  <p className="mb-2 text-xs font-semibold text-gold-300">Payment Screenshot</p>
                  <div className="flex h-32 items-center justify-center rounded-lg bg-forest-900 text-cream-muted text-xs">
                    Screenshot uploaded (Ref: {selectedBooking.payment_reference ?? 'N/A'})
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t border-forest-500 pt-4">
                <p className="mb-3 text-sm font-semibold text-cream">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status !== 'confirmed' && (
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={updating}
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
                      isLoading={updating}
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={updating}
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
                      isLoading={updating}
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
    </AdminLayout>
  );
}

void Clock;
void X;
