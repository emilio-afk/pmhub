import type { ReactNode } from 'react';

import { Progress } from '@/components/ui/progress';

interface UpcomingMilestone {
  id: string;
  title: string;
  progress: number;
}

interface UpcomingMilestonesProps {
  milestones: UpcomingMilestone[];
  statusLabelById: Record<string, string>;
  statusClassNameById: Record<string, string>;
  dueDateLabelById: Record<string, string>;
  emptyState: ReactNode;
}

export function UpcomingMilestones({
  milestones,
  statusLabelById,
  statusClassNameById,
  dueDateLabelById,
  emptyState,
}: UpcomingMilestonesProps) {
  if (milestones.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {milestones.map(milestone => (
        <div key={milestone.id} className="rounded-2xl border border-slate-200/70 bg-gray-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-tight text-gray-900">{milestone.title}</p>
              <p className="mt-1.5 text-sm text-gray-500">{dueDateLabelById[milestone.id]}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClassNameById[milestone.id]}`}
              aria-label={`Status: ${statusLabelById[milestone.id]}`}
            >
              {statusLabelById[milestone.id]}
            </span>
          </div>
          <Progress
            value={milestone.progress}
            aria-label={`${milestone.title} progress: ${milestone.progress}%`}
            className="mt-4 h-2 rounded-full bg-white [&_[data-slot=progress-indicator]]:bg-gray-900"
          />
        </div>
      ))}
    </div>
  );
}
