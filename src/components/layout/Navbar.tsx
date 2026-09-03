import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CalendarPlus, Search, Shield, Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/utils/constants';
import { useClientStore } from '@/stores/clientStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const settings = useClientStore((state) => state.settings);
  const loadSettings = useClientStore((state) => state.loadSettings);
  const displayNumber = settings?.gcash_number || APP_CONFIG.gcashNumber;

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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Open Play', path: '/open-play' },
    { label: 'Book a Court', path: '/booking' },
    { label: 'Track Booking', path: '/track' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-forest-950/95 backdrop-blur-md shadow-lg'
          : 'bg-forest-950/60 backdrop-blur-sm'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between md:h-20">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(link.path)
                  ? 'text-gold-400 bg-gold-400/10'
                  : 'text-cream hover:text-gold-300 hover:bg-forest-600/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={`tel:${displayNumber.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 text-sm text-cream-muted hover:text-gold-300 transition"
          >
            <Phone className="h-4 w-4" />
            {displayNumber}
          </a>
          <Button size="sm" to="/booking" leftIcon={<CalendarPlus className="h-4 w-4" />}>
            Book Now
          </Button>
        </div>

        <button
          className="rounded-lg p-2 text-cream md:hidden"
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
            className="overflow-hidden border-t border-forest-500 bg-forest-950 md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive(link.path)
                      ? 'text-gold-400 bg-gold-400/10'
                      : 'text-cream hover:bg-forest-600/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Phone number — only place to call from on mobile, since the
                  desktop tel: link is hidden below md: */}
              <a
                href={`tel:${displayNumber.replace(/\s/g, '')}`}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-cream-muted hover:bg-forest-600/50 hover:text-gold-300 transition"
              >
                <Phone className="h-4 w-4" />
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
                  className="flex items-center justify-center gap-2 rounded-xl border border-forest-500 px-4 py-2.5 text-sm text-cream-muted hover:text-gold-300 transition"
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