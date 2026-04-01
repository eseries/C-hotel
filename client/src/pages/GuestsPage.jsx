import { useEffect, useState } from 'react';
import { fetchGuests } from '../api/modulesApi';
import useAuth from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';

const GuestsPage = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchGuests(user?.hotelId);
        setGuests(data.data || []);
      } catch (_error) {
        setGuests([]);
      }
    };
    if (user?.hotelId) run();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Guest CRM</h1>
      <p className="mb-4 text-sm text-slate-500">Profiles, stay history, and contact management.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {guests.map((guest) => (
          <div key={guest.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="font-semibold text-slate-900">{guest.firstName} {guest.lastName}</p>
            <p className="text-sm text-slate-500">{guest.email || 'No email'}</p>
            <p className="text-sm text-slate-500">{guest.phone || 'No phone'}</p>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <p>Total stays: {guest.totalStays || 0}</p>
              <p>Total spent: {formatCurrency(guest.totalMoneySpent)}</p>
              <p>Preferred room: {guest.preferredRoomType || 'N/A'}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs font-semibold text-slate-700">Visit history</p>
              <div className="mt-1 space-y-1">
                {(guest.visitHistory || []).slice(0, 3).map((visit, index) => (
                  <p key={`${guest.id}-visit-${index}`} className="text-xs text-slate-500">
                    {visit.roomType || 'Room'} ({visit.roomNumber || '-'}) • {new Date(visit.checkInDate).toLocaleDateString()} -{' '}
                    {new Date(visit.checkOutDate).toLocaleDateString()}
                  </p>
                ))}
                {(guest.visitHistory || []).length === 0 ? <p className="text-xs text-slate-400">No stays yet</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestsPage;
