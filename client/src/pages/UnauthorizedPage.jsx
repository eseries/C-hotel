import { Link } from 'react-router-dom';

const UnauthorizedPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">403 - Unauthorized</h1>
      <p className="mt-2 text-sm text-slate-500">You do not have permission to access this module.</p>
      <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default UnauthorizedPage;
