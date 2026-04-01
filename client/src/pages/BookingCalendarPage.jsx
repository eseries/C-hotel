import { useEffect, useMemo, useState } from 'react';
import { fetchReservations, fetchRooms, updateReservation } from '../api/modulesApi';
import useAuth from '../hooks/useAuth';

const DAY_COUNT = 14;

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const addDays = (date, days) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const formatDateKey = (date) => startOfDay(date).toISOString().slice(0, 10);

const BookingCalendarPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [dragReservationId, setDragReservationId] = useState('');
  const [message, setMessage] = useState(null);

  const dateColumns = useMemo(() => {
    const base = startOfDay(new Date());
    return Array.from({ length: DAY_COUNT }, (_, index) => addDays(base, index));
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const [roomsRes, reservationsRes] = await Promise.all([
          fetchRooms(user?.hotelId),
          fetchReservations(user?.hotelId)
        ]);
        setRooms(roomsRes.data.data || []);
        setReservations(reservationsRes.data.data || []);
      } catch (_error) {
        setRooms([]);
        setReservations([]);
      }
    };
    if (user?.hotelId) run();
  }, [user?.hotelId]);

  const roomReservations = useMemo(() => {
    return rooms.reduce((acc, room) => {
      acc[room.id] = reservations.filter((reservation) => reservation.roomId === room.id);
      return acc;
    }, {});
  }, [rooms, reservations]);

  const onDropReservation = async (targetRoomId, targetDate) => {
    if (!dragReservationId) return;
    const reservation = reservations.find((entry) => entry.id === dragReservationId);
    if (!reservation) return;

    const currentStart = startOfDay(reservation.checkInDate);
    const currentEnd = startOfDay(reservation.checkOutDate);
    const duration = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)));
    const nextStart = startOfDay(targetDate);
    const nextEnd = addDays(nextStart, duration);

    const previousReservations = reservations;
    setReservations((current) =>
      current.map((entry) =>
        entry.id === reservation.id
          ? {
              ...entry,
              roomId: targetRoomId,
              room: { ...entry.room, id: targetRoomId, roomNumber: rooms.find((room) => room.id === targetRoomId)?.roomNumber },
              checkInDate: nextStart.toISOString(),
              checkOutDate: nextEnd.toISOString()
            }
          : entry
      )
    );

    try {
      const { data } = await updateReservation(reservation.id, {
        roomId: targetRoomId,
        checkInDate: nextStart.toISOString(),
        checkOutDate: nextEnd.toISOString()
      });
      const updated = data.data;
      setReservations((current) => current.map((entry) => (entry.id === reservation.id ? { ...entry, ...updated } : entry)));
      setMessage({ type: 'success', text: 'Reservation moved on calendar.' });
    } catch (error) {
      setReservations(previousReservations);
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Unable to move reservation.' });
    } finally {
      setDragReservationId('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Booking Calendar</h1>
        <p className="text-sm text-slate-500">Drag reservation blocks to reschedule dates or move room assignment.</p>
      </div>

      {message ? (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left">Room</th>
              {dateColumns.map((date) => (
                <th key={formatDateKey(date)} className="border-b border-slate-200 px-3 py-2 text-left whitespace-nowrap">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="sticky left-0 z-10 border-r border-t border-slate-200 bg-white px-3 py-2 font-medium text-slate-900">
                  {room.roomNumber}
                </td>
                {dateColumns.map((date) => {
                  const dateKey = formatDateKey(date);
                  const reservation = (roomReservations[room.id] || []).find((entry) => {
                    const checkIn = startOfDay(entry.checkInDate);
                    const checkOut = startOfDay(entry.checkOutDate);
                    return checkIn <= date && checkOut > date;
                  });

                  const isStartDate = reservation
                    ? formatDateKey(reservation.checkInDate) === dateKey
                    : false;

                  return (
                    <td
                      key={`${room.id}-${dateKey}`}
                      className="h-12 border-t border-slate-100 px-1 py-1 align-top"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => onDropReservation(room.id, date)}
                    >
                      {reservation ? (
                        isStartDate ? (
                          <button
                            type="button"
                            draggable
                            onDragStart={() => setDragReservationId(reservation.id)}
                            onClick={() =>
                              setMessage({
                                type: 'success',
                                text: `Reservation ${reservation.id.slice(0, 8).toUpperCase()} | Guest: ${reservation.guest?.firstName || ''} ${
                                  reservation.guest?.lastName || ''
                                } | ${new Date(reservation.checkInDate).toLocaleDateString()} - ${new Date(reservation.checkOutDate).toLocaleDateString()}`
                              })
                            }
                            className="w-full rounded bg-blue-600 px-2 py-1 text-left text-xs font-medium text-white hover:bg-blue-700"
                          >
                            {reservation.guest?.firstName} {reservation.guest?.lastName}
                          </button>
                        ) : (
                          <div className="h-full rounded bg-blue-100" />
                        )
                      ) : (
                        <div className="h-full rounded bg-slate-50" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingCalendarPage;
