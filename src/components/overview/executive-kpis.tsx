interface ExecutiveKpiItem {
  label: string;
  value: string;
  support: string;
  tone?: 'default' | 'status';
  statusLabel?: string;
  statusClassName?: string;
}

interface ExecutiveKpisProps {
  items: ExecutiveKpiItem[];
}

export function ExecutiveKpis({ items }: ExecutiveKpisProps) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <dt className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{item.label}</dt>
          {item.tone === 'status' ? (
            <dd className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${item.statusClassName}`}
                aria-label={`${item.label}: ${item.statusLabel}`}
              >
                {item.statusLabel}
              </span>
            </dd>
          ) : (
            <dd className="text-[2.5rem] leading-none font-semibold tracking-tight text-gray-900">{item.value}</dd>
          )}
          <p className="mt-4 text-sm leading-6 text-gray-500">{item.support}</p>
        </div>
      ))}
    </dl>
  );
}
