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
    <div className="ui-panel-card rounded-3xl p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="ui-text-main text-xl font-semibold tracking-tight">{deliverable.title}</h4>
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-semibold ${statusClassName}`}
              aria-label={`Status: ${statusLabel}`}
            >
              {statusLabel}
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50/90 px-3 py-1 text-xs font-semibold text-slate-700"
              aria-label={`Version: ${deliverable.version}`}
            >
              {deliverable.version}
            </Badge>
          </div>
          <p className="ui-text-subtle mt-2 text-sm">{deliverable.category || '-'}</p>
          <p className="ui-text-subtle mt-4 whitespace-pre-wrap text-[15px] leading-7">{deliverable.notes || '-'}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <a
            href={deliverable.url}
            target="_blank"
            rel="noreferrer"
            className="ui-text-main inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#2b6f8f]"
          >
            <Link2 size={16} />
            {resourceLinkLabel}
          </a>
        </div>
      </div>
      {canManage && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onMarkShared} className="rounded-xl border-[#b7d5e5] text-sm font-medium text-[#2b6f8f] hover:bg-[#e9f4fa] hover:text-[#245b7d]">
            {markSharedLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onMarkApproved} className="rounded-xl border-[#b9ddd3] text-sm font-medium text-[#2f7d71] hover:bg-[#e4f3ef] hover:text-[#27695f]">
            {markApprovedLabel}
          </Button>
        </div>
      )}
      {comments}
    </div>
  );
}
