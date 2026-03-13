interface ExecutiveSummaryCardProps {
  title: string;
  summary: string;
  createdAtLabel: string;
  nextActionLabel: string;
  nextActionValue: string;
  blockersLabel: string;
  blockersValue: string;
  emptyTitle: string;
  emptyMessage: string;
}

export function ExecutiveSummaryCard({
  title,
  summary,
  createdAtLabel,
  nextActionLabel,
  nextActionValue,
  blockersLabel,
  blockersValue,
  emptyTitle,
  emptyMessage,
}: ExecutiveSummaryCardProps) {
  if (!title) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200/80 bg-gray-50/80 px-6 py-7">
        <p className="text-base font-semibold tracking-tight text-gray-900">{emptyTitle}</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-gray-50/80 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xl font-semibold tracking-tight text-gray-900">{title}</p>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-gray-500">{summary || '-'}</p>
          </div>
          <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{createdAtLabel}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{nextActionLabel}</p>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-700">{nextActionValue || '-'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{blockersLabel}</p>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-700">{blockersValue || '-'}</p>
        </div>
      </div>
    </div>
  );
}
