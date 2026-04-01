import { useEffect, useState } from 'react';
import { createRoomType, fetchRooms, fetchRoomTypes, updateRoomType } from '../api/modulesApi';
import useAuth from '../hooks/useAuth';
import { formatCurrency, MIN_ROOM_PRICE_NGN } from '../utils/currency';

const initialForm = {
  name: '',
  basePrice: '',
  capacity: '1',
  amenities: '',
  description: ''
};

const RoomsPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState(null);

  const run = async () => {
    try {
      const [roomsRes, typesRes] = await Promise.all([fetchRooms(user?.hotelId), fetchRoomTypes(user?.hotelId)]);
      setRooms(roomsRes.data.data || []);
      setRoomTypes(typesRes.data.data || []);
    } catch (_error) {
      setRooms([]);
      setRoomTypes([]);
      setMessage({ type: 'error', text: 'Failed to load room data.' });
    }
  };

  useEffect(() => {
    if (user?.hotelId) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hotelId]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingRoomTypeId('');
  };

  const startEdit = (roomType) => {
    setEditingRoomTypeId(roomType.id);
    setForm({
      name: roomType.name || '',
      basePrice: String(roomType.basePrice || ''),
      capacity: String(roomType.capacity || 1),
      amenities: roomType.amenities || '',
      description: roomType.description || ''
    });
    setMessage(null);
  };

  const submitRoomType = async (event) => {
    event.preventDefault();
    const numericPrice = Number(form.basePrice);

    if (numericPrice < MIN_ROOM_PRICE_NGN) {
      setMessage({ type: 'error', text: 'Minimum room price is ₦20,000' });
      return;
    }

    const payload = {
      hotelId: user.hotelId,
      name: form.name.trim(),
      basePrice: numericPrice,
      capacity: Number(form.capacity || 1),
      amenities: form.amenities.trim(),
      description: form.description.trim() || null
    };

    try {
      if (editingRoomTypeId) {
        await updateRoomType(editingRoomTypeId, payload);
        setMessage({ type: 'success', text: 'Room type updated.' });
      } else {
        await createRoomType(payload);
        setMessage({ type: 'success', text: 'Room type created.' });
      }
      resetForm();
      await run();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Unable to save room type.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
      <p className="mb-4 text-sm text-slate-500">Inventory, room types, pricing, status, and amenities.</p>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">{editingRoomTypeId ? 'Edit Room Type' : 'Create Room Type'}</h2>
        {message ? (
          <div
            className={`mb-3 rounded-md border px-3 py-2 text-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {message.text}
          </div>
        ) : null}
        <form onSubmit={submitRoomType} className="grid gap-3 md:grid-cols-5">
          <input
            type="text"
            placeholder="Room type name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            type="number"
            min={MIN_ROOM_PRICE_NGN}
            step="1"
            placeholder="Base price"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.basePrice}
            onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
            required
          />
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Capacity"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.capacity}
            onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Amenities (comma-separated)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.amenities}
            onChange={(event) => setForm((prev) => ({ ...prev, amenities: event.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            {editingRoomTypeId ? 'Update Type' : 'Create Type'}
          </button>
          {editingRoomTypeId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel Edit
            </button>
          ) : null}
        </form>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Room Types</h2>
        <div className="space-y-2">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
              <p className="text-sm font-medium text-slate-900">
                {roomType.name} | {formatCurrency(roomType.basePrice)} | {roomType.capacity} guest(s)
              </p>
              <button
                type="button"
                onClick={() => startEdit(roomType)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
            </div>
          ))}
          {roomTypes.length === 0 ? <p className="text-sm text-slate-500">No room types found.</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-lg font-semibold text-slate-900">Room {room.roomNumber}</p>
            <p className="text-sm text-slate-500">Type: {room.roomType?.name}</p>
            <p className="mt-2 text-xs font-semibold text-brand-700">Status: {room.status}</p>
            <p className="text-xs text-slate-500">Price: {formatCurrency(room.customPrice || room.roomType?.basePrice)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsPage;
