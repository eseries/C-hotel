import { Link } from 'react-router-dom';

const Landing = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.95),_transparent_45%)]" />
    <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold tracking-wide text-brand-500">HotelPro HMS</p>
          <p className="text-sm text-slate-300">Multi-tenant hotel operations software</p>
        </div>
        <Link
          to="/search"
          className="rounded-full border border-slate-700 px-5 py-2 text-sm font-medium text-slate-100 transition hover:border-brand-500 hover:text-white"
        >
          Browse Rooms
        </Link>
      </header>

      <main className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">Hotel Management SaaS</p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            HotelPro HMS
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Multi-tenant Hotel Management Platform
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Centralize reservations, rooms, guests, housekeeping, billing, and reporting in one role-aware operations console.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-600"
            >
              Book Room
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-900"
            >
              Guest Home
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {[
            ['Role-Based Access', 'Dedicated experiences for super admin, owners, managers, reception, and housekeeping.'],
            ['Multi-Tenant Ready', 'Support multiple hotels with a clean SaaS control layer and scoped operations data.'],
            ['Front Desk Flow', 'Run reservations, guest management, and check-in/check-out from one place.'],
            ['Operations Visibility', 'Track rooms, tasks, revenue, and occupancy from dashboard modules.']
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-slate-800 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  </div>
);

export default Landing;
