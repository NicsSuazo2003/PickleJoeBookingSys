// src/components/layout/StaffLayout.tsx
import { type ReactNode, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  CalendarDays,
  LogOut,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Logo } from '@/components/Logo';

const navItems = [
  { path: '/staff/bookings', label: 'Bookings', icon: CalendarDays },
];

export function StaffSidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-forest-500 px-6 py-5">
        <Logo size="sm" to="/staff" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30'
                  : 'text-cream-muted hover:text-cream hover:bg-forest-600/50 border border-transparent'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-forest-500 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-forest-800 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-forest-950">
            {(user?.name ?? 'S')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cream">{user?.name ?? 'Staff'}</p>
            <p className="truncate text-xs text-cream-muted">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-cream-muted transition hover:bg-error/10 hover:text-error"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function StaffLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // ✅ Check if user has staff or admin role
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ If user is admin, redirect to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // ✅ If user is not staff, redirect to login
  if (user?.role !== 'staff') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-forest-500 bg-forest-900 lg:block">
        <StaffSidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-forest-950/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-forest-500 bg-forest-900 lg:hidden"
            >
              <StaffSidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-forest-500 bg-forest-900/95 px-4 backdrop-blur-md lg:hidden">
          <Logo size="sm" to="" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-cream"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}