// src/services/bookingService.ts
import type { Booking, CustomerDetails, SlotSelection } from '@/types';
import { apiRequest } from './api';

// ✅ Normalizes raw API booking data (camelCase, flat customer fields) into the app's Booking shape
function normalizeBooking(raw: any): Booking {
  // Debug: log what we received
  console.log('📥 Raw booking data:', raw);
  console.log('📥 PaymentScreenshot raw value:', raw.paymentScreenshot ?? raw.PaymentScreenshot);

  return {
    id: raw.id,
    reference_code: raw.referenceCode ?? raw.reference_code,
    court_id: raw.courtId ?? raw.court_id,
    court_name: raw.courtName ?? raw.court_name,
    date: raw.date,
    slots: (raw.slots ?? []).map((s: any) => ({
      id: s.id,
      slot_id: s.slotId ?? s.slot_id ?? s.id,
      start_time: s.startTime ?? s.start_time,
      end_time: s.endTime ?? s.end_time,
      date: s.date ?? raw.date,
      type: s.type ?? 'standard',
      price: s.price ?? 0,
      is_peak: s.isPeak ?? s.is_peak ?? false,
    })),
    customer: {
      name: raw.customerName ?? raw.customer?.name,
      email: raw.customerEmail ?? raw.customer?.email,
      phone: raw.customerPhone ?? raw.customer?.phone,
      notes: raw.notes ?? raw.customer?.notes,
    },
    total_amount: raw.totalAmount ?? raw.total_amount,
    status: raw.status,
    payment_screenshot_url: raw.paymentScreenshot ?? raw.payment_screenshot_url ?? raw.PaymentScreenshot ?? null,
    payment_reference: raw.paymentReference ?? raw.payment_reference ?? raw.PaymentReference ?? null,
    payment_expires_at: raw.paymentExpiresAt ?? raw.payment_expires_at ?? null,
    gcash_number: raw.gcashNumber ?? raw.gcash_number ?? '',
    created_at: raw.createdAt ?? raw.created_at,
    updated_at: raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at,
    open_play_session_id: raw.openPlaySessionId ?? raw.open_play_session_id ?? null,
  };
}

export interface CreateBookingPayload {
  court_id: string;
  date: string;
  slots: SlotSelection[];
  customer: CustomerDetails;
  total_amount: number;
}

// Helper to validate GUID format
function isValidGuid(id: string): boolean {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(id);
}

// Helper to generate a valid GUID (for testing/mock data)
function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ✅ UPDATED: Deterministic GUIDs for all courts (using the actual court GUIDs from the backend)
export const MOCK_COURT_GUIDS: Record<string, string> = {
  // These should match the actual GUIDs from your backend
  'court-1': '11111111-1111-4111-a111-111111111111',
  'court-2': '22222222-2222-4222-a222-222222222222',
  'court-3': '33333333-3333-4333-a333-333333333333',
  // Also handle numeric IDs
  '1': '11111111-1111-4111-a111-111111111111',
  '2': '22222222-2222-4222-a222-222222222222',
  '3': '33333333-3333-4333-a333-333333333333',
};

// ✅ FIXED: Resolve court ID to valid GUID
function resolveCourtId(courtId: string): string {
  console.log('🔍 Resolving court ID:', courtId);
  
  // If it's already a valid GUID, use it
  if (isValidGuid(courtId)) {
    console.log('✅ Court ID is already a valid GUID:', courtId);
    return courtId;
  }
  
  // Check if it's in the MOCK_COURT_GUIDS mapping
  if (courtId in MOCK_COURT_GUIDS) {
    const guid = MOCK_COURT_GUIDS[courtId];
    console.log(`✅ Mapping court ID "${courtId}" to GUID: ${guid}`);
    return guid;
  }
  
  // If it's a number, try to map it
  if (!isNaN(Number(courtId))) {
    const numId = String(courtId);
    if (numId in MOCK_COURT_GUIDS) {
      const guid = MOCK_COURT_GUIDS[numId];
      console.log(`✅ Mapping numeric court ID "${numId}" to GUID: ${guid}`);
      return guid;
    }
  }
  
  // ❌ If we get here, the court ID is unknown - throw an error instead of generating a random one
  console.error(`❌ Unknown court ID: "${courtId}" - cannot resolve to GUID`);
  throw new Error(`Invalid court ID: ${courtId}. Please refresh and try again.`);
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    // Validate required fields
    if (!payload.court_id) {
      throw new Error('Court ID is required');
    }
    
    if (!payload.date) {
      throw new Error('Date is required');
    }
    
    if (!payload.slots || payload.slots.length === 0) {
      throw new Error('At least one slot is required');
    }
    
    if (!payload.customer?.name) {
      throw new Error('Customer name is required');
    }
    
    if (!payload.customer?.email) {
      throw new Error('Customer email is required');
    }
    
    if (!payload.customer?.phone) {
      throw new Error('Customer phone is required');
    }

    // Resolve court ID to valid GUID
    const courtId = resolveCourtId(payload.court_id);
    
    // Build the payload exactly as backend expects
    const requestBody = {
      courtId: courtId,
      customerName: payload.customer.name.trim(),
      customerEmail: payload.customer.email.trim().toLowerCase(),
      customerPhone: payload.customer.phone.trim(),
      date: payload.date,
      slots: payload.slots.map((s) => ({
        startTime: s.start_time,
        endTime: s.end_time
      })),
      totalAmount: payload.total_amount,
      notes: payload.customer.notes?.trim() || ''
    };

    console.log('📤 Creating booking with payload:', JSON.stringify(requestBody, null, 2));
    console.log('📍 Court ID:', courtId, '(valid GUID:', isValidGuid(courtId), ')');

    try {
      const res = await apiRequest<Booking | { data: Booking }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      const booking = normalizeBooking((res as { data?: Booking }).data ?? (res as Booking));
      console.log('✅ Booking created successfully:', booking.reference_code);
      return booking;
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      throw error;
    }
  },

  async trackBooking(referenceCode: string, email?: string): Promise<Booking> {
    if (!referenceCode) {
      throw new Error('Reference code is required');
    }
    
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const url = `/api/bookings/track/${referenceCode}${query}`;
    
    try {
      const res = await apiRequest<Booking | { data: Booking }>(url);
      const booking = normalizeBooking((res as { data?: Booking }).data ?? (res as Booking));
      console.log('✅ Booking tracked successfully:', booking.reference_code);
      console.log('📸 Payment screenshot:', booking.payment_screenshot_url ? 'EXISTS' : 'NULL');
      return booking;
    } catch (error) {
      console.error('❌ Failed to track booking:', error);
      throw error;
    }
  },

  // ✅ UPDATED: Screenshot is optional, reference is required
async uploadPayment(
  bookingId: string,
  screenshotDataUrl: string | null,
  paymentReference: string
): Promise<Booking> {
  if (!bookingId) {
    throw new Error('Booking ID is required');
  }
  
  if (!paymentReference || !paymentReference.trim()) {
    throw new Error('Payment reference is required');
  }

  const formData = new FormData();
  formData.append('paymentReference', paymentReference.trim());

  // ✅ Only append screenshot if it exists
  if (screenshotDataUrl) {
    try {
      const response = await fetch(screenshotDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `payment-${bookingId}.jpg`, { type: 'image/jpeg' });
      formData.append('screenshot', file);
    } catch (error) {
      console.warn('Failed to process screenshot, continuing without it:', error);
    }
  }

  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'https://pickleballcourbookingv2.onrender.com'}/api/bookings/${bookingId}/upload-payment`,
      {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Client-Subdomain': import.meta.env.VITE_CLIENT_SUBDOMAIN ?? 'picklejoe',
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${res.status}`);
    }

    const data = await res.json();
    const booking = normalizeBooking(data);
    console.log('✅ Payment uploaded successfully:', booking.reference_code);
    console.log('📸 Payment screenshot saved:', booking.payment_screenshot_url ? 'EXISTS' : 'NULL');
    return booking;
  } catch (error) {
    console.error('❌ Failed to upload payment:', error);
    throw error;
  }
},
  async getBooking(id: string): Promise<Booking> {
    if (!id) {
      throw new Error('Booking ID is required');
    }
    
    try {
      const res = await apiRequest<Booking | { data: Booking }>(`/api/bookings/${id}`);
      const booking = normalizeBooking((res as { data?: Booking }).data ?? (res as Booking));
      console.log('✅ Booking retrieved successfully:', booking.reference_code);
      return booking;
    } catch (error) {
      console.error('❌ Failed to get booking:', error);
      throw error;
    }
  },

  async checkBookingStatus(referenceCode: string): Promise<Booking> {
    return this.trackBooking(referenceCode);
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    try {
      const res = await apiRequest<Booking | { data: Booking }>(
        `/api/bookings/${bookingId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: reason || 'Cancelled by customer' }),
        }
      );
      const booking = normalizeBooking((res as { data?: Booking }).data ?? (res as Booking));
      console.log('✅ Booking cancelled successfully:', booking.reference_code);
      return booking;
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      throw error;
    }
  }
};

// Export helper functions for testing
export const bookingHelpers = {
  isValidGuid,
  generateGuid,
  resolveCourtId,
  MOCK_COURT_GUIDS,
};