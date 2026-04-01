import DashboardSection from './DashboardSection';

const AdminDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
      <p className="text-sm text-slate-500">Platform-wide control for tenants, subscriptions, and operational visibility.</p>
    </div>

    <DashboardSection
      title="SaaS Admin Panel"
      description="Core platform modules for managing hotels and subscriptions."
      items={[
        { title: 'Hotel Tenants', description: 'Review onboarded hotels, configurations, and lifecycle status.' },
        { title: 'Subscriptions', description: 'Monitor plan status, billing cycles, and platform revenue.' },
        { title: 'Users & Roles', description: 'Audit role assignments and account activation across tenants.' },
        { title: 'Platform Reports', description: 'Track adoption, performance, and platform health metrics.' }
      ]}
    />
  </div>
);

export default AdminDashboard;
