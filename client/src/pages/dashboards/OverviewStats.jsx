import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Users, 
  DoorOpen, 
  CalendarCheck, 
  BarChart3 
} from 'lucide-react';
import { getDashboardStats } from '../../api/dashboardApi';
import StatCard from '../../components/StatCard';
import useAuth from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/currency';

const defaultStats = {
  totalRevenue: 0,
  occupancyRate: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  availableRooms: 0
};

const OverviewStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats(user?.hotelId);
        setStats(data.data || defaultStats);
      } catch (_error) {
        setStats(defaultStats);
      }
    };

    if (user?.hotelId || user?.role === 'SUPER_ADMIN') {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard 
        title="Total Revenue" 
        value={formatCurrency(stats.totalRevenue)} 
        hint="All-time" 
        icon={DollarSign}
        color="indigo"
      />
      <StatCard 
        title="Occupancy" 
        value={`${stats.occupancyRate}%`} 
        hint="Current load" 
        icon={BarChart3}
        color="emerald"
      />
      <StatCard 
        title="Today's Check-ins" 
        value={stats.todayCheckIns} 
        hint="Arrivals" 
        icon={CalendarCheck}
        color="blue"
      />
      <StatCard 
        title="Today's Check-outs" 
        value={stats.todayCheckOuts} 
        hint="Departures" 
        icon={Users}
        color="amber"
      />
      <StatCard 
        title="Available Rooms" 
        value={stats.availableRooms} 
        hint="Ready to book" 
        icon={DoorOpen}
        color="rose"
      />
    </div>
  );
};

export default OverviewStats;
