import * as React from 'react';

import { Progress } from '@/components/ui/progress';

interface UpdateEntryData {
  id: string;
  title: string;
  authorName: string;
  progress: number;
  summary: string;
  achievements: string;
  blockers: string;
  nextSteps: string;
}

interface UpdateCardProps {
  key?: React.Key;
  entry: UpdateEntryData;
  createdByLabel: string;
  summaryLabel: string;
  achievementsLabel: string;
  blockersLabel: string;
  nextStepsLabel: string;
  createdAtLabel: string;
  editAction?: React.ReactNode;
}

export function UpdateCard({
  entry,
  createdByLabel,
  summaryLabel,
  achievementsLabel,
  blockersLabel,
  nextStepsLabel,
  createdAtLabel,
  editAction,
}: UpdateCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <h4 className="text-xl font-semibold tracking-tight text-gray-900">{entry.title}</h4>
          <p className="mt-1.5 text-sm text-gray-500">{createdByLabel}: {entry.authorName}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{entry.progress}%</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">{createdAtLabel}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
        <Progress
          value={entry.progress}
          className="h-2 rounded-full bg-gray-100 [&_[data-slot=progress-indicator]]:bg-emerald-500"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-gray-50 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{summaryLabel}</p>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-600">{entry.summary || '-'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gray-50 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{achievementsLabel}</p>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-600">{entry.achievements || '-'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gray-50 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{blockersLabel}</p>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-600">{entry.blockers || '-'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gray-50 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{nextStepsLabel}</p>
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-gray-600">{entry.nextSteps || '-'}</p>
        </div>
      </div>
    </div>
  );
}
