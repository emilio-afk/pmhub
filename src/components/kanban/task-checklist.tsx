import type * as React from 'react';
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { CheckCircle2, CheckSquare, Pencil, Trash2 } from 'lucide-react';

import { db } from '@/firebase';
import { Input } from '@/components/ui/input';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskChecklistProps {
  projectId: string;
  taskId: string;
  canEdit: boolean;
  checklistLabel: string;
  addItemLabel: string;
  editItemLabel: string;
  deleteItemLabel: string;
  variant?: 'default' | 'code';
  onActivity?: (message: string) => Promise<void> | void;
}

export function TaskChecklist({
  projectId,
  taskId,
  canEdit,
  checklistLabel,
  addItemLabel,
  editItemLabel,
  deleteItemLabel,
  onActivity,
  variant = 'default',
}: TaskChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const isCode = variant === 'code';

  useEffect(() => {
    const checklistQuery = query(
      collection(db, 'projects', projectId, 'tasks', taskId, 'checklists'),
      orderBy('createdAt', 'asc'),
    );

    return onSnapshot(checklistQuery, snapshot => {
      setItems(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() } as ChecklistItem)));
    });
  }, [projectId, taskId]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newItemText.trim()) return;

    await addDoc(collection(db, 'projects', projectId, 'tasks', taskId, 'checklists'), {
      taskId,
      text: newItemText,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    await onActivity?.(`Added checklist item "${newItemText.trim()}"`);
    setNewItemText('');
  };

  const toggleItem = async (item: ChecklistItem) => {
    if (!canEdit) return;

    await updateDoc(doc(db, 'projects', projectId, 'tasks', taskId, 'checklists', item.id), {
      completed: !item.completed,
    });

    await onActivity?.(`${!item.completed ? 'Completed' : 'Reopened'} checklist item "${item.text}"`);
  };

  const deleteItem = async (itemId: string) => {
    if (!canEdit) return;

    const item = items.find(entry => entry.id === itemId);
    await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId, 'checklists', itemId));

    if (item) {
      await onActivity?.(`Removed checklist item "${item.text}"`);
    }
  };

  const startEditing = (item: ChecklistItem) => {
    if (!canEdit) return;
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const saveItem = async (item: ChecklistItem) => {
    if (!canEdit) return;

    const nextText = editingText.trim();
    if (!nextText || nextText === item.text) {
      cancelEditing();
      return;
    }

    await updateDoc(doc(db, 'projects', projectId, 'tasks', taskId, 'checklists', item.id), {
      text: nextText,
    });

    await onActivity?.(`Updated checklist item "${item.text}" to "${nextText}"`);
    cancelEditing();
  };

  return (
    <div className={isCode ? 'space-y-1.5 pb-1.5' : 'mt-px space-y-2'}>
      <div className="mb-0.5 flex items-center gap-2">
        <CheckSquare size={14} className={isCode ? 'text-slate-500' : 'text-gray-400'} />
        <span className={`${isCode ? 'kanban-ui-font text-[10px] tracking-[0.03em] text-slate-500' : 'text-xs'} font-bold uppercase tracking-wider text-gray-400`}>
          {checklistLabel}
        </span>
      </div>
      {items.map(item => (
        <div
          key={item.id}
          className={`group flex items-start gap-2.5 ${isCode ? 'py-1.5' : ''}`}
        >
          <button
            type="button"
            onClick={() => toggleItem(item)}
            disabled={!canEdit}
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
              item.completed
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : isCode
                  ? 'border-slate-300 text-slate-500 hover:border-slate-400'
                  : 'border-gray-200 hover:border-gray-400'
            } ${canEdit ? '' : 'cursor-default'}`}
          >
            {item.completed && <CheckCircle2 size={10} />}
          </button>
          {editingItemId === item.id ? (
            <Input
              autoFocus
              type="text"
              value={editingText}
              onChange={e => setEditingText(e.target.value)}
              onBlur={() => { void saveItem(item); }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void saveItem(item);
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelEditing();
                }
              }}
              className={isCode
                ? 'kanban-ui-font h-7 flex-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] leading-[1.3] text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-200'
                : 'h-7 flex-1 rounded-md border-gray-200 bg-white px-2 text-sm text-gray-900'}
              aria-label={editItemLabel}
            />
          ) : (
            <span className={`min-w-0 flex-1 ${isCode ? 'kanban-ui-font text-[11px] leading-[1.3]' : 'text-sm'} ${
              item.completed
                ? (isCode ? 'text-slate-400 line-through' : 'text-gray-400 line-through')
                : (isCode ? 'text-slate-700' : 'text-gray-700')
            }`}>
              {item.text}
            </span>
          )}
          {canEdit && (
            <div className="ml-auto mt-0.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => startEditing(item)}
                className={`opacity-0 transition-all group-hover:opacity-100 ${
                  editingItemId === item.id ? 'opacity-100' : ''
                } ${isCode ? 'text-slate-400 hover:text-slate-700' : 'text-gray-300 hover:text-gray-600'}`}
                aria-label={editItemLabel}
                title={editItemLabel}
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                className={`opacity-0 transition-all group-hover:opacity-100 ${
                  editingItemId === item.id ? 'opacity-100' : ''
                } ${isCode ? 'text-slate-400 hover:text-red-500' : 'text-gray-300 hover:text-red-500'}`}
                aria-label={deleteItemLabel}
                title={deleteItemLabel}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      ))}
      {canEdit && (
        <form onSubmit={addItem} className="mt-2">
          <Input
            type="text"
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            placeholder={addItemLabel}
            className={isCode
              ? 'kanban-ui-font h-auto rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] leading-[1.3] text-slate-900 placeholder:text-slate-400 focus-visible:ring-sky-200'
              : 'h-auto rounded-lg border-gray-200 bg-gray-50 px-2 py-2 placeholder:text-gray-400'}
          />
        </form>
      )}
    </div>
  );
}
