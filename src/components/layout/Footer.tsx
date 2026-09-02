import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { APP_CONFIG } from '@/utils/constants';
import { useClientStore } from '@/stores/clientStore';

export function Footer() {
  const settings = useClientStore((state) => state.settings);
  const displayNumber = settings?.gcash_number || APP_CONFIG.gcashNumber;

  return (
    <footer className="border-t border-forest-500 bg-forest-950">
      <div className="container-page py-8 sm:py-12">
        {/* Logo/social gets its own full-width row; the other three columns
            pair up 2-per-row on mobile instead of stacking 1-per-row */}
        <div className="mb-6 sm:mb-8">
          <Logo size="md" to="" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-muted sm:mt-4">
            {APP_CONFIG.tagline}
          </p>
          <div className="mt-3 flex gap-3 sm:mt-4">
            <a
              href="#"
              className="rounded-lg border border-forest-500 p-2 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-lg border border-forest-500 p-2 text-cream-muted transition hover:border-gold-400 hover:text-gold-300"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gold-300 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
              <li>
                <Link to="/" className="text-cream-muted hover:text-gold-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-cream-muted hover:text-gold-300 transition">
                  Book a Court
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-cream-muted hover:text-gold-300 transition">
                  Track Booking
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-cream-muted hover:text-gold-300 transition">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gold-300 sm:mb-4">Contact</h4>
            <ul className="space-y-2 text-xs text-cream-muted sm:space-y-2.5 sm:text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-gold-400" />
                <span>San Agustin Sur "Dawis", Tandag City, Surigao del Sur, Philippines</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-gold-400" />
                {displayNumber}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0 text-gold-400" />
                5:00 AM - 11:00 PM Daily
              </li>
            </ul>
          </div>

          {/* Payment — spans both mobile columns since a bordered card reads
              oddly squeezed into a half-width slot; single-line summary
              instead of the icon+card treatment to save height */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-3 text-sm font-semibold text-gold-300 sm:mb-4">Payment</h4>
            <div className="flex items-center gap-2 rounded-lg border border-forest-500 bg-forest-700 px-3 py-2">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500 text-[10px] font-bold text-white">
                G
              </div>
              <p className="text-xs text-cream-muted">
                <span className="font-medium text-cream">GCash</span> · {displayNumber}
              </p>
            </div>
            <Link
              to="/admin"
              className="mt-3 flex items-center gap-2 text-xs text-cream-muted hover:text-gold-300 transition"
            >
              <Shield className="h-3.5 w-3.5" />
              Staff Login
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2.5 border-t border-forest-500 pt-5 sm:mt-10 sm:gap-3 sm:pt-6 sm:flex-row">
          <p className="text-xs text-cream-muted">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-cream-muted">
            <span className="font-semibold text-gold-400">Est. {APP_CONFIG.established}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}