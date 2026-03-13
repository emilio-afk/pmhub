import * as React from 'react';

import { Button } from '@/components/ui/button';

interface RiskCardData {
  id: string;
  title: string;
  description: string;
  owner: string;
  mitigation: string;
}

interface RiskCardProps {
  key?: React.Key;
  risk: RiskCardData;
  impactClassName: string;
  impactLabel: string;
  statusLabel: string;
  ownerLabel: string;
  mitigateLabel: string;
  closeRiskLabel: string;
  canManage: boolean;
  onMitigate: () => void;
  onClose: () => void;
  editAction?: React.ReactNode;
}

export function RiskCard({
  risk,
  impactClassName,
  impactLabel,
  statusLabel,
  ownerLabel,
  mitigateLabel,
  closeRiskLabel,
  canManage,
  onMitigate,
  onClose,
  editAction,
}: RiskCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="font-semibold text-gray-900">{risk.title}</h4>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${impactClassName}`}>
              {impactLabel}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-500">{risk.description || '-'}</p>
          <p className="mt-2 text-sm text-gray-500">{ownerLabel}: {risk.owner || '-'}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-500">{mitigateLabel}: {risk.mitigation || '-'}</p>
        </div>
        <div className="flex items-start gap-3">
          {editAction}
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {statusLabel}
          </span>
        </div>
      </div>
      {canManage && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onMitigate} className="rounded-xl border-amber-200 text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800">
            {mitigateLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
            {closeRiskLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
