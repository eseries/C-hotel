const badgeClasses = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700'
};

const priorityClasses = {
  HIGH: 'bg-rose-100 text-rose-700',
  NORMAL: 'bg-slate-100 text-slate-700',
  LOW: 'bg-emerald-100 text-emerald-700'
};

const formatTaskType = (taskType) => {
  if (taskType === 'PREPARE_CHECKED_IN_ROOM') return 'Inspection';
  return taskType?.charAt(0) + taskType?.slice(1).toLowerCase();
};

const ActionButton = ({ children, className, ...props }) => (
  <button
    type="button"
    className={`min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const CleaningTaskList = ({ tasks, loadingTaskId, onStartTask, onCompleteTask, onReportIssue }) => (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-5 py-4">
      <h2 className="text-lg font-semibold text-slate-900">Assigned Tasks</h2>
      <p className="mt-1 text-sm text-slate-500">Cleaning, inspection, and maintenance work assigned to you.</p>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Room Number</th>
            <th className="px-5 py-3">Task Type</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Priority</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const isBusy = loadingTaskId === task.id;
            const isCompleted = task.status === 'COMPLETED';

            return (
              <tr key={task.id} className="align-top">
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900">Room {task.room?.roomNumber || 'N/A'}</div>
                  <div className="mt-1 text-xs text-slate-500">{task.room?.status || 'Unknown room status'}</div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700">{formatTaskType(task.taskType)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[task.status] || 'bg-slate-100 text-slate-700'}`}>
                    {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses[task.priority] || 'bg-slate-100 text-slate-700'}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex min-w-[220px] flex-col gap-2 sm:flex-row">
                    <ActionButton
                      onClick={() => onStartTask(task)}
                      disabled={isBusy || isCompleted}
                      className={isBusy || isCompleted ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-sky-600 text-white hover:bg-sky-700'}
                    >
                      {isBusy && task.status !== 'COMPLETED' ? 'Updating...' : 'Start Cleaning'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onCompleteTask(task)}
                      disabled={isBusy || isCompleted}
                      className={isBusy || isCompleted ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                    >
                      {isCompleted ? 'Completed' : 'Complete Cleaning'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onReportIssue(task.room?.roomNumber)}
                      className="border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    >
                      Report Issue
                    </ActionButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {tasks.length === 0 ? <div className="px-5 py-8 text-sm text-slate-500">No housekeeping tasks are currently assigned to you.</div> : null}
  </div>
);

export default CleaningTaskList;
