const DashboardSection = ({ title, description, items }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {items.length} modules
      </span>
    </div>

    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardSection;
