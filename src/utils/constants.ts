export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME ?? 'PickleJoe',
  demoMode: (import.meta.env.VITE_DEMO_MODE ?? 'false') === 'true', // ✅ Default to false
  apiUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://pickleballcourbookingv2.onrender.com',
  tagline: 'Book Your Court. Play Your Game.',
  established: '2026',
  gcashNumber: '09XX XXX XXXX',
  gcashAccountName: 'PickleJoe Courts',
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

// ✅ Remove hardcoded admin credentials - use backend
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
    color: 'text-blue-300',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    dot: 'bg-blue-400',
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
    color: 'text-gold-300',
    bg: 'bg-gold-500/15',
    border: 'border-gold-500/40',
    dot: 'bg-gold-400',
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
};

export const COURT_IMAGES = {
  court1: 'https://images.pexels.com/photos/17299530/pexels-photo-17299530.jpeg?auto=compress&cs=tinysrgb&w=1200',
  court2: 'https://images.pexels.com/photos/32975182/pexels-photo-32975182.jpeg?auto=compress&cs=tinysrgb&w=1200',
  court3: 'https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg?auto=compress&cs=tinysrgb&w=1200',
  hero: 'https://images.pexels.com/photos/17299526/pexels-photo-17299526.jpeg?auto=compress&cs=tinysrgb&w=1600',
  gallery1: 'https://images.pexels.com/photos/17299531/pexels-photo-17299531.jpeg?auto=compress&cs=tinysrgb&w=800',
  gallery2: 'https://images.pexels.com/photos/17299528/pexels-photo-17299528.jpeg?auto=compress&cs=tinysrgb&w=800',
  gallery3: 'https://images.pexels.com/photos/19642670/pexels-photo-19642670.jpeg?auto=compress&cs=tinysrgb&w=800',
  gallery4: 'https://images.pexels.com/photos/38208389/pexels-photo-38208389.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export const AMENITIES_LIST = [
  'Indoor',
  'Outdoor',
  'Lighted',
  'Air Conditioned',
  'Parking',
  'Showers',
  'Pro Shop',
  'Water Station',
  'Spectator Seating',
  'WiFi',
];