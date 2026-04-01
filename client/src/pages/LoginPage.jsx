import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, token } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/50 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden flex-col justify-between bg-[linear-gradient(160deg,#020617_0%,#0f172a_40%,#0369a1_100%)] p-10 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">HotelPro HMS</p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">Role-based hotel operations login</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-200">
              Sign in with your assigned account to access the correct dashboard for platform admin, ownership, management, front desk, or housekeeping.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'SUPER_ADMIN: SaaS admin panel',
              'OWNER / MANAGER: operations and reporting',
              'RECEPTIONIST / HOUSEKEEPING: task-focused workflows'
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-white p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600">Secure Access</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Login</h2>
                <p className="mt-2 text-sm text-slate-500">Use your hotel role credentials to continue.</p>
              </div>
              <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Back
              </Link>
            </div>

            {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>}

            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@hotelpro.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              <p className="font-semibold text-slate-900">Seed password</p>
              <p className="mt-1">
                <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-900">Admin@1234</code>{' '}
                for the default role accounts.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
