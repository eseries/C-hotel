import useAuth from '../hooks/useAuth';
import AdminDashboard from './dashboards/AdminDashboard';
import HousekeepingDashboard from './dashboards/HousekeepingDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';
import ReceptionDashboard from './dashboards/ReceptionDashboard';

const dashboardByRole = {
  SUPER_ADMIN: AdminDashboard,
  OWNER: OwnerDashboard,
  MANAGER: ManagerDashboard,
  RECEPTIONIST: ReceptionDashboard,
  HOUSEKEEPING: HousekeepingDashboard
};

const Dashboard = () => {
  const { user } = useAuth();
  const RoleDashboard = dashboardByRole[user?.role] || OwnerDashboard;

  return <RoleDashboard />;
};

export default Dashboard;
