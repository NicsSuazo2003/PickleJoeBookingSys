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
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo size="md" to="" />
            <p className="mt-4 text-sm text-cream-muted leading-relaxed">
              {APP_CONFIG.tagline}
            </p>
            <div className="mt-4 flex gap-3">
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

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gold-300">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
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
            <h4 className="mb-4 text-sm font-semibold text-gold-300">Contact</h4>
            <ul className="space-y-2.5 text-sm text-cream-muted">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-400" />
                San Agustin Sur "Dawis", Tandag City, Surigao del Sur, Philippines 
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400" />
                {displayNumber}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold-400" />
                5:00 AM - 11:00 PM Daily
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gold-300">Payment</h4>
            <div className="rounded-xl border border-forest-500 bg-forest-700 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 font-bold text-white text-xs">
                  G
                </div>
                <div>
                  <p className="text-xs font-medium text-cream">GCash</p>
                  <p className="text-xs text-cream-muted">{displayNumber}</p>
                </div>
              </div>
            </div>
            <Link
              to="/admin"
              className="mt-4 flex items-center gap-2 text-xs text-cream-muted hover:text-gold-300 transition"
            >
              <Shield className="h-3.5 w-3.5" />
              Staff Login
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-forest-500 pt-6 sm:flex-row">
          <p className="text-xs text-cream-muted">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-cream-muted">
            <span className="font-display font-semibold text-gold-400">Est. {APP_CONFIG.established}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}