import { useEffect, useState } from 'react';
import { checkInReservation, fetchReservations } from '../api/modulesApi';
import useAuth from '../hooks/useAuth';

const ReservationsPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [activeReservationId, setActiveReservationId] = useState('');
  const [notifyHousekeeping, setNotifyHousekeeping] = useState(false);
  const [message, setMessage] = useState(null);

  const run = async () => {
    try {
      const { data } = await fetchReservations(user?.hotelId);
      setRows(data.data || []);
    } catch (_error) {
      setRows([]);
      setMessage({ type: 'error', text: 'Failed to load reservations.' });
    }
  };

  useEffect(() => {
    if (user?.hotelId) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hotelId]);

  const handleCheckIn = async (reservation) => {
    const canCheckIn = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
    if (!canCheckIn) return;

    const ok = window.confirm(
      `Check in ${reservation.guest?.firstName || 'Guest'} ${reservation.guest?.lastName || ''} for room ${reservation.room?.roomNumber || 'N/A'}?`
    );
    if (!ok) return;

    const reservationId = reservation.id;
    const previousRows = rows;

    setActiveReservationId(reservationId);
    setRows((current) =>
      current.map((row) => (row.id === reservationId ? { ...row, status: 'CHECKED_IN', room: { ...row.room, status: 'OCCUPIED' } } : row))
    );

    try {
      const { data } = await checkInReservation(reservationId, {
        notifyHousekeeping,
        requiresPreparation: notifyHousekeeping
      });
      const updated = data.data;
      setRows((current) => current.map((row) => (row.id === reservationId ? { ...row, ...updated } : row)));
      setMessage({
        type: 'success',
        text: notifyHousekeeping ? 'Checked in and housekeeping notified.' : 'Guest checked in successfully.'
      });
    } catch (error) {
      setRows(previousRows);
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Check-in failed.' });
    } finally {
      setActiveReservationId('');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
      <p className="mb-4 text-sm text-slate-500">Create, modify, cancel reservations, and process check-in/check-out.</p>
      <label className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={notifyHousekeeping}
          onChange={(event) => setNotifyHousekeeping(event.target.checked)}
        />
        Notify housekeeping when checking in
      </label>
      {message ? (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}
      <div className="space-y-3">
        {rows.map((reservation) => (
          <div key={reservation.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900">
              {reservation.guest?.firstName} {reservation.guest?.lastName} - Room {reservation.room?.roomNumber}
            </p>
            <p className="text-sm text-slate-500">
              {new Date(reservation.checkInDate).toLocaleDateString()} to{' '}
              {new Date(reservation.checkOutDate).toLocaleDateString()}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-brand-700">{reservation.status}</p>
              <button
                type="button"
                onClick={() => handleCheckIn(reservation)}
                disabled={!['PENDING', 'CONFIRMED'].includes(reservation.status) || activeReservationId === reservation.id}
                className={`rounded-md px-3 py-2 text-xs font-medium ${
                  ['PENDING', 'CONFIRMED'].includes(reservation.status) && activeReservationId !== reservation.id
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                }`}
              >
                {activeReservationId === reservation.id ? 'Checking In...' : 'Check-In'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationsPage;
