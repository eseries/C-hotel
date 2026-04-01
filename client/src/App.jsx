import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import AdminPage from './pages/AdminPage';
import BillingPage from './pages/BillingPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import Dashboard from './pages/Dashboard';
import GuestsPage from './pages/GuestsPage';
import HotelsPage from './pages/HotelsPage';
import HousekeepingPage from './pages/HousekeepingPage';
import LoginPage from './pages/LoginPage';
import BookingConfirmation from './pages/public/BookingConfirmation';
import BookingForm from './pages/public/BookingForm';
import MyReservation from './pages/public/MyReservation';
import PublicHome from './pages/public/PublicHome';
import RoomDetails from './pages/public/RoomDetails';
import SearchRooms from './pages/public/SearchRooms';
import ReportsPage from './pages/ReportsPage';
import ReservationsPage from './pages/ReservationsPage';
import RoomsPage from './pages/RoomsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/search" element={<SearchRooms />} />
      <Route path="/room/:id" element={<RoomDetails />} />
      <Route path="/book/:roomId" element={<BookingForm />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/reservation/:code" element={<MyReservation />} />
      <Route path="/staff/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/reception/dashboard" element={<ProtectedRoute roles={['RECEPTIONIST']}><Dashboard /></ProtectedRoute>} />
        <Route path="/housekeeping/dashboard" element={<ProtectedRoute roles={['HOUSEKEEPING']}><Dashboard /></ProtectedRoute>} />
        <Route path="/hotels" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER']}><HotelsPage /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING']}><RoomsPage /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST']}><ReservationsPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST']}><BookingCalendarPage /></ProtectedRoute>} />
        <Route path="/guests" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST']}><GuestsPage /></ProtectedRoute>} />
        <Route path="/housekeeping" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'HOUSEKEEPING']}><HousekeepingPage /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST']}><BillingPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AdminPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;
