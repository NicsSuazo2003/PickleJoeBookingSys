// src/pages/legal/Terms.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  CalendarCheck,
  Wallet,
  Ban,
  ArrowLeftRight,
  Clock,
  Users,
  Dumbbell,
  Scale,
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
            {/* Section 1 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">1. Booking Confirmation</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  A booking is only considered <strong className="text-cream">confirmed</strong> after:
                </p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>You complete the booking form and receive a booking reference code</li>
                  <li>You send payment using one of our accepted payment methods</li>
                  <li>You submit your payment reference number through our checkout page</li>
                  <li>Our staff verifies your payment and marks the booking as confirmed</li>
                </ul>
                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <p className="text-xs text-amber-200">
                    <strong>Important:</strong> Your booking reference code is NOT proof of payment.
                    The slot is only secured once payment is verified.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Wallet className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">2. Payment Terms</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Exact amount required:</strong> You must send the
                    exact amount shown at checkout. Partial payments will not be accepted and may
                    result in booking cancellation.
                  </li>
                  <li>
                    <strong className="text-cream">Payment window:</strong> Your selected time slots
                    are held for{' '}
                    <strong className="text-cream">
                      {Math.round(APP_CONFIG.paymentTimerSeconds / 60)} minutes
                    </strong>
                    . You must send payment and submit your reference number within this window.
                  </li>
                  <li>
                    <strong className="text-cream">Expired holds:</strong> If payment is not
                    submitted within the time limit, the slots are automatically released for other
                    customers.
                  </li>
                  <li>
                    <strong className="text-cream">Payment verification:</strong> All payments are
                    manually verified by our staff. This typically takes 1–4 hours during business
                    hours.
                  </li>
                  <li>
                    <strong className="text-cream">Fraudulent submissions:</strong> Submitting fake
                    payment screenshots or reference numbers is grounds for immediate cancellation
                    and potential permanent ban from our facility.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 — NO CANCELLATION */}
            <section className="rounded-2xl border border-rose-900/50 bg-rose-950/25 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Ban className="h-5 w-5 shrink-0 text-rose-400" />
                <h2 className="text-lg font-bold text-rose-400">
                  3. No Cancellation & No Refund Policy
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-bold text-rose-400">ALL BOOKINGS ARE FINAL.</p>
                    <p className="mt-1.5">
                      Once your payment is verified and your booking is confirmed:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
                      <li>No cancellations will be accepted</li>
                      <li>No refunds will be issued</li>
                      <li>No rescheduling to a different date or time</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4">
                  <strong className="text-cream">Exceptions:</strong> The only exceptions to this
                  policy are:
                </p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Facility-initiated cancellations:</strong> If we
                    cancel your booking due to court maintenance, power outages, or other facility
                    issues, you will receive a full refund or priority rebooking at your choice.
                  </li>
                  <li>
                    <strong className="text-cream">Force majeure events:</strong> Government-mandated
                    closures, typhoons, or other events beyond our control may qualify for credit or
                    rebooking at our discretion.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <ArrowLeftRight className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">4. Slot Transfers</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  If you cannot make it to your booking, you may find someone else to take your slot.
                  However:
                </p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>You are responsible for settling payment directly with the replacement player</li>
                  <li>Our facility is not involved in any payment disputes between players</li>
                  <li>
                    We do not need to be notified of slot transfers, but the replacement must present
                    the original booking reference at check-in
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">
                  5. Late Arrival & No-Show Policy
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Grace period:</strong> You have a 15-minute grace
                    period after your scheduled start time.
                  </li>
                  <li>
                    <strong className="text-cream">Released slots:</strong> After 15 minutes, your
                    court may be released to walk-in customers without refund.
                  </li>
                  <li>
                    <strong className="text-cream">No-shows:</strong> Failure to show up for your
                    booking will result in forfeiture of your payment with no refund.
                  </li>
                  <li>
                    <strong className="text-cream">Late arrival:</strong> Your session still ends at
                    the originally scheduled time — you cannot extend your booking due to late
                    arrival.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Dumbbell className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">6. Code of Conduct</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>All players must:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>Wear proper athletic footwear (non-marking court shoes preferred)</li>
                  <li>Treat other players, staff, and the facility with respect</li>
                  <li>Refrain from aggressive behavior, harassment, or unsportsmanlike conduct</li>
                  <li>Follow all safety rules and instructions from staff</li>
                  <li>Report any injuries or facility damage immediately</li>
                </ul>
                <p className="mt-3">
                  <strong className="text-cream">Right to refuse service:</strong> We reserve the
                  right to refuse entry or remove any person who violates these rules, with no
                  refund.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">7. Facility Rules</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>No food or sugary drinks on the courts</li>
                  <li>Water is allowed in spill-proof containers only</li>
                  <li>Children under 12 must be supervised by an adult at all times</li>
                  <li>No smoking or vaping anywhere on the premises</li>
                  <li>
                    Personal belongings are your responsibility — we are not liable for lost or
                    stolen items
                  </li>
                  <li>Report any equipment damage before leaving</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Scale className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">8. Liability Waiver</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>By booking and using our facility, you acknowledge that:</p>
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>Pickleball is a physical sport with inherent risks of injury</li>
                  <li>You participate voluntarily and assume all risks</li>
                  <li>
                    {APP_CONFIG.name} is not liable for injuries sustained during play, except in
                    cases of gross negligence or willful misconduct
                  </li>
                  <li>You are responsible for your own health and fitness to play</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <Users className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">9. Open Play Sessions</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <ul className="list-inside list-disc space-y-1.5 pl-2">
                  <li>
                    <strong className="text-cream">Minimum players:</strong> Open play sessions may
                    be cancelled if fewer than 4 players sign up. You will be notified at least 2
                    hours before the session starts.
                  </li>
                  <li>
                    <strong className="text-cream">Refunds for cancelled sessions:</strong> If we
                    cancel an open play session, you will receive a full refund or credit.
                  </li>
                  <li>
                    <strong className="text-cream">Skill levels:</strong> Skill level labels are
                    self-reported. We do not verify skill levels, and players should be respectful of
                    all skill levels.
                  </li>
                  <li>
                    <strong className="text-cream">Host authority:</strong> Session hosts have the
                    authority to address disruptive behavior and may ask players to leave.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section className="rounded-2xl border border-forest-700/80 bg-forest-900/80 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <RefreshCw className="h-5 w-5 shrink-0 text-court-300" />
                <h2 className="text-lg font-bold text-cream">10. Changes to These Terms</h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-cream-muted">
                <p>
                  We reserve the right to update these Terms & Conditions at any time. Changes will
                  be effective immediately upon posting. Your continued use of our booking system
                  constitutes acceptance of the updated terms.
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
                  <span>support@centercourt.ph</span>
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
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}