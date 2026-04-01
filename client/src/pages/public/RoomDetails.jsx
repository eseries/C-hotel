import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchPublicRoom } from '../../api/publicBookingApi';
import PublicLayout from './PublicLayout';
import { buildSearchQuery, formatCurrency, parseAmenities, getRoomImageClass } from './publicBookingUtils';

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchPublicRoom(id);
        setRoom(data.data);
      } catch (_error) {
        setRoom(null);
      }
    };

    run();
  }, [id]);

  const searchQuery = buildSearchQuery({
    hotelId: searchParams.get('hotelId') || room?.hotel?.id,
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '1'
  });

  const amenities = parseAmenities(room?.roomType?.amenities);
  const price = room?.customPrice || room?.roomType?.basePrice;

  return (
    <PublicLayout>
      {!room ? (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Loading room details...</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className={`relative h-[24rem] overflow-hidden rounded-[2rem] bg-gradient-to-br ${getRoomImageClass(room.roomNumber || room.id)}`}>
              <div className="absolute inset-0 bg-slate-950/20" />
              <div className="absolute bottom-6 left-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900">
                Room {room.roomNumber}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">{room.hotel?.name}</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-950">{room.roomType?.name}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {room.roomType?.description || 'A well-appointed room designed for a smooth and comfortable stay.'}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Capacity</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{room.roomType?.capacity || 1} guests</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Price</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(price)}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-950">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {amenities.length > 0 ? amenities.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                      {item}
                    </span>
                  )) : (
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Standard room amenities</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Reservation</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Reserve this room</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Review your stay dates and continue to the booking form.
            </p>

            <dl className="mt-8 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <dt>Check-in</dt>
                <dd className="font-semibold text-slate-950">{searchParams.get('checkIn') || 'Not selected'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <dt>Check-out</dt>
                <dd className="font-semibold text-slate-950">{searchParams.get('checkOut') || 'Not selected'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Guests</dt>
                <dd className="font-semibold text-slate-950">{searchParams.get('guests') || '1'}</dd>
              </div>
            </dl>

            <Link
              to={`/book/${room.id}?${searchQuery}`}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Reserve Room
            </Link>

            <Link
              to={`/search?${searchQuery}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Back to Search
            </Link>
          </aside>
        </div>
      )}
    </PublicLayout>
  );
};

export default RoomDetails;
