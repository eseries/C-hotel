import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', roles: [] },
  { path: '/hotels', label: 'Hotels', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER'] },
  { path: '/rooms', label: 'Rooms', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'] },
  { path: '/reservations', label: 'Reservations', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { path: '/calendar', label: 'Calendar', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { path: '/guests', label: 'Guest CRM', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { path: '/housekeeping', label: 'Housekeeping', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'HOUSEKEEPING'] },
  { path: '/billing', label: 'Billing', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { path: '/reports', label: 'Reports', roles: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { path: '/admin', label: 'SaaS Admin', roles: ['SUPER_ADMIN'] }
];

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const visibleNavItems = navItems.filter((item) => item.roles.length === 0 || item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 bg-slate-900 p-5 text-white lg:block">
          <h1 className="text-xl font-bold">HotelPro HMS</h1>
          <p className="mt-1 text-xs text-slate-300">Multi-tenant SaaS</p>
          <nav className="mt-8 space-y-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  pathname === item.path ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm lg:px-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Hotel Operations Console</h2>
              <p className="text-xs text-slate-500">Role: {user?.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          </header>

          <section className="p-4 lg:p-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
