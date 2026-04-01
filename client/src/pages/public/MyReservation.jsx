import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelPublicReservation, fetchPublicReservation } from '../../api/publicBookingApi';
import PublicLayout from './PublicLayout';
import { formatCurrency, formatDate } from './publicBookingUtils';

const MyReservation = () => {
  const { code } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await fetchPublicReservation(code);
        setReservation(data.data);
        setError('');
      } catch (requestError) {
        setReservation(null);
        setError(requestError.response?.data?.message || 'Unable to load reservation');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [code]);

  const handleCancel = async () => {
    if (!reservation) return;

    setCancelling(true);
    try {
      const { data } = await cancelPublicReservation(reservation.id);
      setReservation((prev) => ({ ...prev, status: data.data.status }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
        {loading ? <p className="text-sm text-slate-500">Loading reservation...</p> : null}
        {!loading && error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p> : null}

        {!loading && reservation ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">My Reservation</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">{reservation.room?.hotel?.name || 'Hotel Reservation'}</h1>
            <p className="mt-2 break-all text-sm text-slate-500">Reservation code: {reservation.id}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Guest</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {reservation.guest?.firstName} {reservation.guest?.lastName}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Room</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {reservation.room?.roomType?.name || 'Room'} {reservation.room?.roomNumber ? `• Room ${reservation.room.roomNumber}` : ''}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dates</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {formatDate(reservation.checkInDate)} to {formatDate(reservation.checkOutDate)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {formatCurrency(reservation.totalAmount)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{reservation.status}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {reservation.status !== 'CANCELLED' ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
                </button>
              ) : null}
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Book Another Stay
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </PublicLayout>
  );
};

export default MyReservation;
