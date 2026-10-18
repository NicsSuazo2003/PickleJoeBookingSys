// src/pages/legal/Terms.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Mail,
  Facebook,
  MapPin,
  AlertTriangle,
  CalendarCheck,
  Ban,
  ShieldAlert,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { APP_CONFIG } from '@/utils/constants';

export function Terms() {
  useEffect(() => {
    document.title = `Terms & Conditions | ${APP_CONFIG.name}`;
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
              <FileText className="h-6 w-6 text-court-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
                Terms & Conditions
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
            {/* Intro */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-cream-muted">
                Please read these Terms & Conditions carefully before booking a court or using the facilities of Center Court Sports Center. These terms govern your use of our facilities and online booking services.
              </p>
            </section>

            {/* Section 1 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">1. Acceptance of Terms</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  By using our facilities or booking platform, you agree to comply with these Terms & Conditions. If you do not agree to these terms, please do not proceed with your reservation.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">2. Court Bookings</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  All court reservations are subject to availability. A booking is confirmed only upon receipt of a confirmation email. Center Court reserves the right to cancel or reschedule bookings due to facility maintenance, safety concerns, or force majeure events.
                </p>
              </div>
            </section>

            {/* Section 3 — NO CANCELLATION */}
            <section className="rounded-2xl border border-rose-900/50 bg-rose-950/25 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Ban className="h-5 w-5 shrink-0 text-rose-400" />
                <h2 className="text-lg font-bold text-rose-400">
                  3. No Cancellation Policy
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-bold text-rose-400">ALL BOOKINGS ARE FINAL.</p>
                    <p className="mt-1.5">
                      Confirmed bookings are non-cancellable and non-refundable. If you cannot attend, you may arrange for someone else to take your slot and settle payment directly with them.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Users className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">4. Walk-in Policy</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Walk-ins are welcome, subject to court availability. Advance online booking is recommended, especially during peak hours, to secure your preferred time slot.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">5. Player Conduct</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  All players must treat staff, fellow players, and the facility with respect. Center Court Sports Center reserves the right to remove anyone displaying disruptive, unsafe, or inappropriate behavior without a refund.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">6. Facility Rules</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>Players must wear non-marking athletic shoes at all times.</li>
                  <li>Food and beverages are not allowed on the court surface.</li>
                  <li>All players must observe proper court etiquette and respect their reserved playing time.</li>
                  <li>The use of loudspeakers and excessive shouting are prohibited, especially after 10:00 PM, to maintain a peaceful environment for nearby residents.</li>
                  <li>Pets are not allowed in the court playing area or courtside but are permitted in the designated waiting area.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">7. Equipment & Property</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  By making a booking, the booking party agrees to be financially responsible for any damage to the facility or rental equipment caused by negligence, misuse, or willful misconduct by themselves or any individual included in the booking. Repair or replacement costs will be assessed by facility management and must be paid in full by the booking party.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">8. Medical Fitness</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  All participants acknowledge their responsibility to ensure they are physically fit to play, recognize their health limitations, and obtain medical clearance when necessary.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">9. Liability Waiver, Release & Indemnity</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Pickleball is a physical sport that carries inherent risks of injury. By making a reservation or using our facilities, the booking party and all participants acknowledge these risks and agree, to the extent permitted by law, to release and hold harmless Center Court Sports Center, its owners, and employees from claims or liabilities arising from personal injury, property damage, or death related to the use of the facility.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Users className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">10. Minors (Under 18)</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Minors must be accompanied by a parent or legal guardian throughout their visit. The parent or legal guardian is responsible for the minor's safety, conduct, and compliance with these Terms & Conditions while using the facility. The parent or legal guardian must ensure that the minor follows all facility rules.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <FileText className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">11. Privacy</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Personal information collected during booking, such as your name, email address, and phone number, is used only to process reservations and communicate booking-related updates. We do not sell or disclose your personal information to third parties for commercial purposes.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">12. Changes to Terms</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  Center Court Sports Center reserves the right to modify or update these Terms and Conditions at any time. Continued use of our facilities or booking platform constitutes acceptance of the revised terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="rounded-2xl border border-court-400/30 bg-court-600/20 p-5 sm:p-6">
              <h2 className="mb-3 text-lg font-bold text-cream">Questions?</h2>
              <p className="text-sm leading-relaxed text-cream-muted">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-cream-muted">
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