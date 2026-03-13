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
    <div className="ui-panel-card rounded-3xl p-7">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <h4 className="ui-text-main text-xl font-semibold tracking-tight">{entry.title}</h4>
          <p className="ui-text-subtle mt-1.5 text-sm">{createdByLabel}: {entry.authorName}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <div className="text-right">
            <p className="ui-text-main text-sm font-semibold">{entry.progress}%</p>
            <p className="ui-kicker mt-1 text-[11px] font-medium uppercase tracking-[0.14em]">{createdAtLabel}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/65">
        <Progress
          value={entry.progress}
          className="h-2 rounded-full bg-slate-200/65 [&_[data-slot=progress-indicator]]:bg-[#4b9b8a]"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="ui-panel-soft rounded-2xl p-5">
          <p className="ui-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">{summaryLabel}</p>
          <p className="ui-text-subtle whitespace-pre-wrap text-[15px] leading-7">{entry.summary || '-'}</p>
        </div>
        <div className="ui-panel-soft rounded-2xl p-5">
          <p className="ui-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">{achievementsLabel}</p>
          <p className="ui-text-subtle whitespace-pre-wrap text-[15px] leading-7">{entry.achievements || '-'}</p>
        </div>
        <div className="ui-panel-soft rounded-2xl p-5">
          <p className="ui-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">{blockersLabel}</p>
          <p className="ui-text-subtle whitespace-pre-wrap text-[15px] leading-7">{entry.blockers || '-'}</p>
        </div>
        <div className="ui-panel-soft rounded-2xl p-5">
          <p className="ui-kicker mb-3 text-[11px] font-bold uppercase tracking-[0.14em]">{nextStepsLabel}</p>
          <p className="ui-text-subtle whitespace-pre-wrap text-[15px] leading-7">{entry.nextSteps || '-'}</p>
        </div>
      </div>
    </div>
  );
}
