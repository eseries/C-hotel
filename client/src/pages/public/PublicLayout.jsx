import { Link } from 'react-router-dom';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_45%,#f8fafc_100%)] text-slate-900">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-950">HotelPro HMS</span>
          <span className="text-xs uppercase tracking-[0.25em] text-brand-600">Guest Booking</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Link to="/" className="rounded-full px-3 py-2 hover:bg-white/70">Home</Link>
          <Link to="/search" className="rounded-full px-3 py-2 hover:bg-white/70">Rooms</Link>
          <Link to="/search" className="rounded-full px-3 py-2 hover:bg-white/70">Book Room</Link>
          <a href="/#contact" className="rounded-full px-3 py-2 hover:bg-white/70">Contact</a>
        </nav>
      </header>

      <main className="pb-12 pt-8">{children}</main>
    </div>
  </div>
);

export default PublicLayout;
