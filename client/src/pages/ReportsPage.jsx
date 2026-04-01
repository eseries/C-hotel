import { useEffect, useState } from 'react';
import { getRevenueStats } from '../api/dashboardApi';
import useAuth from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';

const ReportsPage = () => {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState({ dailySales: 0, monthlySales: 0 });

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await getRevenueStats(user?.hotelId);
        setRevenue(data.data);
      } catch (_error) {
        setRevenue({ dailySales: 0, monthlySales: 0 });
      }
    };
    if (user?.hotelId) run();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      <p className="mb-4 text-sm text-slate-500">Occupancy, revenue, daily and monthly sales analytics.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Daily Sales</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(revenue.dailySales)}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Monthly Sales</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(revenue.monthlySales)}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
