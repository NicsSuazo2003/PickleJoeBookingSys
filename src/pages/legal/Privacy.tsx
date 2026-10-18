// src/pages/legal/Privacy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Lock,
  Eye,
  Trash2,
  UserCheck,
  Database,
  Share2,
  Cookie,
  RefreshCw,
  Mail,
  Facebook,
  MapPin,
  FileText,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function Privacy() {
  useEffect(() => {
    document.title = `Privacy Policy | ${APP_CONFIG.name}`;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <Navbar />

      <div className="container-page pt-24 pb-16">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-cream-muted transition hover:text-brand-blue-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-court-400/30 bg-court-600/30">
              <Shield className="h-6 w-6 text-court-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Privacy Policy
              </h1>
              <p className="text-xs text-cream-muted sm:text-sm">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-PH', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <FileText className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Introduction</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                {APP_CONFIG.name} ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, store, and protect your personal
                information when you use our booking system and facility.
              </p>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Eye className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-cream-muted">
                <div>
                  <h3 className="font-semibold text-cream">Personal Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>
                      <strong className="text-cream">Name:</strong> Full name for booking
                      identification
                    </li>
                    <li>
                      <strong className="text-cream">Email address:</strong> For booking
                      confirmations and updates
                    </li>
                    <li>
                      <strong className="text-cream">Mobile number:</strong> For urgent
                      booking-related contact
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-cream">Booking & Payment Information</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>Dates, times, and courts you've booked</li>
                    <li>Payment reference number and screenshots for verification</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Database className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">How We Use Your Information</h2>
              </div>
              <ul className="list-inside list-disc space-y-1.5 pl-2 text-sm leading-relaxed text-cream-muted">
                <li>To process reservations and communicate booking-related updates</li>
                <li>To verify your payment and confirm your reservation</li>
                <li>To maintain records for accounting and tax purposes</li>
                <li>To prevent fraud and enforce our Terms & Conditions</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Share2 className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Information Sharing</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p className="font-semibold text-cream">
                  We do not sell or disclose your personal information to third parties for commercial purposes.
                </p>
                <p>We may only share your information in these limited circumstances:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Legal requirements:</strong> If required by law, court order, or government request
                  </li>
                  <li>
                    <strong className="text-cream">Facility operations:</strong> Staff members who need your information to manage your booking
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Lock className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">How We Store & Protect Your Data</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Storage:</strong> Your data is stored on secure servers.
                  </li>
                  <li>
                    <strong className="text-cream">Access control:</strong> Only authorized staff and administrators can access your booking and payment information.
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Changes to This Policy</h2>
              </div>
              <p className="text-sm leading-relaxed text-cream-muted">
                We may update this Privacy Policy from time to time. Material changes will be
                communicated via email or a notice on our website. Your continued use of our
                services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="rounded-2xl border border-court-400/30 bg-court-600/20 p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-bold text-cream">
                Contact Us
              </h2>
              <ul className="space-y-2 text-sm text-cream-muted">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-court-300" />
                  <span>centercourttandag@gmail.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  {/* 👇 Replaced Phone with Facebook */}
                  <Facebook className="h-4 w-4 shrink-0 text-court-300" />
                  <a 
                    href="https://www.facebook.com/profile.php?id=61594106069425&mibextid=wwXIfr&rdid=2CqRPgsgi7BZIBAd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D5snWhetr%2F#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-blue-300 transition"
                  >
                    Center Court Tandag
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-court-300" />
                  <span>San Agustin Sur "Dawis", Tandag City, Surigao del Sur</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}