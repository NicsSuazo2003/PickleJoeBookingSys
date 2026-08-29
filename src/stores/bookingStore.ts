import { create } from 'zustand';
import type { Court, TimeSlot, BookingSlotItem, CustomerDetails, Booking } from '@/types';
import { courtService } from '@/services/courtService';
import { bookingService } from '@/services/bookingService';
import { todayISO } from '@/utils/format';

interface BookingStoreState {
  courts: Court[];
  selectedCourt: Court | null;
  selectedDate: string;
  slots: TimeSlot[];
  selectedSlotIds: string[];
  customer: CustomerDetails;
  currentBooking: Booking | null;
  loadingCourts: boolean;
  loadingSlots: boolean;
  error: string | null;

  loadCourts: () => Promise<void>;
  selectCourt: (court: Court) => void;
  setDate: (date: string) => void;
  loadSlots: () => Promise<void>;
  toggleSlot: (slotId: string) => void;
  clearSlots: () => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  createBooking: () => Promise<Booking>;
  reset: () => void;
}

const emptyCustomer: CustomerDetails = {
  name: '',
  email: '',
  phone: '',
  notes: '',
};

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  courts: [],
  selectedCourt: null,
  selectedDate: todayISO(),
  slots: [],
  selectedSlotIds: [],
  customer: emptyCustomer,
  currentBooking: null,
  loadingCourts: false,
  loadingSlots: false,
  error: null,

  loadCourts: async () => {
    set({ loadingCourts: true, error: null });
    try {
      const courts = await courtService.getCourts();
      const activeCourts = courts.filter((c) => c.is_active !== false);
      const initialCourt = activeCourts[0] ?? null;

      set({
        courts: activeCourts,
        selectedCourt: initialCourt,
        loadingCourts: false,
      });

      if (initialCourt) {
        get().loadSlots();
      }
    } catch (err) {
      set({
        loadingCourts: false,
        error: err instanceof Error ? err.message : 'Failed to load courts',
      });
    }
  },

  selectCourt: (court) => {
    set({ selectedCourt: court, selectedSlotIds: [], error: null });
    get().loadSlots();
  },

  setDate: (date) => {
    set({ selectedDate: date, selectedSlotIds: [], error: null });
    get().loadSlots();
  },

  loadSlots: async () => {
    const { selectedCourt, selectedDate } = get();
    if (!selectedCourt) return;

    set({ loadingSlots: true, error: null });
    try {
      const slots = await courtService.getAvailability(selectedCourt.id, selectedDate);
      set({ slots, loadingSlots: false });
    } catch (err) {
      set({
        loadingSlots: false,
        error: err instanceof Error ? err.message : 'Failed to load slots',
      });
    }
  },

  toggleSlot: (slotId) => {
    set((state) => {
      const exists = state.selectedSlotIds.includes(slotId);
      if (exists) {
        return { selectedSlotIds: state.selectedSlotIds.filter((id) => id !== slotId) };
      }

      // For fixed 2hr slot, select it exclusively
      const slot = state.slots.find((s) => s.id === slotId);
      if (slot && slot.type === 'fixed_2hr') {
        return { selectedSlotIds: [slotId] };
      }

      // Deselect any fixed 2hr slot if selecting a standard slot
      const filtered = state.selectedSlotIds.filter((id) => {
        const s = state.slots.find((sl) => sl.id === id);
        return s?.type !== 'fixed_2hr';
      });

      return { selectedSlotIds: [...filtered, slotId] };
    });
  },

  clearSlots: () => set({ selectedSlotIds: [] }),

  setCustomer: (customerData) =>
    set((state) => ({
      customer: { ...state.customer, ...customerData },
    })),

  createBooking: async () => {
    const { selectedCourt, selectedDate, selectedSlotIds, slots, customer } = get();
    if (!selectedCourt) {
      throw new Error('Please select a court');
    }
    if (selectedSlotIds.length === 0) {
      throw new Error('Please select at least one time slot');
    }

    const selectedSlots = slots.filter((s) => selectedSlotIds.includes(s.id));
    const bookingSlots: BookingSlotItem[] = selectedSlots.map((s) => ({
      id: s.id,
      slot_id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      date: s.date || selectedDate,
      type: s.type,
      price: Number(s.price || 0),
      is_peak: s.is_peak,
    }));

    const totalAmount = bookingSlots.reduce((sum, s) => sum + s.price, 0);

    const booking = await bookingService.createBooking({
      court_id: selectedCourt.id,
      date: selectedDate,
      slots: bookingSlots,
      customer,
      total_amount: totalAmount,
    });

    set({ currentBooking: booking, selectedSlotIds: [] });
    return booking;
  },

  reset: () =>
    set({
      selectedSlotIds: [],
      currentBooking: null,
      customer: emptyCustomer,
      error: null,
    }),
}));

export function getSelectedSlotItems(state: BookingStoreState): BookingSlotItem[] {
  return state.slots
    .filter((s) => state.selectedSlotIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      slot_id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      date: s.date || state.selectedDate,
      type: s.type,
      price: Number(s.price || 0),
      is_peak: s.is_peak,
    }));
}

export function getSelectedTotal(state: BookingStoreState): number {
  return state.slots
    .filter((s) => state.selectedSlotIds.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price || 0), 0);
}