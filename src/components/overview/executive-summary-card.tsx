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
      <div className="ui-panel-soft rounded-2xl border-dashed px-6 py-7">
        <p className="ui-text-main text-base font-semibold tracking-tight">{emptyTitle}</p>
        <p className="ui-text-subtle mt-2 text-sm leading-6">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="ui-panel-tint rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="ui-text-main text-xl font-semibold tracking-tight">{title}</p>
            <p className="ui-text-subtle mt-3 whitespace-pre-wrap text-[15px] leading-7">{summary || '-'}</p>
          </div>
          <p className="ui-kicker shrink-0 text-[11px] font-medium uppercase tracking-[0.14em]">{createdAtLabel}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="ui-panel-card rounded-2xl p-5">
          <p className="ui-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">{nextActionLabel}</p>
          <p className="ui-text-main whitespace-pre-wrap text-[15px] leading-7">{nextActionValue || '-'}</p>
        </div>
        <div className="ui-panel-card rounded-2xl p-5">
          <p className="ui-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">{blockersLabel}</p>
          <p className="ui-text-main whitespace-pre-wrap text-[15px] leading-7">{blockersValue || '-'}</p>
        </div>
      </div>
    </div>
  );
}
