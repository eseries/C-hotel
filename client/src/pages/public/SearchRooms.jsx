import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchPublicRooms } from '../../api/publicBookingApi';
import PublicLayout from './PublicLayout';
import { buildSearchQuery, formatCurrency, parseAmenities, getRoomImageClass } from './publicBookingUtils';

const SearchRooms = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    hotelId: searchParams.get('hotelId') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '1'
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await searchPublicRooms(filters);
        setRooms(data.data || []);
      } catch (_error) {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [filters.hotelId, filters.checkIn, filters.checkOut, filters.guests]);

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Available Rooms</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Choose your stay</h1>
            <p className="mt-2 text-sm text-slate-500">
              {filters.checkIn || 'Select dates'} to {filters.checkOut || 'select checkout'} for {filters.guests} guest(s)
            </p>
          </div>
          <Link
            to={`/?${buildSearchQuery(filters)}`}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400"
          >
            Edit Search
          </Link>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading rooms...</p> : null}

        {!loading && rooms.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">No rooms available</h2>
            <p className="mt-2 text-sm text-slate-500">Try different dates or reduce the number of guests.</p>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {rooms.map((room) => {
            const amenities = parseAmenities(room.roomType?.amenities).slice(0, 4);
            const price = room.customPrice || room.roomType?.basePrice;
            const query = buildSearchQuery(filters);

            return (
              <article key={room.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
                <div className={`relative h-56 bg-gradient-to-br ${getRoomImageClass(room.roomNumber || room.id)}`}>
                  <div className="absolute inset-0 bg-slate-950/20" />
                  <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900">
                    Room {room.roomNumber}
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-950">{room.roomType?.name || 'Room'}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{room.roomType?.description || 'Comfortable room for your selected stay.'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Per night</p>
                      <p className="mt-1 text-xl font-bold text-slate-950">
                        {formatCurrency(price)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Capacity</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{room.roomType?.capacity || 1} guests</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Amenities</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{amenities.join(' • ') || 'Standard room features'}</p>
                    </div>
                  </div>

                  <Link
                    to={`/room/${room.id}?${query}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Book Now
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
};

export default SearchRooms;
