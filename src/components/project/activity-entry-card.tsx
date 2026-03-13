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
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500">
        <ActivityIcon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{entry.message}</p>
        <p className="mt-1 text-sm text-gray-500">{entry.actorName}</p>
        <p className="mt-1 text-xs text-gray-400">{createdAtLabel}</p>
      </div>
    </div>
  );
}
