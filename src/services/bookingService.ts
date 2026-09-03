// src/services/bookingService.ts
import type { Booking, CustomerDetails, SlotSelection } from '@/types';
import { apiRequest } from './api';

// ✅ Normalizes raw API booking data (camelCase, flat customer fields) into the app's Booking shape
function normalizeBooking(raw: any): Booking {
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
    payment_screenshot_url: raw.paymentScreenshot ?? raw.payment_screenshot_url ?? null,
    payment_reference: raw.paymentReference ?? raw.payment_reference ?? null,
    gcash_number: raw.gcashNumber ?? raw.gcash_number ?? '',
    created_at: raw.createdAt ?? raw.created_at,
    updated_at: raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at,
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

// Deterministic GUIDs for mock courts (for consistency)
export const MOCK_COURT_GUIDS = {
  'court-1': '11111111-1111-4111-a111-111111111111',
  'court-2': '22222222-2222-4222-a222-222222222222',
  'court-3': '33333333-3333-4333-a333-333333333333',
};

// Resolve court ID to valid GUID
function resolveCourtId(courtId: string): string {
  if (isValidGuid(courtId)) {
    return courtId;
  }
  
  if (courtId in MOCK_COURT_GUIDS) {
    const guid = MOCK_COURT_GUIDS[courtId as keyof typeof MOCK_COURT_GUIDS];
    console.warn(`Converting mock court ID "${courtId}" to GUID: ${guid}`);
    return guid;
  }
  
  if (!isNaN(Number(courtId))) {
    console.warn(`Converting numeric court ID to string: ${courtId}`);
    return String(courtId);
  }
  
  const guid = generateGuid();
  console.warn(`Unknown court ID "${courtId}" - generating new GUID: ${guid}`);
  return guid;
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
      return booking;
    } catch (error) {
      console.error('❌ Failed to track booking:', error);
      throw error;
    }
  },

  // ✅ UPDATED: Send payment reference with the screenshot
  async uploadPayment(
    bookingId: string,
    screenshotDataUrl: string,
    paymentReference: string
  ): Promise<Booking> {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    if (!screenshotDataUrl) {
      throw new Error('Payment screenshot is required');
    }
    
    if (!paymentReference) {
      throw new Error('Payment reference is required');
    }

    // Convert base64 to blob
    const response = await fetch(screenshotDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `payment-${bookingId}.jpg`, { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('paymentReference', paymentReference); // ✅ Send payment reference

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