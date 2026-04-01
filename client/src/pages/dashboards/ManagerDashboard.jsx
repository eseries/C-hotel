import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DoorOpen, 
  CalendarCheck, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getDashboardStats, getRevenueChartData } from '../../api/dashboardApi';
import { fetchRooms, fetchPayments } from '../../api/modulesApi';
import StatCard from '../../components/StatCard';
import useAuth from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/currency';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    occupancyRate: 0,
    todayRevenue: 0,
    todayArrivals: 0,
    todayDepartures: 0,
    roomsNeedingCleaning: 0,
    availableRooms: 0,
    pendingReservations: 0
  });
  const [chartData, setChartData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.hotelId) return;
      setLoading(true);
      try {
        const [statsRes, chartRes, roomsRes, paymentsRes] = await Promise.all([
          getDashboardStats(user.hotelId),
          getRevenueChartData(user.hotelId),
          fetchRooms(user.hotelId),
          fetchPayments(user.hotelId)
        ]);

        setStats(statsRes.data.data);
        setChartData(chartRes.data.data);
        setRooms(roomsRes.data.data.slice(0, 8)); // Only show first 8 rooms in overview
        setRecentPayments(paymentsRes.data.data.slice(0, 5)); // Show 5 most recent payments
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.hotelId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manager Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time overview of your hotel's performance and operations.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Occupancy" 
          value={`${stats.occupancyRate}%`} 
          hint="Current guest load" 
          icon={Users} 
          color="indigo"
        />
        <StatCard 
          title="Revenue Today" 
          value={formatCurrency(stats.todayRevenue)} 
          hint="From today's payments" 
          icon={TrendingUp} 
          color="emerald"
        />
        <StatCard 
          title="Arrivals / Departures" 
          value={`${stats.todayArrivals} / ${stats.todayDepartures}`} 
          hint="Daily movement" 
          icon={CalendarCheck} 
          color="blue"
        />
        <StatCard 
          title="Available Rooms" 
          value={stats.availableRooms} 
          hint="Ready for booking" 
          icon={DoorOpen} 
          color="amber"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Revenue Trends</h3>
                <p className="text-sm text-slate-500">Daily revenue for the last 30 days</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/10">
                +12% vs last month
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Operational Focus</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-500/10">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{stats.roomsNeedingCleaning} Rooms Need Cleaning</p>
                  <p className="text-xs text-slate-500">Requires housekeeping attention</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{stats.pendingReservations} Pending Reservations</p>
                  <p className="text-xs text-slate-500">Awaiting confirmation or payment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">System Healthy</p>
                  <p className="text-xs text-slate-500">All automated tasks running smoothly</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Payments</h3>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-slate-500">{payment.method} • {new Date(payment.paidAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">No recent payments recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Room Status Board</h3>
              <p className="text-sm text-slate-500">Quick view of current room occupancy and status.</p>
            </div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All Rooms</button>
          </div>
        </div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Room {room.roomNumber}</span>
                <div className={`h-2 w-2 rounded-full ${
                  room.status === 'AVAILABLE' ? 'bg-emerald-500' :
                  room.status === 'OCCUPIED' ? 'bg-amber-500' :
                  room.status === 'DIRTY' ? 'bg-rose-500' : 'bg-slate-300'
                }`} />
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">{room.roomType?.name || 'Standard'}</p>
              <div className="mt-4">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  room.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                  room.status === 'OCCUPIED' ? 'bg-amber-50 text-amber-700' :
                  room.status === 'DIRTY' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {room.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
