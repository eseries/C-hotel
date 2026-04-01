import { useEffect, useState } from 'react';

const MaintenanceReportForm = ({ hotelId, rooms, initialRoomNumber = '', submitting, onSubmit }) => {
  const [form, setForm] = useState({
    roomNumber: initialRoomNumber,
    issueDescription: '',
    priority: 'HIGH'
  });

  useEffect(() => {
    setForm((current) => ({ ...current, roomNumber: initialRoomNumber || current.roomNumber }));
  }, [initialRoomNumber]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submitted = await onSubmit({
      hotelId,
      roomNumber: form.roomNumber,
      issueDescription: form.issueDescription,
      priority: form.priority,
      taskType: 'MAINTENANCE'
    });

    if (submitted) {
      setForm((current) => ({
        ...current,
        issueDescription: '',
        priority: 'HIGH'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Report Maintenance Issue</h2>
        <p className="mt-1 text-sm text-slate-500">Create a maintenance task directly from the housekeeping dashboard.</p>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Room Number
          <select
            name="roomNumber"
            value={form.roomNumber}
            onChange={handleChange}
            className="min-h-12 rounded-2xl border border-slate-300 px-4 text-base outline-none ring-0 transition focus:border-sky-500"
            required
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.roomNumber}>
                Room {room.roomNumber}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Issue Description
          <textarea
            name="issueDescription"
            value={form.issueDescription}
            onChange={handleChange}
            rows="4"
            required
            placeholder="Describe the issue found in the room."
            className="rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none ring-0 transition focus:border-sky-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Priority
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="min-h-12 rounded-2xl border border-slate-300 px-4 text-base outline-none ring-0 transition focus:border-sky-500"
          >
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`mt-5 min-h-12 w-full rounded-2xl px-4 py-3 text-base font-semibold ${submitting ? 'cursor-not-allowed bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
      >
        {submitting ? 'Submitting...' : 'Report Issue'}
      </button>
    </form>
  );
};

export default MaintenanceReportForm;
