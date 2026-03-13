import * as React from 'react';

import { Badge } from '@/components/ui/badge';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface SectionStat {
  value: string;
  label: string;
  accent: string;
}

interface ProjectSectionHeaderProps {
  icon?: IconComponent;
  label?: string;
  stats: SectionStat[];
  action?: React.ReactNode;
}

function SectionStatPill({ item }: { key?: React.Key; item: SectionStat }) {
  const [dotClassName, textClassName] = item.accent.split(' ');

  return (
    <Badge variant="outline" className="gap-3 px-3 py-2 text-left" aria-label={`${item.label}: ${item.value}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${dotClassName}`} />
      <span className={`text-sm font-bold leading-none ${textClassName}`}>{item.value}</span>
      <span className="text-[12px] font-medium text-gray-500">{item.label}</span>
    </Badge>
  );
}

export function ProjectSectionHeader({ icon: Icon, label, stats, action }: ProjectSectionHeaderProps) {
  const hasStats = stats.length > 0;

  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex flex-col gap-5 xl:flex-row xl:flex-nowrap xl:items-center xl:justify-between">
        <div className="min-w-0 xl:flex-none">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600">
                <Icon size={17} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[28px] font-bold tracking-tight text-gray-900">{label}</h2>
            </div>
          </div>
        </div>
        {(action || hasStats) && (
          <div className="flex flex-wrap items-center gap-3 xl:min-w-0 xl:flex-1 xl:justify-end">
            {action}
            {hasStats && (
              <div className="flex flex-wrap gap-3" role="list" aria-label={label ? `${label} stats` : 'Section stats'}>
                {stats.map(item => (
                  <div key={`${item.label}-${item.value}`} role="listitem">
                    <SectionStatPill item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
