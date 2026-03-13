import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

interface SectionBlockProps {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  attentionCount?: number;
  toggleLabel?: string;
  hideIcon?: boolean;
  compactHeader?: boolean;
  titleClassName?: string;
}

export function SectionBlock({
  icon: Icon,
  title,
  description,
  action,
  children,
  collapsible = false,
  expanded = true,
  onToggle,
  attentionCount = 0,
  toggleLabel,
  hideIcon = false,
  compactHeader = false,
  titleClassName,
}: SectionBlockProps) {
  if (collapsible) {
    return (
      <Collapsible open={expanded} onOpenChange={() => onToggle?.()}>
        <Card className="rounded-3xl border border-slate-200/70 bg-white py-0 shadow-sm">
          <CardHeader
            className={cn(
              'flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6',
              compactHeader ? 'mb-0' : 'mb-0',
            )}
          >
            <CollapsibleTrigger
              aria-label={toggleLabel}
              className="ui-focus-ring ui-interactive-button group/section -mx-2 flex flex-1 items-start gap-3 rounded-2xl px-2 py-1.5 text-left"
            >
              {!hideIcon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 transition-colors duration-200 group-hover/section:border-slate-300/80 group-hover/section:bg-slate-100 group-hover/section:text-slate-700">
                  <Icon size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className={titleClassName}>{title}</CardTitle>
                  {attentionCount > 0 && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">{attentionCount}</Badge>}
                </div>
                {description && <CardDescription className="mt-1">{description}</CardDescription>}
              </div>
              <ChevronDown
                size={18}
                className={cn(
                  'mt-1.5 shrink-0 text-slate-400 transition-[color,transform] duration-200 group-hover/section:text-slate-600',
                  expanded && 'rotate-180',
                )}
              />
            </CollapsibleTrigger>
            {action}
          </CardHeader>
          <CollapsibleContent>
            <CardContent className={cn('pb-5 md:pb-6', compactHeader ? 'pt-0' : 'pt-0')}>
              {children}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Card className="rounded-3xl border border-slate-200/70 bg-white py-0 shadow-sm">
      <CardHeader className={cn('flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6', compactHeader ? 'mb-0' : 'mb-0')}>
        <div className="flex items-start gap-3">
          {!hideIcon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600">
              <Icon size={18} />
            </div>
          )}
          <div>
            <CardTitle className={titleClassName}>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className="pb-5 md:pb-6">{children}</CardContent>
    </Card>
  );
}
