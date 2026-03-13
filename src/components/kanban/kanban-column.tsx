import * as React from 'react';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface KanbanColumnMeta {
  file: string;
  statement: string;
  comment: string;
  dot: string;
  badge: string;
}

interface KanbanColumnProps {
  key?: React.Key;
  meta: KanbanColumnMeta;
  taskCount: number;
  canAdd: boolean;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}

export function KanbanColumn({
  meta,
  taskCount,
  canAdd,
  onAdd,
  addLabel,
  children,
}: KanbanColumnProps) {
  return (
    <div className="kanban-code-column kanban-column-shell flex flex-col">
      <div className="kanban-column-header relative mb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
            <span className="kanban-task-meta truncate text-slate-500 normal-case">{meta.file}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="kanban-column-title">{meta.statement}</h3>
            <p className="kanban-column-comment mt-0.5 truncate whitespace-nowrap">
              {meta.comment}
            </p>
          </div>
          <Badge variant="outline" className={`kanban-column-counter shrink-0 ${meta.badge}`}>
            {String(taskCount).padStart(2, '0')}
          </Badge>
        </div>
      </div>

      <div className="kanban-code-scroll kanban-column-scroll">
        {children}
      </div>

      {canAdd && (
        <div className="mt-3">
          <Button
            onClick={onAdd}
            variant="outline"
            size="sm"
            className="kanban-code-command kanban-add-button w-full justify-center rounded-xl border-slate-300/90 bg-white/86 text-slate-600 shadow-none hover:bg-white hover:text-slate-900"
          >
            <Plus data-icon="inline-start" />
            {addLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
