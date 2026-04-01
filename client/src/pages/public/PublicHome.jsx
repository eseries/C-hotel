import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchPublicHotel } from '../../api/publicBookingApi';
import PublicLayout from './PublicLayout';
import { buildSearchQuery } from './publicBookingUtils';

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    checkIn: today.toISOString().slice(0, 10),
    checkOut: tomorrow.toISOString().slice(0, 10)
  };
};

const PublicHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [form, setForm] = useState(() => ({
    ...getDefaultDates(),
    guests: '1'
  }));

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchPublicHotel({
          slug: searchParams.get('hotel') || '',
          id: searchParams.get('hotelId') || ''
        });
        setHotel(data.data);
      } catch (_error) {
        setHotel(null);
      }
    };

    run();
  }, [searchParams]);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/search?${buildSearchQuery({ hotelId: hotel?.id, ...form })}`);
  };

  return (
    <PublicLayout>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-300/60">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-500">Online Booking</p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {hotel?.name || 'HotelPro HMS'}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Book rooms online, review reservation details, and manage your stay from one clean guest portal.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Instant Search', 'Check room availability for your dates.'],
              ['Secure Reservation', 'Submit guest details and confirm your booking.'],
              ['Self-Service Lookup', 'View your reservation anytime by code.']
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Search Rooms</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Plan your stay</h2>
            <p className="mt-2 text-sm text-slate-500">
              {hotel?.city || 'Choose your dates'} {hotel?.country ? `, ${hotel.country}` : ''}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="check-in" className="mb-2 block text-sm font-medium text-slate-700">
                Check-in date
              </label>
              <input
                id="check-in"
                type="date"
                value={form.checkIn}
                onChange={(event) => setForm((prev) => ({ ...prev, checkIn: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>

            <div>
              <label htmlFor="check-out" className="mb-2 block text-sm font-medium text-slate-700">
                Check-out date
              </label>
              <input
                id="check-out"
                type="date"
                value={form.checkOut}
                onChange={(event) => setForm((prev) => ({ ...prev, checkOut: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>

            <div>
              <label htmlFor="guests" className="mb-2 block text-sm font-medium text-slate-700">
                Number of guests
              </label>
              <input
                id="guests"
                type="number"
                min="1"
                value={form.guests}
                onChange={(event) => setForm((prev) => ({ ...prev, guests: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search Rooms
            </button>
          </form>
        </div>
      </section>

      <section id="contact" className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Contact</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">{hotel?.name || 'Hotel Front Desk'}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {hotel?.city || 'City'}, {hotel?.country || 'Nigeria'}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          For booking support, call the front desk or visit the reception on arrival.
        </p>
      </section>
    </PublicLayout>
  );
};

export default PublicHome;
