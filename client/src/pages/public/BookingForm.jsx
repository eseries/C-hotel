import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createPublicReservation, fetchPublicRoom } from '../../api/publicBookingApi';
import PublicLayout from './PublicLayout';
import { buildSearchQuery, calculateNights, formatCurrency, saveLastBooking } from './publicBookingUtils';

const BookingForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfGuests: searchParams.get('guests') || '1',
    specialRequests: ''
  });

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchPublicRoom(roomId);
        setRoom(data.data);
      } catch (_error) {
        setRoom(null);
      }
    };

    run();
  }, [roomId]);

  const bookingSummary = useMemo(() => {
    const nightlyRate = room?.customPrice || room?.roomType?.basePrice || 0;
    const nights = calculateNights(searchParams.get('checkIn'), searchParams.get('checkOut'));

    return {
      nights,
      nightlyRate,
      total: nightlyRate * nights
    };
  }, [room, searchParams]);

  const searchQuery = buildSearchQuery({
    hotelId: searchParams.get('hotelId') || room?.hotel?.id,
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || form.numberOfGuests
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data } = await createPublicReservation({
        roomId,
        checkIn: searchParams.get('checkIn'),
        checkOut: searchParams.get('checkOut'),
        numberOfGuests: form.numberOfGuests,
        specialRequests: form.specialRequests,
        guest: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone
        }
      });

      saveLastBooking(data.data);
      navigate('/confirmation', { state: { reservation: data.data } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to complete reservation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Guest Information</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Complete your booking</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your details to reserve this room online.</p>

          {error ? <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p> : null}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[
              ['firstName', 'First Name', 'text'],
              ['lastName', 'Last Name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone', 'tel']
            ].map(([field, label, type]) => (
              <div key={field}>
                <label htmlFor={field} className="mb-2 block text-sm font-medium text-slate-700">
                  {label}
                </label>
                <input
                  id={field}
                  type={type}
                  value={form[field]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  required={field !== 'phone'}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-[0.4fr_1fr]">
            <div>
              <label htmlFor="numberOfGuests" className="mb-2 block text-sm font-medium text-slate-700">
                Number of guests
              </label>
              <input
                id="numberOfGuests"
                type="number"
                min="1"
                value={form.numberOfGuests}
                onChange={(event) => setForm((prev) => ({ ...prev, numberOfGuests: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>

            <div>
              <label htmlFor="specialRequests" className="mb-2 block text-sm font-medium text-slate-700">
                Special requests
              </label>
              <textarea
                id="specialRequests"
                value={form.specialRequests}
                onChange={(event) => setForm((prev) => ({ ...prev, specialRequests: event.target.value }))}
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Airport pickup, late arrival, accessibility needs..."
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Reserving...' : 'Confirm Reservation'}
            </button>
            <Link
              to={`/room/${roomId}?${searchQuery}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Back to Room
            </Link>
          </div>
        </form>

        <aside className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Booking Summary</p>
          <h2 className="mt-3 text-2xl font-bold">{room?.roomType?.name || 'Selected Room'}</h2>
          <p className="mt-2 text-sm text-slate-300">Room {room?.roomNumber || roomId}</p>

          <dl className="mt-8 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <dt>Check-in</dt>
              <dd className="font-semibold text-white">{searchParams.get('checkIn') || 'Not selected'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <dt>Check-out</dt>
              <dd className="font-semibold text-white">{searchParams.get('checkOut') || 'Not selected'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <dt>Nights</dt>
              <dd className="font-semibold text-white">{bookingSummary.nights}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <dt>Guests</dt>
              <dd className="font-semibold text-white">{form.numberOfGuests}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Total price</dt>
              <dd className="text-lg font-bold text-white">{formatCurrency(bookingSummary.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </PublicLayout>
  );
};

export default BookingForm;
