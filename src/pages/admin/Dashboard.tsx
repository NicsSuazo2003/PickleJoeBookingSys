import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminStore } from '@/stores/adminStore';
import {
  formatCurrency,
  formatDate,
  toISODate,
  getMonthMatrix,
  todayISO,
} from '@/utils/format';
import type { AdminView, Booking } from '@/types';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function Dashboard() {
  const analytics = useAdminStore((state) => state.analytics);
  const bookings = useAdminStore((state) => state.bookings || []); // ✅ Ensure array
  const loadingAnalytics = useAdminStore((state) => state.loadingAnalytics);
  const loadingBookings = useAdminStore((state) => state.loadingBookings);
  const loadAnalytics = useAdminStore((state) => state.loadAnalytics);
  const loadBookings = useAdminStore((state) => state.loadBookings);

  const [view, setView] = useState<AdminView>('calendar');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISO());

  useEffect(() => {
    loadAnalytics();
    loadBookings();
  }, [loadAnalytics, loadBookings]);

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const weeks = getMonthMatrix(year, month);

  // ✅ Filter out undefined/null bookings when grouping by date
  const bookingsByDate = new Map<string, Booking[]>();
  bookings.forEach((b) => {
    if (!b || !b.date) return; // Skip invalid bookings
    const existing = bookingsByDate.get(b.date) ?? [];
    existing.push(b);
    bookingsByDate.set(b.date, existing);
  });

  const selectedDateBookings = selectedDate
    ? (bookingsByDate.get(selectedDate) ?? []).filter(b => b) // Filter out undefined
    : [];

  // ✅ Helper to format slot time (uses snake_case)
  const formatSlotTime = (slot: any): string => {
    if (!slot) return '?';
    const start = slot.start_time || '?';
    const end = slot.end_time || '?';
    return `${start}-${end}`;
  };

  // ✅ Helper to get slot start time
  const getSlotStartTime = (slot: any): string => {
    if (!slot) return 'N/A';
    return slot.start_time || 'N/A';
  };

  // ✅ Helper to safely get customer first name
  const getCustomerFirstName = (booking: any): string => {
    if (!booking) return 'Unknown';
    if (!booking.customer) return 'Unknown';
    if (!booking.customer.name) return 'Unknown';
    return booking.customer.name.split(' ')[0] || 'Unknown';
  };

  // ✅ Helper to safely get customer full name
  const getCustomerName = (booking: any): string => {
    if (!booking) return 'Unknown';
    if (!booking.customer) return 'Unknown';
    return booking.customer.name || 'Unknown';
  };

  const statCards = [
  {
    label: 'Total Bookings',
    value: analytics?.total_bookings ?? 0,
    icon: CalendarDays,
    color: 'text-gold-400',
    bg: 'bg-gold-400/10',
  },
  {
    label: 'Total Revenue',
    value: formatCurrency(analytics?.total_revenue ?? 0),
    icon: DollarSign,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'Confirmed Bookings',
    value: analytics?.confirmed_bookings ?? 0,
    icon: CheckCircle2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Pending Payments',
    value: analytics?.pending_payments ?? 0,
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
];
  return (
    <AdminLayout>
      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-cream">Dashboard</h1>
          <p className="mt-1 text-sm text-cream-muted">Overview of your court bookings and revenue</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-cream">{stat.value}</p>
                <p className="text-xs text-cream-muted">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue chart */}
        {analytics?.revenue_by_day && analytics.revenue_by_day.length > 0 && (
          <div className="mb-8 card p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gold-400" />
              <h2 className="font-display text-lg font-bold text-cream">Revenue (Last 7 Days)</h2>
            </div>
            <div className="flex h-48 items-end gap-2">
              {analytics.revenue_by_day.map((day) => {
                const maxRev = Math.max(...analytics.revenue_by_day.map((d) => d.revenue), 1);
                const heightPct = (day.revenue / maxRev) * 100;
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 transition-all hover:from-gold-500 hover:to-gold-300"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={formatCurrency(day.revenue)}
                      />
                    </div>
                    <span className="text-[10px] text-cream-muted">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar / List View */}
        <div className="card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold text-cream">Bookings Calendar</h2>
            <div className="flex items-center gap-2">
              {view === 'calendar' && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted hover:text-gold-300 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-cream min-w-32 text-center">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                    className="rounded-lg border border-forest-500 p-1.5 text-cream-muted hover:text-gold-300 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex rounded-lg border border-forest-500 p-0.5">
                <button
                  onClick={() => setView('calendar')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    view === 'calendar' ? 'bg-gold-400 text-forest-950' : 'text-cream-muted'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Calendar
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    view === 'list' ? 'bg-gold-400 text-forest-950' : 'text-cream-muted'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
              </div>
            </div>
          </div>

          {loadingAnalytics || loadingBookings ? (
            <LoadingSpinner className="py-12" />
          ) : view === 'calendar' ? (
            <div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-cream-muted py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weeks.flat().map((day) => {
                  const iso = toISODate(day);
                  const dayBookings = bookingsByDate.get(iso) ?? [];
                  const isCurrentMonth = day.getMonth() === month;
                  const isToday = iso === todayISO();
                  const isSelected = iso === selectedDate;
                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedDate(iso)}
                      className={`min-h-20 sm:min-h-24 rounded-lg border p-1.5 text-left transition ${
                        isSelected
                          ? 'border-gold-400 bg-gold-400/10'
                          : isCurrentMonth
                            ? 'border-forest-500 bg-forest-700 hover:border-gold-400/40'
                            : 'border-forest-600 bg-forest-800/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            isToday
                              ? 'flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-forest-950'
                              : 'text-cream'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayBookings.length > 0 && (
                          <span className="text-[9px] font-bold text-gold-400">
                            {dayBookings.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {dayBookings.slice(0, 2).map((b) => {
                          // ✅ Skip if booking is undefined
                          if (!b) return null;
                          
                          const firstName = getCustomerFirstName(b);
                          const startTime = b.slots?.[0]?.start_time || '';
                          
                          return (
                            <div
                              key={b.id || Math.random()}
                              className={`truncate rounded px-1 py-0.5 text-[9px] ${
                                b.status === 'confirmed'
                                  ? 'bg-success/20 text-success'
                                  : b.status === 'pending_payment'
                                    ? 'bg-warning/20 text-warning'
                                    : b.status === 'cancelled'
                                      ? 'bg-error/20 text-error'
                                      : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {startTime} {firstName}
                            </div>
                          );
                        })}
                        {dayBookings.length > 2 && (
                          <div className="text-[9px] text-cream-muted">
                            +{dayBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected date bookings */}
              {selectedDate && (
                <div className="mt-6 border-t border-forest-500 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-cream">
                    {formatDate(selectedDate)} — {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''}
                  </h3>
                  {selectedDateBookings.length === 0 ? (
                    <p className="text-sm text-cream-muted py-4 text-center">No bookings for this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateBookings.map((b) => {
                        if (!b) return null;
                        const customerName = getCustomerName(b);
                        const courtName = b.court_name || 'Unknown Court';
                        const totalAmount = b.total_amount || 0;
                        const slotDisplay = b.slots?.map((s) => formatSlotTime(s)).join(', ') || 'No slots';
                        const startTime = b.slots?.[0]?.start_time || 'N/A';
                        
                        return (
                          <div key={b.id || Math.random()} className="flex flex-col gap-3 rounded-xl bg-forest-800 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10 text-xs font-bold text-gold-400">
                                {startTime}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-cream">{customerName}</p>
                                <p className="text-xs text-cream-muted">
                                  {courtName} — {slotDisplay}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gold-400">
                                {formatCurrency(totalAmount)}
                              </span>
                              <StatusBadge status={b.status} size="sm" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-cream-muted">No bookings yet.</p>
              ) : (
                bookings.map((b) => {
                  if (!b) return null;
                  const customerName = getCustomerName(b);
                  const courtName = b.court_name || 'Unknown Court';
                  const totalAmount = b.total_amount || 0;
                  const referenceCode = b.reference_code || 'No ref';
                  const startTime = b.slots?.[0]?.start_time || 'N/A';
                  
                  return (
                    <div key={b.id || Math.random()} className="flex flex-col gap-3 rounded-xl bg-forest-800 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10 text-xs font-bold text-gold-400">
                          {startTime}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-cream">{customerName}</p>
                          <p className="text-xs text-cream-muted">
                            {referenceCode} — {courtName} — {formatDate(b.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gold-400">
                          {formatCurrency(totalAmount)}
                        </span>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}