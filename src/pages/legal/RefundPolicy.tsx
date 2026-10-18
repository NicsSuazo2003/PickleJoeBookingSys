// src/pages/legal/RefundPolicy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ArrowLeft,
  Clock,
  Mail,
  Facebook,
  ShieldAlert,
  HelpCircle,
  Ban,
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
                <h2 className="text-lg font-bold text-rose-400">No Cancellation Policy</h2>
                <p className="mt-2 text-sm leading-relaxed text-cream-muted">
                  <strong className="text-cream">Confirmed bookings are non-cancellable and non-refundable.</strong> Please make sure you can attend before booking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Slot Transfers */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Ban className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">If You Cannot Attend</h2>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-cream-muted">
                <p>
                  If you cannot attend your confirmed booking, you may arrange for someone else to take your slot. You are responsible for settling payment directly with them. Our facility is not involved in any payment disputes between players.
                </p>
              </div>
            </section>

            {/* Facility Cancellations */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <h2 className="text-lg font-bold text-cream">Facility-Initiated Cancellations</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Center Court reserves the right to cancel or reschedule bookings due to:
                </p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>Facility maintenance</li>
                  <li>Safety concerns</li>
                  <li>Force majeure events</li>
                </ul>
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                  <p className="text-xs text-cream-muted">
                    If we cancel your booking for the reasons above, we will contact you directly to arrange a refund or reschedule.
                  </p>
                </div>
              </div>
            </section>

            {/* How to Request */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">Need Help?</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>If you have questions about our cancellation policy, please contact us:</p>
                <div className="mt-3 space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-court-300" />
                    <span>centercourttandag@gmail.com</span>
                  </p>
                  <p className="flex items-center gap-2">
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
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}