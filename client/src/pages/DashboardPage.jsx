import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/dashboardApi';
import StatCard from '../components/StatCard';
import useAuth from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    occupancyRate: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    availableRooms: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats(user?.hotelId);
        setStats(data.data);
      } catch (_error) {
        setStats((prev) => prev);
      }
    };

    if (user?.hotelId || user?.role === 'SUPER_ADMIN') fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Live hotel KPI widgets for operations monitoring.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} hint="All-time" />
        <StatCard title="Occupancy" value={`${stats.occupancyRate}%`} hint="Current room occupancy" />
        <StatCard title="Today's Check-ins" value={stats.todayCheckIns} hint="Arrivals" />
        <StatCard title="Today's Check-outs" value={stats.todayCheckOuts} hint="Departures" />
        <StatCard title="Available Rooms" value={stats.availableRooms} hint="Ready to book" />
      </div>
    </div>
  );
};

export default DashboardPage;
