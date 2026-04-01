import { useEffect, useState } from 'react';
import CleaningTaskList from '../../components/CleaningTaskList';
import MaintenanceReportForm from '../../components/MaintenanceReportForm';
import RoomStatusBoard from '../../components/RoomStatusBoard';
import StatCard from '../../components/StatCard';
import { createHousekeepingTask, fetchHousekeepingDashboard, updateTask } from '../../api/modulesApi';
import useAuth from '../../hooks/useAuth';

const HousekeepingDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    summary: {
      roomsToCleanToday: 0,
      roomsCleanedToday: 0,
      roomsUnderMaintenance: 0,
      urgentTasks: 0
    },
    tasks: [],
    rooms: []
  });
  const [activeTaskId, setActiveTaskId] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');

  const loadDashboard = async () => {
    if (!user?.hotelId) return;

    try {
      const { data } = await fetchHousekeepingDashboard(user.hotelId);
      setDashboard(
        data.data || {
          summary: {
            roomsToCleanToday: 0,
            roomsCleanedToday: 0,
            roomsUnderMaintenance: 0,
            urgentTasks: 0
          },
          tasks: [],
          rooms: []
        }
      );
    } catch (_error) {
      setDashboard({
        summary: {
          roomsToCleanToday: 0,
          roomsCleanedToday: 0,
          roomsUnderMaintenance: 0,
          urgentTasks: 0
        },
        tasks: [],
        rooms: []
      });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.hotelId]);

  const handleTaskUpdate = async (task, status) => {
    setActiveTaskId(task.id);
    try {
      await updateTask(task.id, { status });
      await loadDashboard();
    } catch (_error) {
      // Keep the last successful dashboard state.
    } finally {
      setActiveTaskId('');
    }
  };

  const handleSubmitIssue = async (payload) => {
    setSubmittingIssue(true);
    try {
      await createHousekeepingTask(payload);
      await loadDashboard();
      return true;
    } catch (_error) {
      return false;
    } finally {
      setSubmittingIssue(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Housekeeping Dashboard</h1>
        <p className="text-sm text-slate-500">
          Monitor room readiness, work through assigned cleaning tasks, and report maintenance issues from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Rooms to Clean Today" value={dashboard.summary.roomsToCleanToday} hint="Pending or active cleaning workload today" />
        <StatCard title="Rooms Cleaned Today" value={dashboard.summary.roomsCleanedToday} hint="Cleaning tasks completed today" />
        <StatCard title="Rooms Under Maintenance" value={dashboard.summary.roomsUnderMaintenance} hint="Rooms blocked for repairs or follow-up" />
        <StatCard title="Urgent Tasks" value={dashboard.summary.urgentTasks} hint="High-priority work needing immediate attention" />
      </div>

      <CleaningTaskList
        tasks={dashboard.tasks}
        loadingTaskId={activeTaskId}
        onStartTask={(task) => handleTaskUpdate(task, 'IN_PROGRESS')}
        onCompleteTask={(task) => handleTaskUpdate(task, 'COMPLETED')}
        onReportIssue={(roomNumber) => setSelectedRoomNumber(roomNumber || '')}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <RoomStatusBoard rooms={dashboard.rooms} />
        <MaintenanceReportForm
          hotelId={user?.hotelId}
          rooms={dashboard.rooms}
          initialRoomNumber={selectedRoomNumber}
          submitting={submittingIssue}
          onSubmit={handleSubmitIssue}
        />
      </div>
    </div>
  );
};

export default HousekeepingDashboard;
