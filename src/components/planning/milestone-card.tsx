import * as React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MilestoneCardData {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  progress: number;
  owner: string;
}

interface MilestoneCardProps {
  key?: React.Key;
  milestone: MilestoneCardData;
  isExpanded: boolean;
  canManage: boolean;
  statusClassName: string;
  statusLabel: string;
  dueDateLabel: string;
  dueDateValue: string;
  ownerLabel: string;
  expandLabel: string;
  collapseLabel: string;
  editLabel: string;
  deleteLabel: string;
  markPlannedLabel: string;
  markAtRiskLabel: string;
  markCompletedLabel: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPlanned: () => void;
  onMarkAtRisk: () => void;
  onMarkCompleted: () => void;
  comments?: React.ReactNode;
}

export function MilestoneCard({
  milestone,
  isExpanded,
  canManage,
  statusClassName,
  statusLabel,
  dueDateLabel,
  dueDateValue,
  ownerLabel,
  expandLabel,
  collapseLabel,
  editLabel,
  deleteLabel,
  markPlannedLabel,
  markAtRiskLabel,
  markCompletedLabel,
  onToggle,
  onEdit,
  onDelete,
  onMarkPlanned,
  onMarkAtRisk,
  onMarkCompleted,
  comments,
}: MilestoneCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? collapseLabel : expandLabel}
          className="ui-focus-ring ui-interactive-button -mx-2 flex min-w-0 flex-1 items-start gap-4 rounded-2xl px-2 py-1.5 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-xl font-semibold tracking-tight text-gray-900">{milestone.title}</h4>
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs font-semibold ${statusClassName}`}
                aria-label={`Status: ${statusLabel}`}
              >
                {statusLabel}
              </Badge>
              <Badge
                variant="outline"
                className="border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600"
                aria-label={`Progress: ${milestone.progress}%`}
              >
                {milestone.progress}%
              </Badge>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <p>{dueDateLabel}: {dueDateValue}</p>
              <p>{ownerLabel}: {milestone.owner || '-'}</p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`mt-1 shrink-0 text-gray-400 transition-[color,transform] duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onEdit} className="ui-interactive-button rounded-xl">
              {editLabel}
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              className="ui-interactive-button rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              <Trash2 size={14} />
              {deleteLabel}
            </Button>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-gray-500">{milestone.description || '-'}</p>
          <Progress
            value={milestone.progress}
            aria-label={`${milestone.title} progress: ${milestone.progress}%`}
            className="mt-6 h-2 rounded-full bg-gray-100 [&_[data-slot=progress-indicator]]:bg-gray-900"
          />
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">{milestone.progress}%</p>
            {canManage && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={onMarkPlanned} className="ui-interactive-button rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  {markPlannedLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onMarkAtRisk} className="ui-interactive-button rounded-xl border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800">
                  {markAtRiskLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onMarkCompleted} className="ui-interactive-button rounded-xl border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                  {markCompletedLabel}
                </Button>
              </div>
            )}
          </div>
          {comments}
        </>
      )}
    </div>
  );
}
