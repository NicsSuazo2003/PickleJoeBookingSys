import type { Booking, CustomerDetails, BookingSlotItem } from '@/types';
import { APP_CONFIG } from '@/utils/constants';
import { apiRequest, delay } from './api';
import { mockBookings, mockCourts } from './mockData';
import { generateReferenceCode } from '@/utils/format';

export interface CreateBookingPayload {
  court_id: string;
  date: string;
  slots: BookingSlotItem[];
  customer: CustomerDetails;
  total_amount: number;
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    if (APP_CONFIG.demoMode) {
      await delay(600);
      const courtName =
        mockCourts.find((c) => c.id === payload.court_id)?.name ?? 'Court';
      const booking: Booking = {
        id: `booking-${Date.now()}`,
        reference_code: generateReferenceCode(),
        court_id: payload.court_id,
        court_name: courtName,
        date: payload.date,
        slots: payload.slots,
        customer: payload.customer,
        total_amount: payload.total_amount,
        status: 'pending_payment',
        payment_screenshot_url: null,
        payment_reference: '',
        gcash_number: APP_CONFIG.gcashNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockBookings.push(booking);
      return booking;
    }
    return apiRequest<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async trackBooking(referenceCode: string, email?: string): Promise<Booking> {
    if (APP_CONFIG.demoMode) {
      await delay(400);
      const booking = mockBookings.find((b) => {
        if (b.reference_code.toUpperCase() !== referenceCode.toUpperCase()) return false;
        if (email && b.customer.email.toLowerCase() !== email.toLowerCase()) return false;
        return true;
      });
      if (!booking) throw new Error('Booking not found. Check your reference code and try again.');
      return booking;
    }
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    return apiRequest<Booking>(`/api/bookings/track/${referenceCode}${query}`);
  },

  async uploadPayment(
    bookingId: string,
    screenshotDataUrl: string,
    paymentReference: string
  ): Promise<Booking> {
    if (APP_CONFIG.demoMode) {
      await delay(500);
      const booking = mockBookings.find((b) => b.id === bookingId);
      if (!booking) throw new Error('Booking not found');
      booking.payment_screenshot_url = screenshotDataUrl;
      booking.payment_reference = paymentReference;
      booking.status = 'payment_submitted';
      booking.updated_at = new Date().toISOString();
      return booking;
    }
    return apiRequest<Booking>(`/api/bookings/${bookingId}/upload-payment`, {
      method: 'POST',
      body: JSON.stringify({
        payment_screenshot: screenshotDataUrl,
        payment_reference: paymentReference,
      }),
    });
  },

  async getBooking(id: string): Promise<Booking> {
    if (APP_CONFIG.demoMode) {
      await delay(200);
      const booking = mockBookings.find((b) => b.id === id);
      if (!booking) throw new Error('Booking not found');
      return booking;
    }
    return apiRequest<Booking>(`/api/bookings/${id}`);
  },
};
