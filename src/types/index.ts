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
  image_url?: string;
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
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface BookingSlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  referenceCode: string;
  date: string;
  slots: BookingSlotItem[];
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: string;
  createdAt: string;
  notes: string;
  paymentScreenshot: string | null;
  paymentExpiresAt: string | null;
}
export interface SlotSelection {
  slot_id: string;
  start_time: string;
  end_time: string;
  date: string;
  type: SlotType;
  price: number;
  is_peak: boolean;
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
