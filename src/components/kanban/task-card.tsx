import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Flag, Pencil, Trash2 } from 'lucide-react';

import { TaskChecklistSummary } from '@/components/kanban/task-checklist-summary';
import { Button } from '@/components/ui/button';

interface TaskCardData {
  id: string;
  title: string;
  order: number;
  requiresApproval?: boolean;
  priority?: 'regular' | 'high';
}

interface TaskCardProps {
  key?: React.Key;
  task: TaskCardData;
  projectId?: string;
  isChecklistExpanded: boolean;
  canManage: boolean;
  canMoveBack: boolean;
  canMoveForward: boolean;
  taskLabel: string;
  approvalBadgeLabel: string;
  setHighPriorityLabel: string;
  setRegularPriorityLabel: string;
  checklistProgressLabel: string;
  checklistExpandLabel: string;
  checklistCollapseLabel: string;
  editLabel: string;
  deleteLabel: string;
  moveBackLabel: string;
  moveForwardLabel: string;
  onToggleChecklist: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePriority: () => void;
  onMoveBack: () => void;
  onMoveForward: () => void;
  checklistContent?: React.ReactNode;
}

export function TaskCard({
  task,
  projectId,
  isChecklistExpanded,
  canManage,
  canMoveBack,
  canMoveForward,
  taskLabel,
  approvalBadgeLabel,
  setHighPriorityLabel,
  setRegularPriorityLabel,
  checklistProgressLabel,
  checklistExpandLabel,
  checklistCollapseLabel,
  editLabel,
  deleteLabel,
  moveBackLabel,
  moveForwardLabel,
  onToggleChecklist,
  onEdit,
  onDelete,
  onTogglePriority,
  onMoveBack,
  onMoveForward,
  checklistContent,
}: TaskCardProps) {
  const isHighPriority = task.priority === 'high';
  const titleWrapRef = React.useRef<HTMLDivElement | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({
    left: 0,
    top: 0,
    width: 0,
  });

  const updateTooltipPosition = React.useCallback(() => {
    const node = titleWrapRef.current;
    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    setTooltipStyle({
      left: rect.left,
      top: rect.bottom + 4,
      width: rect.width,
    });
  }, []);

  React.useEffect(() => {
    if (!isTooltipVisible) {
      return;
    }

    updateTooltipPosition();

    const handleViewportChange = () => updateTooltipPosition();

    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isTooltipVisible, updateTooltipPosition]);

  const showTooltip = () => {
    updateTooltipPosition();
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    setIsTooltipVisible(false);
  };

  return (
    <>
      <motion.div
        layout
        className={`kanban-code-card kanban-task-card flex flex-col ${isHighPriority ? 'kanban-task-card-priority-high' : ''}`}
        transition={{ layout: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      >
        <div className="kanban-task-main min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="kanban-task-order" aria-label={`${taskLabel} ${String(task.order).padStart(2, '0')}`}>
                {String(task.order).padStart(2, '0')}
              </span>
              {task.requiresApproval && (
                <span className="kanban-task-tag">
                  {approvalBadgeLabel}
                </span>
              )}
            </div>
            {canManage && (
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  onClick={onTogglePriority}
                  variant="ghost"
                  size="icon-xs"
                  className={`kanban-task-icon-button rounded-lg ${isHighPriority ? 'kanban-task-priority-button-active text-emerald-700 hover:text-emerald-800' : 'text-slate-500 hover:text-slate-900'}`}
                  aria-label={isHighPriority ? setRegularPriorityLabel : setHighPriorityLabel}
                  title={isHighPriority ? setRegularPriorityLabel : setHighPriorityLabel}
                >
                  <Flag size={13} />
                </Button>
                <Button
                  onClick={onEdit}
                  variant="ghost"
                  size="icon-xs"
                  className="kanban-task-icon-button rounded-lg text-slate-500 hover:text-slate-900"
                  aria-label={editLabel}
                  title={editLabel}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  onClick={onDelete}
                  variant="ghost"
                  size="icon-xs"
                  className="kanban-task-icon-button rounded-lg text-rose-600 hover:text-rose-700"
                  aria-label={deleteLabel}
                  title={deleteLabel}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            )}
          </div>

          <div
            ref={titleWrapRef}
            className="kanban-task-title-wrap mt-3"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
          >
            <h4 className="kanban-task-title kanban-task-title-clamp">
              {task.title}
            </h4>
          </div>

          <div className="kanban-task-footer">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {projectId && (
                <TaskChecklistSummary
                  projectId={projectId}
                  taskId={task.id}
                  expanded={isChecklistExpanded}
                  onToggle={onToggleChecklist}
                  progressLabel={checklistProgressLabel}
                  expandLabel={checklistExpandLabel}
                  collapseLabel={checklistCollapseLabel}
                />
              )}
            </div>

            {(canMoveBack || canMoveForward) && (
              <div className="flex shrink-0 items-center gap-1">
                {canMoveBack && (
                  <Button
                    onClick={onMoveBack}
                    variant="ghost"
                    size="icon-xs"
                    className="kanban-task-icon-button rounded-lg text-slate-500 hover:text-slate-900"
                    aria-label={moveBackLabel}
                    title={moveBackLabel}
                  >
                    <ArrowLeft size={13} />
                  </Button>
                )}
                {canMoveForward && (
                  <Button
                    onClick={onMoveForward}
                    variant="outline"
                    size="icon-xs"
                    className="kanban-task-icon-button kanban-task-icon-button-primary rounded-lg border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    aria-label={moveForwardLabel}
                    title={moveForwardLabel}
                  >
                    <ArrowRight size={13} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isChecklistExpanded && checklistContent && (
            <motion.div
              key={`${task.id}-details`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="kanban-task-details mt-0">
                {checklistContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isTooltipVisible && typeof document !== 'undefined' && createPortal(
        <div className="kanban-task-title-tooltip" role="tooltip" style={tooltipStyle}>
          {task.title}
        </div>,
        document.body,
      )}
    </>
  );
}
