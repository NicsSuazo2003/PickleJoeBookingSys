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
  loadAllCourtsSlots: () => Promise<void>;
  toggleSlot: (slotId: string) => void;
  clearSlots: () => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  createBooking: () => Promise<Booking>;
  reset: () => void;
  refreshSlots: () => Promise<boolean>;
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

  loadAllCourtsSlots: async () => {
    const { courts, selectedDate } = get();
    if (courts.length === 0) return;

    const requestDate = selectedDate;
    set({ loadingSlots: true, error: null });
    try {
      const results = await Promise.all(
        courts.map((c) => courtService.getAvailability(c.id, requestDate))
      );
      if (get().selectedDate === requestDate) {
        // ✅ Only update slots, don't touch selectedCourt
        set({ slots: results.flat(), loadingSlots: false });
      }
    } catch (err) {
      if (get().selectedDate === requestDate) {
        set({
          loadingSlots: false,
          error: err instanceof Error ? err.message : 'Failed to load slots',
        });
      }
    }
  },

  refreshSlots: async (): Promise<boolean> => {
    const { selectedCourt, selectedDate, selectedSlotIds } = get();
    if (!selectedCourt || selectedSlotIds.length === 0) return true;

    try {
      const freshSlots = await courtService.getAvailability(selectedCourt.id, selectedDate);
      set({ slots: freshSlots });

      // Check if all selected slots are still available
      const allAvailable = selectedSlotIds.every((slotId) => {
        const slot = freshSlots.find((s) => s.id === slotId);
        return slot?.is_available === true;
      });

      if (!allAvailable) {
        // Clear invalid selections
        const stillAvailableIds = selectedSlotIds.filter((slotId) => {
          const slot = freshSlots.find((s) => s.id === slotId);
          return slot?.is_available === true;
        });
        set({ selectedSlotIds: stillAvailableIds });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to refresh slots:', err);
      return true; // Assume available if we can't check
    }
  },

  toggleSlot: (slotId) => {
    set((state) => {
      // Find the slot being toggled
      const slot = state.slots.find((s) => s.id === slotId);
      if (!slot) return state;
      
      // If this is a new slot from a different court, update selectedCourt
      const currentCourtId = state.selectedCourt?.id;
      if (currentCourtId !== slot.court_id) {
        const newCourt = state.courts.find(c => c.id === slot.court_id);
        if (newCourt) {
          // Update the selected court to match the slot's court
          state.selectedCourt = newCourt;
        }
      }
      
      const exists = state.selectedSlotIds.includes(slotId);
      if (exists) {
        return { selectedSlotIds: state.selectedSlotIds.filter((id) => id !== slotId) };
      }

      if (slot.type === 'fixed_2hr') {
        return { selectedSlotIds: [slotId] };
      }

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
    
    console.log('🔵 createBooking called with:', {
      selectedCourt: selectedCourt?.id,
      selectedDate,
      selectedSlotIds,
      slotsCount: slots.length,
      customer,
    });
    
    if (!selectedCourt) {
      console.error('❌ No court selected');
      throw new Error('Please select a court');
    }
    
    if (selectedSlotIds.length === 0) {
      console.error('❌ No slots selected');
      throw new Error('Please select at least one time slot');
    }

    // ✅ Refresh slots before booking to check availability
    try {
      console.log('🔵 Refreshing slots for court:', selectedCourt.id, 'date:', selectedDate);
      const freshSlots = await courtService.getAvailability(selectedCourt.id, selectedDate);
      console.log('✅ Fresh slots loaded:', freshSlots.length);
      
      // Check if selected slots are still available
      const stillAvailable = selectedSlotIds.every((slotId) => {
        const freshSlot = freshSlots.find((s) => s.id === slotId);
        return freshSlot?.is_available === true;
      });

      if (!stillAvailable) {
        // Update store with fresh slots
        const stillAvailableIds = selectedSlotIds.filter((slotId) => {
          const freshSlot = freshSlots.find((s) => s.id === slotId);
          return freshSlot?.is_available === true;
        });
        set({ 
          slots: freshSlots,
          selectedSlotIds: stillAvailableIds 
        });
        throw new Error('One or more selected time slots are no longer available. Please select new slots.');
      }

      // Use fresh slots for booking
      const selectedSlots = freshSlots.filter((s) => selectedSlotIds.includes(s.id));
      console.log('🔵 Selected slots for booking:', selectedSlots);
      
      const bookingSlots: BookingSlotItem[] = selectedSlots.map((s) => ({
        id: s.id,
        slot_id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        date: s.date || selectedDate,
        type: s.type,
        price: Number(s.price || 0),
        is_peak: s.is_peak || false,
      }));

      const totalAmount = bookingSlots.reduce((sum, s) => sum + s.price, 0);
      console.log('🔵 Total amount:', totalAmount);

      console.log('🔵 Creating booking with payload:', {
        court_id: selectedCourt.id,
        date: selectedDate,
        slots: bookingSlots.length,
        customer,
        total_amount: totalAmount,
      });

      const booking = await bookingService.createBooking({
        court_id: selectedCourt.id,
        date: selectedDate,
        slots: bookingSlots,
        customer,
        total_amount: totalAmount,
      });

      console.log('✅ Booking created successfully:', booking);
      set({ currentBooking: booking, selectedSlotIds: [] });
      return booking;
    } catch (error) {
      console.error('❌ Error in createBooking:', error);
      // Re-throw the error with a clear message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create booking. Please try again.');
    }
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
      is_peak: s.is_peak || false,
    }));
}

export function getSelectedTotal(state: BookingStoreState): number {
  return state.slots
    .filter((s) => state.selectedSlotIds.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price || 0), 0);
}