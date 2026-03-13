interface AttentionItem {
  label: string;
  count: number;
}

interface AttentionListProps {
  items: AttentionItem[];
  emptyTitle: string;
  emptyMessage: string;
}

export function AttentionList({ items, emptyTitle, emptyMessage }: AttentionListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-6 py-7">
        <p className="text-base font-semibold tracking-tight text-emerald-800">{emptyTitle}</p>
        <p className="mt-2 text-sm leading-6 text-emerald-700">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {items.map(item => (
        <div key={item.label} className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4.5">
          <p className="text-[15px] font-semibold tracking-tight text-gray-900">{item.label}</p>
          <span className="inline-flex min-w-9 items-center justify-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-bold text-amber-800">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
