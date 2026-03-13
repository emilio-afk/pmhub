import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClientActionData {
  id: string;
  title: string;
  description: string;
}

interface ClientActionCardProps {
  key?: React.Key;
  item: ClientActionData;
  statusClassName: string;
  statusLabel: string;
  dueDateLabel: string;
  dueDateValue: string;
  markSubmittedLabel: string;
  markDoneLabel: string;
  onMarkSubmitted: () => void;
  onMarkDone: () => void;
  editAction?: React.ReactNode;
}

export function ClientActionCard({
  item,
  statusClassName,
  statusLabel,
  dueDateLabel,
  dueDateValue,
  markSubmittedLabel,
  markDoneLabel,
  onMarkSubmitted,
  onMarkDone,
  editAction,
}: ClientActionCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-[15px] font-semibold tracking-tight text-gray-900">{item.title}</h4>
          <p className="mt-2 text-sm leading-6 text-gray-500">{item.description || '-'}</p>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{dueDateLabel}: {dueDateValue}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-semibold ${statusClassName}`}
            aria-label={`Status: ${statusLabel}`}
          >
            {statusLabel}
          </Badge>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onMarkSubmitted} className="rounded-xl border-sky-200 text-sm font-medium text-sky-700 hover:bg-sky-50 hover:text-sky-800">
          {markSubmittedLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onMarkDone} className="rounded-xl border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
          {markDoneLabel}
        </Button>
      </div>
    </div>
  );
}
