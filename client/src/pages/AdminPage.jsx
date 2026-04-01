import { useEffect, useState } from 'react';
import { fetchPlatformAnalytics, fetchSubscriptions } from '../api/modulesApi';
import { formatCurrency } from '../utils/currency';

const AdminPage = () => {
  const [analytics, setAnalytics] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
    grossPlatformRevenue: 0
  });
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [analyticsRes, subsRes] = await Promise.all([fetchPlatformAnalytics(), fetchSubscriptions()]);
        setAnalytics(analyticsRes.data.data || analytics);
        setSubscriptions(subsRes.data.data || []);
      } catch (_error) {
        setAnalytics({ totalHotels: 0, totalUsers: 0, totalSubscriptions: 0, grossPlatformRevenue: 0 });
        setSubscriptions([]);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SaaS Admin</h1>
        <p className="text-sm text-slate-500">Platform-wide hotels, users, subscriptions, and analytics management.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">Hotels</p>
          <p className="text-2xl font-bold text-slate-900">{analytics.totalHotels}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">Users</p>
          <p className="text-2xl font-bold text-slate-900">{analytics.totalUsers}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">Subscriptions</p>
          <p className="text-2xl font-bold text-slate-900">{analytics.totalSubscriptions}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">Revenue</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.grossPlatformRevenue)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 text-lg font-semibold">Subscriptions</h2>
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-lg border border-slate-100 p-3 text-sm">
              <p className="font-medium">{sub.hotel?.name} - {sub.planName}</p>
              <p className="text-xs text-slate-500">{sub.status} | {sub.billingCycle} | {formatCurrency(sub.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
