export type BookingStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type SlotType = 'standard' | 'fixed_2hr';

export interface Court {
  id: string;
  name: string;
  description: string;
  image: string;
  price_per_hour: number;
  peak_price_per_hour: number;
  open_time: string; // "05:00"
  close_time: string; // "23:00"
  amenities: string[];
  surface: string;
  is_indoor: boolean;
  is_active: boolean;
}

export interface TimeSlot {
  id: string;
  court_id: string;
  date: string; // ISO date "2026-08-26"
  start_time: string; // "05:00"
  end_time: string; // "06:00"
  type: SlotType;
  price: number;
  is_available: boolean;
  is_peak: boolean;
}

export interface BookingSlotItem {
  slot_id: string;
  start_time: string;
  end_time: string;
  date: string;
  type: SlotType;
  price: number;
  is_peak: boolean;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Booking {
  id: string;
  reference_code: string;
  court_id: string;
  court_name: string;
  date: string;
  slots: BookingSlotItem[];
  customer: CustomerDetails;
  total_amount: number;
  status: BookingStatus;
  payment_screenshot_url?: string | null;
  payment_reference?: string;
  gcash_number: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: string;
  court_id: string;
  date: string;
  reason: string;
}

export interface PricingRule {
  court_id: string;
  peak_start: string;
  peak_end: string;
  peak_price: number;
  off_peak_price: number;
  weekend_multiplier: number;
}

export interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  activeUsers: number;
  revenueByDay: { date: string; revenue: number }[];
  bookingsByDay: { date: string; bookings: number }[];
  revenueGrowth: number;
  bookingsGrowth: number;
  usersGrowth: number;
}
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export type AdminView = 'calendar' | 'list';
