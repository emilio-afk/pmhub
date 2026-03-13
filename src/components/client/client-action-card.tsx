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
    <div className="ui-panel-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="ui-text-main text-[15px] font-semibold tracking-tight">{item.title}</h4>
          <p className="ui-text-subtle mt-2 text-sm leading-6">{item.description || '-'}</p>
          <p className="ui-kicker mt-3 text-[11px] font-medium uppercase tracking-[0.14em]">{dueDateLabel}: {dueDateValue}</p>
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
        <Button type="button" variant="outline" onClick={onMarkSubmitted} className="rounded-xl border-[#b7d5e5] text-sm font-medium text-[#2b6f8f] hover:bg-[#e9f4fa] hover:text-[#245b7d]">
          {markSubmittedLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onMarkDone} className="rounded-xl border-[#b9ddd3] text-sm font-medium text-[#2f7d71] hover:bg-[#e4f3ef] hover:text-[#27695f]">
          {markDoneLabel}
        </Button>
      </div>
    </div>
  );
}
