// src/pages/legal/RefundPolicy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  ShieldAlert,
  Zap,
  Wrench,
  CloudLightning,
  Copy,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function RefundPolicy() {
  useEffect(() => {
    document.title = `Refund & Cancellation Policy | ${APP_CONFIG.name}`;
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
              <RotateCcw className="h-6 w-6 text-court-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Refund & Cancellation Policy
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

          {/* Summary Box */}
          <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/25 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose-400" />
              <div>
                <h2 className="text-lg font-bold text-rose-400">No Refund Policy</h2>
                <p className="mt-2 text-sm leading-relaxed text-cream-muted">
                  <strong className="text-cream">All bookings are final.</strong> Once your payment
                  is verified and your booking is confirmed, we do not offer cancellations, refunds,
                  or rescheduling. Please make sure you can attend before booking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* When Refunds ARE Given */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                <h2 className="text-lg font-bold text-cream">When We DO Issue Refunds</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-cream-muted">
                <p>We only issue refunds in the following situations:</p>

                <div className="rounded-xl border border-forest-700/60 bg-forest-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 shrink-0 text-court-300" />
                    <h3 className="font-semibold text-cream">1. Facility-Initiated Cancellations</h3>
                  </div>
                  <p className="mt-1.5">If we cancel your booking due to:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                    <li>Court maintenance or repairs</li>
                    <li>Power outages or facility issues</li>
                    <li>Double-booking errors on our end</li>
                  </ul>
                  <p className="mt-2 text-green-300">
                    → You will receive a <strong>full refund</strong> OR priority rebooking at your
                    choice.
                  </p>
                </div>

                <div className="rounded-xl border border-forest-700/60 bg-forest-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="h-4 w-4 shrink-0 text-court-300" />
                    <h3 className="font-semibold text-cream">2. Force Majeure Events</h3>
                  </div>
                  <p className="mt-1.5">In cases of:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                    <li>Government-mandated closures</li>
                    <li>Typhoons or severe weather warnings</li>
                    <li>Other events beyond our control</li>
                  </ul>
                  <p className="mt-2 text-green-300">
                    → We may offer a <strong>credit or rebooking</strong> at our discretion.
                  </p>
                </div>

                <div className="rounded-xl border border-forest-700/60 bg-forest-950/60 p-4">
                  <div className="flex items-center gap-2">
                    <Copy className="h-4 w-4 shrink-0 text-court-300" />
                    <h3 className="font-semibold text-cream">3. Duplicate Payments</h3>
                  </div>
                  <p className="mt-1.5">
                    If you accidentally sent payment twice for the same booking:
                  </p>
                  <p className="mt-2 text-green-300">
                    → We will refund the duplicate amount within{' '}
                    <strong>3-5 business days</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* When Refunds Are NOT Given */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                <h2 className="text-lg font-bold text-cream">When We DO NOT Issue Refunds</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-2.5 pl-2">
                  <li>
                    <strong className="text-cream">Change of plans:</strong> You decided not to play
                    or found something else to do
                  </li>
                  <li>
                    <strong className="text-cream">Weather conditions:</strong> Rain or heat that
                    doesn't result in an official facility closure
                  </li>
                  <li>
                    <strong className="text-cream">Late arrival or no-show:</strong> You didn't show
                    up or arrived after the 15-minute grace period
                  </li>
                  <li>
                    <strong className="text-cream">Injury or illness:</strong> You or your group
                    can't play due to health reasons
                  </li>
                  <li>
                    <strong className="text-cream">Dissatisfaction with play:</strong> You didn't
                    enjoy the session or had issues with other players
                  </li>
                  <li>
                    <strong className="text-cream">Open play minimum not met:</strong> Sessions with
                    fewer than 4 players may be cancelled — in this case, you DO get a refund
                  </li>
                </ul>
              </div>
            </section>

            {/* Expired Payment Holds */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <h2 className="text-lg font-bold text-cream">Expired Payment Holds</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Your slots are held for{' '}
                  <strong className="text-cream">
                    {Math.round(APP_CONFIG.paymentTimerSeconds / 60)} minutes
                  </strong>{' '}
                  after you create a booking. If you don't submit payment within this window:
                </p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>Your slots are automatically released for other customers</li>
                  <li>Your booking is marked as "expired"</li>
                  <li>No refund is needed because no payment was verified</li>
                </ul>
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-xs font-semibold text-amber-200">
                      What if I already sent payment but the timer expired?
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs text-cream-muted">
                    Contact us immediately with your booking reference and payment receipt. We will
                    manually review your case. If the slot is still available, we may be able to
                    confirm your booking. If it's already taken, we will issue a refund within 3-5
                    business days.
                  </p>
                </div>
              </div>
            </section>

            {/* How to Request */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">How to Request a Refund</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>If you believe you qualify for a refund under the exceptions above:</p>
                <ol className="list-inside list-decimal space-y-2 pl-2">
                  <li>
                    Contact us within <strong className="text-cream">48 hours</strong> of the incident
                  </li>
                  <li>Provide your booking reference code</li>
                  <li>Provide your payment receipt or reference number</li>
                  <li>Explain the reason for your refund request</li>
                </ol>
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-court-300" />
                    <span>support@centercourt.ph</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-court-300" />
                    <span>{APP_CONFIG.paymentNumber}</span>
                  </p>
                </div>
                <p className="text-xs">
                  Refunds are processed within 3-5 business days via the same payment method used.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}