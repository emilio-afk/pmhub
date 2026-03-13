import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { CheckSquare, ChevronRight } from 'lucide-react';

import { db } from '@/firebase';
import { Button } from '@/components/ui/button';

interface ChecklistItem {
  id: string;
  completed: boolean;
}

interface TaskChecklistSummaryProps {
  projectId: string;
  taskId: string;
  expanded: boolean;
  onToggle: () => void;
  progressLabel: string;
  expandLabel: string;
  collapseLabel: string;
}

export function TaskChecklistSummary({
  projectId,
  taskId,
  expanded,
  onToggle,
  progressLabel,
  expandLabel,
  collapseLabel,
}: TaskChecklistSummaryProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const checklistQuery = query(
      collection(db, 'projects', projectId, 'tasks', taskId, 'checklists'),
      orderBy('createdAt', 'asc'),
    );

    return onSnapshot(checklistQuery, snapshot => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChecklistItem)));
    });
  }, [projectId, taskId]);

  const completedItems = items.filter(item => item.completed).length;

  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      size="xs"
      className="kanban-task-footer-button kanban-task-checklist-trigger rounded-lg px-2 text-slate-600 hover:text-slate-900"
      aria-expanded={expanded}
      aria-label={`${progressLabel}: ${completedItems}/${items.length}. ${expanded ? collapseLabel : expandLabel}`}
      title={expanded ? collapseLabel : expandLabel}
    >
      <CheckSquare size={13} />
      <span>{completedItems}/{items.length}</span>
      <ChevronRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
    </Button>
  );
}
