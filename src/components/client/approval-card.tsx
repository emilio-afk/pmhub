import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ApprovalData {
  id: string;
  title: string;
  description: string;
  requestedByName: string;
  decisionNote?: string;
  decidedByName?: string;
}

interface ApprovalCardProps {
  key?: React.Key;
  approval: ApprovalData;
  statusClassName: string;
  statusLabel: string;
  typeLabel: string;
  createdByLabel: string;
  requestedAtLabel: string;
  approvalNoteLabel: string;
  approveLabel: string;
  requestChangesLabel: string;
  decidedByLabel: string;
  decisionNoteValue: string;
  onDecisionNoteChange: (nextValue: string) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  editAction?: React.ReactNode;
  comments?: React.ReactNode;
  decisionMetaLabel?: string;
}

export function ApprovalCard({
  approval,
  statusClassName,
  statusLabel,
  typeLabel,
  createdByLabel,
  requestedAtLabel,
  approvalNoteLabel,
  approveLabel,
  requestChangesLabel,
  decidedByLabel,
  decisionNoteValue,
  onDecisionNoteChange,
  onApprove,
  onRequestChanges,
  editAction,
  comments,
  decisionMetaLabel,
}: ApprovalCardProps) {
  return (
    <div className="ui-panel-card rounded-3xl p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="ui-text-main text-lg font-bold">{approval.title}</h4>
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
              aria-label={`Type: ${typeLabel}`}
            >
              {typeLabel}
            </Badge>
          </div>
          <p className="ui-text-subtle mt-2 whitespace-pre-wrap text-sm">{approval.description || '-'}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <div className="ui-text-subtle text-sm">
            <p>{createdByLabel}: {approval.requestedByName}</p>
            <p>{requestedAtLabel}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 items-end gap-4 lg:grid-cols-[1fr,auto]">
        <div>
          <label className="ui-text-main mb-1 block text-sm font-medium">{approvalNoteLabel}</label>
          <Textarea
            rows={2}
            value={decisionNoteValue}
            onChange={e => onDecisionNoteChange(e.target.value)}
            className="ui-form-field min-h-0 resize-none rounded-2xl px-4 py-3"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApprove} className="rounded-xl bg-[#2f7d71] text-sm font-semibold text-white hover:bg-[#27695f]">
            {approveLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onRequestChanges} className="rounded-xl border-rose-200 text-sm font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800">
            {requestChangesLabel}
          </Button>
        </div>
      </div>
      {decisionMetaLabel && (
        <p className="ui-text-subtle mt-3 text-sm">
          {decidedByLabel}: {decisionMetaLabel}
        </p>
      )}
      {comments}
    </div>
  );
}
