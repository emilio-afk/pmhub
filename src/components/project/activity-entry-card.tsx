import * as React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';

interface ActivityEntryData {
  id: string;
  message: string;
  actorName: string;
}

interface ActivityEntryCardProps {
  key?: React.Key;
  entry: ActivityEntryData;
  createdAtLabel: string;
}

export function ActivityEntryCard({ entry, createdAtLabel }: ActivityEntryCardProps) {
  return (
    <div className="ui-panel-card flex items-start gap-4 rounded-2xl p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/90 text-slate-500">
        <ActivityIcon size={16} />
      </div>
      <div className="min-w-0">
        <p className="ui-text-main text-sm font-semibold">{entry.message}</p>
        <p className="ui-text-subtle mt-1 text-sm">{entry.actorName}</p>
        <p className="ui-kicker mt-1 text-xs">{createdAtLabel}</p>
      </div>
    </div>
  );
}
