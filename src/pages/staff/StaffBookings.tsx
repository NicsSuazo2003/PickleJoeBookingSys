// src/pages/staff/StaffBookings.tsx
import { Bookings } from '@/pages/admin/Bookings';
import { StaffLayout } from '@/components/layout/StaffLayout';

// ✅ Reuse the same Bookings component but with StaffLayout
export function StaffBookings() {
  return (
    <StaffLayout>
      <Bookings />
    </StaffLayout>
  );
}