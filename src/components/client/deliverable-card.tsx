import * as React from 'react';
import { Link2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DeliverableData {
  id: string;
  title: string;
  category: string;
  version: string;
  notes: string;
  url: string;
}

interface DeliverableCardProps {
  key?: React.Key;
  deliverable: DeliverableData;
  statusClassName: string;
  statusLabel: string;
  resourceLinkLabel: string;
  markSharedLabel: string;
  markApprovedLabel: string;
  canManage: boolean;
  onMarkShared: () => void;
  onMarkApproved: () => void;
  editAction?: React.ReactNode;
  comments?: React.ReactNode;
}

export function DeliverableCard({
  deliverable,
  statusClassName,
  statusLabel,
  resourceLinkLabel,
  markSharedLabel,
  markApprovedLabel,
  canManage,
  onMarkShared,
  onMarkApproved,
  editAction,
  comments,
}: DeliverableCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-xl font-semibold tracking-tight text-gray-900">{deliverable.title}</h4>
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
              aria-label={`Version: ${deliverable.version}`}
            >
              {deliverable.version}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-gray-500">{deliverable.category || '-'}</p>
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-gray-600">{deliverable.notes || '-'}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <a
            href={deliverable.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            <Link2 size={16} />
            {resourceLinkLabel}
          </a>
        </div>
      </div>
      {canManage && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onMarkShared} className="rounded-xl border-sky-200 text-sm font-medium text-sky-700 hover:bg-sky-50 hover:text-sky-800">
            {markSharedLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onMarkApproved} className="rounded-xl border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            {markApprovedLabel}
          </Button>
        </div>
      )}
      {comments}
    </div>
  );
}
