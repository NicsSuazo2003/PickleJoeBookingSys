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
  Phone,
  MapPin,
  CreditCard,
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
                information when you use our booking system and facility. This policy complies with
                the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).
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
                    <li>
                      <strong className="text-cream">Notes/requests:</strong> Any special requests
                      you provide
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 shrink-0 text-court-300" />
                    <h3 className="font-semibold text-cream">Payment Information</h3>
                  </div>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>
                      <strong className="text-cream">Payment reference number:</strong> From your
                      payment receipt
                    </li>
                    <li>
                      <strong className="text-cream">Payment screenshots:</strong> If you upload them
                      for verification
                    </li>
                    <li>
                      <strong className="text-cream">Payment method used:</strong> GCash, bank
                      transfer, etc.
                    </li>
                  </ul>
                  <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                    <strong>Note:</strong> We do NOT collect or store your full bank account numbers,
                    credit card details, or payment app passwords. We only see what appears on the
                    receipt you provide.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-cream">Booking History</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                    <li>Dates, times, and courts you've booked</li>
                    <li>Booking status and payment verification records</li>
                    <li>Any cancellations or no-shows</li>
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
                <li>To create and manage your bookings</li>
                <li>To verify your payment and confirm your reservation</li>
                <li>
                  To communicate with you about your booking (confirmations, reminders, issues)
                </li>
                <li>To send you updates about your booking status</li>
                <li>To maintain records for accounting and tax purposes</li>
                <li>To improve our services and customer experience</li>
                <li>To prevent fraud and enforce our Terms & Conditions</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Lock className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">How We Store & Protect Your Data</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Storage:</strong> Your data is stored on secure
                    servers with encryption at rest.
                  </li>
                  <li>
                    <strong className="text-cream">Access control:</strong> Only authorized staff and
                    administrators can access your booking and payment information. Payment
                    screenshots are only viewable by staff who verify payments.
                  </li>
                  <li>
                    <strong className="text-cream">Retention period:</strong> We retain your booking
                    and payment records for <strong className="text-cream">3 years</strong> for
                    accounting, tax, and legal compliance purposes. After this period, records are
                    securely deleted.
                  </li>
                  <li>
                    <strong className="text-cream">No selling:</strong> We never sell, rent, or trade
                    your personal information to third parties.
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Share2 className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Information Sharing</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>We may share your information only in these limited circumstances:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Payment processors:</strong> If required to verify
                    or process payments (we currently use manual verification, so this is limited)
                  </li>
                  <li>
                    <strong className="text-cream">Legal requirements:</strong> If required by law,
                    court order, or government request
                  </li>
                  <li>
                    <strong className="text-cream">Facility operations:</strong> Staff members who
                    need your information to manage your booking
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <UserCheck className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">
                  Your Rights Under the Data Privacy Act
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>As a data subject under Philippine law, you have the right to:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Be informed:</strong> Know what data we collect
                    and why
                  </li>
                  <li>
                    <strong className="text-cream">Access:</strong> Request a copy of your personal
                    data we hold
                  </li>
                  <li>
                    <strong className="text-cream">Correct:</strong> Request correction of inaccurate
                    data
                  </li>
                  <li>
                    <strong className="text-cream">Erase:</strong> Request deletion of your data
                    (subject to legal retention requirements)
                  </li>
                  <li>
                    <strong className="text-cream">Object:</strong> Object to processing of your data
                    in certain circumstances
                  </li>
                  <li>
                    <strong className="text-cream">Data portability:</strong> Receive your data in a
                    structured format
                  </li>
                  <li>
                    <strong className="text-cream">File a complaint:</strong> Lodge a complaint with
                    the National Privacy Commission
                  </li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, contact us at{' '}
                  <strong className="text-cream">privacy@centercourt.ph</strong>. We will respond
                  within 15 business days.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Cookie className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Cookies & Local Storage</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>Our booking system uses:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Local storage:</strong> To remember your pending
                    booking reference so you can resume payment if you close the browser
                  </li>
                  <li>
                    <strong className="text-cream">Session storage:</strong> To remember dismissed
                    banners and temporary UI state
                  </li>
                  <li>
                    <strong className="text-cream">No third-party ad trackers:</strong> We do not use
                    Google Analytics, Facebook Pixel, or any advertising trackers
                  </li>
                </ul>
                <p className="mt-3">
                  You can clear your browser's local storage at any time, but this may affect your
                  ability to resume a pending booking.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Trash2 className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Data Retention & Deletion</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Active bookings:</strong> Retained while your
                    booking is active
                  </li>
                  <li>
                    <strong className="text-cream">Completed bookings:</strong> Retained for 3 years
                    for accounting purposes
                  </li>
                  <li>
                    <strong className="text-cream">Payment screenshots:</strong> Deleted after 6
                    months unless needed for dispute resolution
                  </li>
                  <li>
                    <strong className="text-cream">Account data:</strong> Deleted upon request,
                    subject to legal retention requirements
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
                Contact Our Data Protection Officer
              </h2>
              <ul className="space-y-2 text-sm text-cream-muted">
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-court-300" />
                  <span>privacy@centercourt.ph</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-court-300" />
                  <span>{APP_CONFIG.paymentNumber}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-court-300" />
                  <span>San Agustin Sur "Dawis", Tandag City, Surigao del Sur</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-cream-muted">
                For complaints, you may also contact the National Privacy Commission at
                privacy.gov.ph or complaint@privacy.gov.ph.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}