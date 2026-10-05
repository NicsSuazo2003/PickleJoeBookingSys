import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CalendarPlus, Search, Shield, Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/utils/constants';
import { useClientStore } from '@/stores/clientStore';
import { bookingService } from '@/services/bookingService';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const settings = useClientStore((state) => state.settings);
  const loadSettings = useClientStore((state) => state.loadSettings);

  const displayNumber =
    settings?.gcash_number ||
    APP_CONFIG.paymentNumber ||
    '09XX XXX XXXX';

  const telHref = displayNumber.trim()
    ? `tel:${displayNumber.replace(/\s/g, '')}`
    : '';

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // ─── Pending booking badge ───
  // Re-checks on every route change and on the `pendingBookingUpdated` custom event.
  useEffect(() => {
    let cancelled = false;

    const checkPending = async () => {
      const savedRef = localStorage.getItem('pendingBookingRef');
      if (!savedRef) {
        if (!cancelled) setPendingCount(0);
        return;
      }

      try {
        const booking = await bookingService.trackBooking(savedRef);
        if (cancelled) return;

        if (booking.status === 'pending_payment') {
          setPendingCount(1);
        } else {
          // Stale ref — clean it up
          localStorage.removeItem('pendingBookingRef');
          setPendingCount(0);
        }
      } catch {
        if (cancelled) return;
        // Treat errors as "nothing pending" — don't show a badge on backend hiccups
        setPendingCount(0);
      }
    };

    checkPending();

    // Re-check when the tab becomes visible again (customer may have paid elsewhere)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkPending();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Listen for in-app updates (Booking.tsx dispatches this after createBooking)
    const onUpdate = () => checkPending();
    window.addEventListener('pendingBookingUpdated', onUpdate);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pendingBookingUpdated', onUpdate);
    };
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Open Play', path: '/open-play' },
    { label: 'Book a Court', path: '/booking' },
    { label: 'My Bookings', path: '/my-bookings', badge: pendingCount },
    { label: 'Track Booking', path: '/track' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-forest-950/95 backdrop-blur-md shadow-lg border-b border-forest-800/80'
          : 'bg-forest-950/60 backdrop-blur-sm'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between md:h-20">
        <Logo size="nav" />

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const hasBadge = 'badge' in link && (link.badge ?? 0) > 0;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-brand-blue-300 bg-brand-blue-500/15 font-semibold'
                    : 'text-cream hover:text-brand-blue-300 hover:bg-forest-800/60'
                }`}
              >
                {link.label}
                {hasBadge && (
                  <span
                    className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-md"
                    aria-label={`${link.badge} pending`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={telHref}
            className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-brand-blue-300 transition"
          >
            <Phone className="h-4 w-4 text-brand-green-400" />
            {displayNumber}
          </a>
          <Button size="sm" to="/booking" leftIcon={<CalendarPlus className="h-4 w-4" />}>
            Book Now
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-cream hover:bg-forest-800/60 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-forest-800/80 bg-forest-950 md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {navLinks.map((link) => {
                const hasBadge = 'badge' in link && (link.badge ?? 0) > 0;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive(link.path)
                        ? 'text-brand-blue-300 bg-brand-blue-500/15 font-semibold'
                        : 'text-cream hover:bg-forest-800/60 hover:text-brand-blue-300'
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasBadge && (
                      <span
                        className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white"
                        aria-label={`${link.badge} pending`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <a
                href={telHref}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-cream-muted hover:bg-forest-800/60 hover:text-brand-blue-300 transition"
              >
                <Phone className="h-4 w-4 text-brand-green-400" />
                Call {displayNumber}
              </a>

              <div className="mt-2 flex flex-col gap-2">
                <Button
                  size="md"
                  fullWidth
                  leftIcon={<CalendarPlus className="h-4 w-4" />}
                  onClick={() => navigate('/booking')}
                >
                  Book Now
                </Button>
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 rounded-xl border border-forest-700/80 bg-forest-900/40 px-4 py-2.5 text-sm text-cream-muted hover:border-brand-blue-500/50 hover:text-brand-blue-300 transition"
                >
                  <Shield className="h-4 w-4" />
                  Admin Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SearchIcon() {
  return <Search className="h-4 w-4" />;
}