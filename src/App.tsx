import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { Booking } from '@/pages/Booking';
import { Checkout } from '@/pages/Checkout';
import { Success } from '@/pages/Success';
import { Track } from '@/pages/Track';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Bookings } from '@/pages/admin/Bookings';
import { Courts } from '@/pages/admin/Courts';
import { Pricing } from '@/pages/admin/Pricing';
import { Settings } from '@/pages/admin/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/track" element={<Track />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/bookings" element={<Bookings />} />
        <Route path="/admin/courts" element={<Courts />} />
        <Route path="/admin/pricing" element={<Pricing />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
