const roomStatusStyles = {
  AVAILABLE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DIRTY: 'border-rose-200 bg-rose-50 text-rose-700',
  OCCUPIED: 'border-amber-200 bg-amber-50 text-amber-700',
  MAINTENANCE: 'border-slate-300 bg-slate-100 text-slate-700',
  CLEANING: 'border-sky-200 bg-sky-50 text-sky-700',
  RESERVED: 'border-indigo-200 bg-indigo-50 text-indigo-700'
};

const RoomStatusBoard = ({ rooms }) => (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-lg font-semibold text-slate-900">Room Status Board</h2>
      <p className="mt-1 text-sm text-slate-500">Live view of room availability and housekeeping readiness.</p>
    </div>

    <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`rounded-2xl border p-4 shadow-sm ${roomStatusStyles[room.status] || 'border-slate-200 bg-white text-slate-700'}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">Room</p>
              <p className="mt-1 text-2xl font-bold">{room.roomNumber}</p>
            </div>
            <span className="h-3 w-3 rounded-full bg-current" />
          </div>
          <p className="mt-4 text-sm font-semibold">{room.status}</p>
          <p className="mt-1 text-xs opacity-80">{room.roomType?.name || 'Standard room'}</p>
        </div>
      ))}
    </div>
  </div>
);

export default RoomStatusBoard;
