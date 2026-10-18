// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import {
  MapPin,
  Facebook,
  Clock,
  FileText,
  Lock,
  RotateCcw,
  Wallet,
  UserCog,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { APP_CONFIG } from '@/utils/constants';
import { useClientStore } from '@/stores/clientStore';
import { useBookingStore } from '@/stores/bookingStore';

export function Footer() {
  const settings = useClientStore((state) => state.settings);

  // Get courts to calculate dynamic hours
  const courts = useBookingStore((state) => state.courts);

  // Function to calculate the operating hours based on court data
  const getOperatingHours = () => {
    if (!courts || courts.length === 0) return '7:00 AM – 12:00 AM';
    
    const earliestOpen = courts.reduce((earliest, court) => 
      court.open_time < earliest ? court.open_time : earliest
    , courts[0].open_time);
    
    const latestClose = courts.reduce((latest, court) => 
      court.close_time > latest ? court.close_time : latest
    , courts[0].close_time);

    const formatTime = (timeStr: string) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return minute === 0 ? `${hour12}:00 ${ampm}` : `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
    };

    return `${formatTime(earliestOpen)} – ${formatTime(latestClose)}`;
  };

  return (
    <footer className="border-t border-forest-700/80 bg-forest-950 text-cream">
      <div className="container-page py-8 sm:py-12">
        {/* Logo and Social links */}
        <div className="mb-6 sm:mb-8">
          <Logo size="md" to="" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-muted sm:mt-4">
            {APP_CONFIG.tagline}
          </p>
          <div className="mt-3.5 flex gap-2.5 sm:mt-4">
            <a
              href="https://www.facebook.com/profile.php?id=61594106069425"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-forest-700/80 bg-forest-900/60 p-2 text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-brand-blue-300 sm:mb-4 sm:text-sm">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
              <li>
                <Link to="/" className="text-cream-muted transition hover:text-brand-blue-300">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="text-cream-muted transition hover:text-brand-blue-300"
                >
                  Book a Court
                </Link>
              </li>
              <li>
                <Link
                  to="/open-play"
                  className="text-cream-muted transition hover:text-brand-blue-300"
                >
                  Open Play
                </Link>
              </li>
              <li>
                <Link
                  to="/track"
                  className="text-cream-muted transition hover:text-brand-blue-300"
                >
                  Track Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-brand-blue-300 sm:mb-4 sm:text-sm">
              <FileText className="h-3.5 w-3.5" />
              Legal
            </h4>
            <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
              <li>
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-1.5 text-cream-muted transition hover:text-brand-blue-300"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-1.5 text-cream-muted transition hover:text-brand-blue-300"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="inline-flex items-center gap-1.5 text-cream-muted transition hover:text-brand-blue-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/payment-policy"
                  className="inline-flex items-center gap-1.5 text-cream-muted transition hover:text-brand-blue-300"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Payment Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-brand-blue-300 sm:mb-4 sm:text-sm">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-muted sm:space-y-3 sm:text-sm">
              <li className="flex items-start gap-2.5">
                {/* 👇 Replaced Phone with Facebook Link */}
                <Facebook className="h-4 w-4 shrink-0 text-brand-blue-300 mt-0.5" />
                <a 
                  href="https://www.facebook.com/profile.php?id=61594106069425&mibextid=wwXIfr&rdid=2CqRPgsgi7BZIBAd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D5snWhetr%2F#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-snug hover:text-brand-blue-300 transition"
                >
                  Center Court Tandag
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-brand-blue-300 mt-0.5" />
                <span className="leading-snug">
                  San Agustin Sur "Dawis", Tandag City, Surigao del Sur
                </span>
              </li>
            </ul>
          </div>

          {/* Hours + Staff Link */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-brand-blue-300 sm:mb-4 sm:text-sm">
              Hours
            </h4>
            <ul className="space-y-2 text-xs text-cream-muted sm:space-y-2.5 sm:text-sm">
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-brand-blue-300" />
                <span>Mon – Sun · {getOperatingHours()}</span>
              </li>
            </ul>
            <Link
              to="/admin"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-forest-700/80 bg-forest-900/50 px-3 py-1.5 text-xs font-semibold text-cream-muted transition hover:border-brand-blue-400 hover:text-brand-blue-300"
            >
              <UserCog className="h-3.5 w-3.5" />
              Staff Login
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2.5 border-t border-forest-700/80 pt-5 sm:mt-10 sm:gap-3 sm:pt-6 sm:flex-row text-xs text-cream-muted">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p>
            <span className="font-semibold text-brand-blue-300">Est. {APP_CONFIG.established}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}