// src/services/bookingService.ts
import type { Booking, CustomerDetails, SlotSelection } from '@/types';
import { apiRequest } from './api';

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
      courtId: courtId,  // Backend expects "courtId" (camelCase)
      customerName: payload.customer.name.trim(),
      customerEmail: payload.customer.email.trim().toLowerCase(),
      customerPhone: payload.customer.phone.trim(),
      date: payload.date,
      // Backend expects slots as: { startTime: string, endTime: string }[]
      // It does NOT expect slotId, date, type, price, or is_peak
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
      
      const booking = (res as { data?: Booking }).data ?? (res as Booking);
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
      return (res as { data?: Booking }).data ?? (res as Booking);
    } catch (error) {
      console.error('❌ Failed to track booking:', error);
      throw error;
    }
  },

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

    // Note: The backend expects a file upload, not base64
    // You'll need to convert the data URL to a file
    // Or use FormData to upload the file
    const formData = new FormData();
    
    // Convert base64 to blob
    const response = await fetch(screenshotDataUrl);
    const blob = await response.blob();
    const file = new File([blob], `payment-${bookingId}.jpg`, { type: 'image/jpeg' });
    formData.append('screenshot', file);

    try {
      // Use direct fetch with FormData instead of apiRequest
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
        throw new Error(`Upload failed: ${res.status}`);
      }

      const data = await res.json();
      return data as Booking;
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
      return (res as { data?: Booking }).data ?? (res as Booking);
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
      return (res as { data?: Booking }).data ?? (res as Booking);
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