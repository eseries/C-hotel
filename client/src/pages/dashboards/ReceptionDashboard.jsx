import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Clock, 
  Users, 
  Calendar, 
  Plus,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { checkInReservation, checkOutReservation, fetchReservations } from '../../api/modulesApi';
import useAuth from '../../hooks/useAuth';
import OverviewStats from './OverviewStats';
import StatCard from '../../components/StatCard';

const CHECK_IN_ELIGIBLE = ['PENDING', 'CONFIRMED'];
const CHECK_OUT_ELIGIBLE = ['CHECKED_IN'];
const DISPLAY_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'];

const statusStyles = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  CONFIRMED: 'bg-blue-50 text-blue-700 ring-blue-600/10',
  CHECKED_IN: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  CHECKED_OUT: 'bg-slate-50 text-slate-700 ring-slate-600/10'
};

const ReceptionDashboard = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [activeReservationId, setActiveReservationId] = useState('');
  const [confirmReservation, setConfirmReservation] = useState(null);
  const [notifyHousekeeping, setNotifyHousekeeping] = useState(false);

  const loadReservations = async () => {
    if (!user?.hotelId) return;
    setLoading(true);
    try {
      const { data } = await fetchReservations(user.hotelId);
      setRows(data.data || []);
    } catch (_error) {
      setRows([]);
      setMessage({ type: 'error', text: 'Failed to load reservations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [user?.hotelId]);

  const upcomingReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rows
      .filter((row) => DISPLAY_STATUSES.includes(row.status))
      .filter((row) => new Date(row.checkInDate).getTime() >= today.getTime() || row.status === 'CHECKED_IN')
      .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
  }, [rows]);

  const handleCheckOut = async (reservation) => {
    if (!CHECK_OUT_ELIGIBLE.includes(reservation.status)) return;
    const ok = window.confirm(`Check out ${reservation.guest?.firstName} from room ${reservation.room?.roomNumber}?`);
    if (!ok) return;

    setActiveReservationId(reservation.id);
    try {
      await checkOutReservation(reservation.id);
      setMessage({ type: 'success', text: 'Guest checked out successfully.' });
      loadReservations();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Check-out failed.' });
    } finally {
      setActiveReservationId('');
    }
  };

  const handleCheckIn = async () => {
    if (!confirmReservation) return;
    setActiveReservationId(confirmReservation.id);
    try {
      await checkInReservation(confirmReservation.id, { notifyHousekeeping });
      setMessage({ type: 'success', text: 'Guest checked in successfully.' });
      setConfirmReservation(null);
      loadReservations();
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Check-in failed.' });
    } finally {
      setActiveReservationId('');
    }
  };

  const stats = {
    pending: rows.filter(r => r.status === 'PENDING').length,
    upcoming: rows.filter(r => CHECK_IN_ELIGIBLE.includes(r.status)).length,
    active: rows.filter(r => r.status === 'CHECKED_IN').length
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reception Dashboard</h1>
          <p className="text-sm text-slate-500">Manage guest arrivals, departures, and real-time occupancy.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/reservations" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all">
            <Plus className="h-4 w-4" />
            New Reservation
          </Link>
        </div>
      </div>

      <OverviewStats />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Upcoming Check-ins" value={stats.upcoming} hint="Arriving today/soon" icon={Calendar} color="blue" />
        <StatCard title="Pending Confirmation" value={stats.pending} hint="Awaiting action" icon={Clock} color="amber" />
        <StatCard title="Active Guests" value={stats.active} hint="Currently in-house" icon={Users} color="emerald" />
      </div>

      {message && (
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
          message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Arrivals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {upcomingReservations.map((reservation) => (
                <tr key={reservation.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs uppercase">
                        {reservation.guest?.firstName?.[0]}{reservation.guest?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{reservation.guest?.firstName} {reservation.guest?.lastName}</p>
                        <p className="text-xs font-mono text-slate-400">#{reservation.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">Room {reservation.room?.roomNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(reservation.checkInDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusStyles[reservation.status] || 'bg-slate-50 text-slate-600 ring-slate-600/10'}`}>
                      {reservation.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {CHECK_IN_ELIGIBLE.includes(reservation.status) && (
                        <button
                          onClick={() => setConfirmReservation(reservation)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all"
                        >
                          Check-In
                        </button>
                      )}
                      {CHECK_OUT_ELIGIBLE.includes(reservation.status) && (
                        <button
                          onClick={() => handleCheckOut(reservation)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-all"
                        >
                          Check-Out
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      {confirmReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Confirm Check-In</h3>
            <p className="mt-2 text-slate-500">
              You are checking in <span className="font-bold text-slate-900">{confirmReservation.guest?.firstName} {confirmReservation.guest?.lastName}</span> to room <span className="font-bold text-slate-900">{confirmReservation.room?.roomNumber}</span>.
            </p>

            <div className="mt-6 space-y-4">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition-all">
                <input
                  type="checkbox"
                  checked={notifyHousekeeping}
                  onChange={(e) => setNotifyHousekeeping(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">Notify Housekeeping</p>
                  <p className="text-xs text-slate-500">Alert staff for extra room preparation.</p>
                </div>
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setConfirmReservation(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckIn}
                disabled={activeReservationId === confirmReservation.id}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
              >
                {activeReservationId === confirmReservation.id ? 'Processing...' : 'Complete Check-In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionDashboard;
