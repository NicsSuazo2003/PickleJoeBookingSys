import type { Booking, CustomerDetails, SlotSelection } from '@/types';
import { apiRequest } from './api';

export interface CreateBookingPayload {
  court_id: string;
  date: string;
  slots: SlotSelection[];
  customer: CustomerDetails;
  total_amount: number;
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const res = await apiRequest<Booking | { data: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        courtId: payload.court_id,
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone,
        date: payload.date,
        slots: payload.slots.map((s) => ({
          startTime: s.start_time,
          endTime: s.end_time,
        })),
        totalAmount: payload.total_amount,
        notes: payload.customer.notes,
      }),
    });
    return (res as { data?: Booking }).data ?? (res as Booking);
  },

  async trackBooking(referenceCode: string, email?: string): Promise<Booking> {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await apiRequest<Booking | { data: Booking }>(`/api/bookings/track/${referenceCode}${query}`);
    return (res as { data?: Booking }).data ?? (res as Booking);
  },

  async uploadPayment(
    bookingId: string,
    screenshotDataUrl: string,
    paymentReference: string
  ): Promise<Booking> {
    const res = await apiRequest<Booking | { data: Booking }>(`/api/bookings/${bookingId}/upload-payment`, {
      method: 'POST',
      body: JSON.stringify({
        screenshot: screenshotDataUrl,
        paymentReference: paymentReference,
      }),
    });
    return (res as { data?: Booking }).data ?? (res as Booking);
  },

  async getBooking(id: string): Promise<Booking> {
    const res = await apiRequest<Booking | { data: Booking }>(`/api/bookings/${id}`);
    return (res as { data?: Booking }).data ?? (res as Booking);
  },
};