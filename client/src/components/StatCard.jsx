const StatCard = ({ title, value, hint, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-500/10',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-500/10',
    rose: 'bg-rose-50 text-rose-600 ring-rose-500/10',
    amber: 'bg-amber-50 text-amber-600 ring-amber-500/10',
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-500/10'
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${colors[color] || colors.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{hint}</p>
    </div>
  );
};

export default StatCard;
