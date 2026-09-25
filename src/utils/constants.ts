export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME ?? 'Center Court',
  demoMode: (import.meta.env.VITE_DEMO_MODE ?? 'false') === 'true',
  apiUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://pickleballcourbookingv2.onrender.com',
  tagline: 'Book Your Court. Play Your Game.',
  established: '2026',
  gcashNumber: '09XX XXX XXXX',
  gcashAccountName: 'Center Court',
  developer: 'Astravex Systems',
  paymentTimerSeconds: 15 * 60,
};

export const FIXED_SLOT = {
  start: '16:00',
  end: '18:00',
  label: '2hr Fixed',
  description: '4:00 PM - 6:00 PM',
  hours: 2,
};

export const ADMIN_CREDENTIALS = {
  email: 'admin@sideout.com',
  password: 'Admin123!',
};

export const BOOKING_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending_payment: {
    label: 'Pending Payment',
    color: 'text-warning',
    bg: 'bg-warning/15',
    border: 'border-warning/40',
    dot: 'bg-warning',
  },
  payment_submitted: {
    label: 'Payment Submitted',
    color: 'text-court-300',
    bg: 'bg-court-600/20',
    border: 'border-court-400/40',
    dot: 'bg-court-400',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-success',
    bg: 'bg-success/15',
    border: 'border-success/40',
    dot: 'bg-success',
  },
  completed: {
    label: 'Completed',
    color: 'text-court-200',
    bg: 'bg-court-600/30',
    border: 'border-court-400/50',
    dot: 'bg-court-300',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-error',
    bg: 'bg-error/15',
    border: 'border-error/40',
    dot: 'bg-error',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-error',
    bg: 'bg-error/15',
    border: 'border-error/40',
    dot: 'bg-error',
  },
  expired: {
    label: 'Expired',
    color: 'text-cream-muted',
    bg: 'bg-forest-600/30',
    border: 'border-forest-500/50',
    dot: 'bg-forest-400',
  },
  refunded: {
    label: 'Refunded',
    color: 'text-purple-300',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/40',
    dot: 'bg-purple-400',
  },
};

export const COURT_IMAGES = {
  hero: '/images/bg1.jpg',
  court1: '/images/bg1.jpg',
  court2: '/images/bg2.jpg',
  court3: '/images/bg3.jpg',
  gallery1: '/images/bg1.jpg',
  gallery2: '/images/bg2.jpg',
  gallery3: '/images/bg3.jpg',
  gallery4: '/images/bg1.jpg',
  heroSlideshow: [
    '/images/bg1.jpg',
    '/images/bg2.jpg',
    '/images/bg3.jpg',
  ],
};

export const AMENITIES_LIST = [
  'Covered Court',
  'Tournament Surface',
  'Lighted',
  'Parking',
  'Water Station',
  'Spectator Seating',
  'WiFi',
];