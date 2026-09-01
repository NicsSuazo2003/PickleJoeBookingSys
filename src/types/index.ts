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
  image_url?: string;
  price_per_hour: number;
  peak_price_per_hour: number;
  open_time: string;
  close_time: string;
  amenities: string[];
  surface: string;
  dimensions?: string;
  images?: string[];
  rating?: number;
  type?: string;
  is_indoor: boolean;
  is_active: boolean;
  status?: string;
  client_id?: string;
}

export interface TimeSlot {
  id: string;
  court_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: SlotType;
  price: number;
  is_available: boolean;
  is_peak: boolean;
}

export interface BookingSlotItem {
  id: string;           // ✅ Add this
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
  total_bookings: number;
  total_revenue: number;
  pending_payments: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  status_breakdown: Record<BookingStatus, number>;
  revenue_by_day: { date: string; revenue: number; bookings: number }[];
  court_breakdown: { court_id: string; court_name: string; bookings: number; revenue: number }[];
}

// src/types/index.ts
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'staff';  // ✅ Already has this
  avatar?: string;
  createdAt?: string;
  bookingsCount?: number;
  status?: string;
}
export interface ClientSettings {
  id: string;
  name: string;
  subdomain: string;
  logo_url?: string | null;
  primary_color: string;
  accent_color: string;
  gcash_number?: string | null;
  gcash_account_name?: string | null;
}

export type AdminView = 'calendar' | 'list';