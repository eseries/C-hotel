import DashboardSection from './DashboardSection';
import OverviewStats from './OverviewStats';

const OwnerDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
      <p className="text-sm text-slate-500">Commercial and operational oversight for your hotel portfolio.</p>
    </div>

    <OverviewStats />

    <DashboardSection
      title="Owner Modules"
      description="High-level business areas you can supervise from the operations console."
      items={[
        { title: 'Reservations', description: 'Track booking volume, occupancy trends, and upcoming arrivals.' },
        { title: 'Rooms', description: 'Review inventory availability, room status, and pricing readiness.' },
        { title: 'Billing', description: 'Monitor revenue, payments, and outstanding balances.' },
        { title: 'Reports', description: 'Review operating performance and business summaries.' }
      ]}
    />
  </div>
);

export default OwnerDashboard;
