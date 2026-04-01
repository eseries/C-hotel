import { useEffect, useState } from 'react';
import { fetchHotels } from '../api/modulesApi';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchHotels();
        setHotels(data.data || []);
      } catch (_error) {
        setHotels([]);
      }
    };
    run();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hotel Management</h1>
      <p className="mb-4 text-sm text-slate-500">Create, update, and manage hotel settings.</p>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Currency</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{hotel.name}</td>
                <td className="px-4 py-3">{hotel.slug}</td>
                <td className="px-4 py-3">{hotel.city}, {hotel.country}</td>
                <td className="px-4 py-3">NGN</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotelsPage;
