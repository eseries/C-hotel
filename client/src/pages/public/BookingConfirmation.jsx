import { Link, Navigate, useLocation } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import { formatCurrency, formatDate, loadLastBooking } from './publicBookingUtils';

const BookingConfirmation = () => {
  const location = useLocation();
  const reservation = location.state?.reservation || loadLastBooking();

  if (!reservation) {
    return <Navigate to="/" replace />;
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Reservation Confirmed</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Your reservation has been received</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Keep your reservation code handy. You can use it to review or manage this booking later.
        </p>

        <div className="mt-8 rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-500">Reservation ID</p>
          <p className="mt-3 break-all text-2xl font-bold">{reservation.id}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Room type</p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {reservation.room?.roomType?.name || 'Room'} {reservation.room?.roomNumber ? `• Room ${reservation.room.roomNumber}` : ''}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{reservation.status}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Check-in</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{formatDate(reservation.checkInDate)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Check-out</p>
            <p className="mt-2 text-base font-semibold text-slate-950">{formatDate(reservation.checkOutDate)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total price</p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {formatCurrency(reservation.totalAmount)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/reservation/${reservation.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View Reservation
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Book Another Stay
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookingConfirmation;
