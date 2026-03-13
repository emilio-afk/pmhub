import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MilestoneFormValue {
  title: string;
  description: string;
  dueDate: string;
  owner: string;
  progress: string;
}

interface MilestoneFormProps {
  value: MilestoneFormValue;
  titleLabel: string;
  titlePlaceholder: string;
  dueDateLabel: string;
  ownerLabel: string;
  progressLabel: string;
  descriptionLabel: string;
  cancelLabel: string;
  submitLabel: string;
  titleErrorMessage: string;
  dueDateErrorMessage: string;
  progressErrorMessage: string;
  onChange: (field: keyof MilestoneFormValue, nextValue: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function MilestoneForm({
  value,
  titleLabel,
  titlePlaceholder,
  dueDateLabel,
  ownerLabel,
  progressLabel,
  descriptionLabel,
  cancelLabel,
  submitLabel,
  titleErrorMessage,
  dueDateErrorMessage,
  progressErrorMessage,
  onChange,
  onCancel,
  onSubmit,
}: MilestoneFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof MilestoneFormValue, boolean>>>({});
  const titleError = value.title.trim() ? '' : titleErrorMessage;
  const dueDateError = value.dueDate ? '' : dueDateErrorMessage;
  const progressError = value.progress === '' || (/^\d+(\.\d+)?$/.test(value.progress) && Number(value.progress) >= 0 && Number(value.progress) <= 100)
    ? ''
    : progressErrorMessage;
  const handleBlur = (field: keyof MilestoneFormValue) => {
    setTouched(current => ({ ...current, [field]: true }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched({ title: true, description: true, dueDate: true, owner: true, progress: true });

    if (titleError || dueDateError || progressError) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="ui-form-shell grid grid-cols-1 gap-4 rounded-3xl p-5 lg:grid-cols-2">
        <Field data-invalid={touched.title && titleError ? true : undefined}>
          <FieldLabel htmlFor="milestone-title">{titleLabel}</FieldLabel>
          <Input
            id="milestone-title"
            required
            type="text"
            value={value.title}
            onChange={e => onChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            aria-invalid={touched.title && titleError ? true : undefined}
            placeholder={titlePlaceholder}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
          <FieldError>{touched.title ? titleError : ''}</FieldError>
        </Field>
        <Field data-invalid={touched.dueDate && dueDateError ? true : undefined}>
          <FieldLabel htmlFor="milestone-due-date">{dueDateLabel}</FieldLabel>
          <Input
            id="milestone-due-date"
            required
            type="date"
            value={value.dueDate}
            onChange={e => onChange('dueDate', e.target.value)}
            onBlur={() => handleBlur('dueDate')}
            aria-invalid={touched.dueDate && dueDateError ? true : undefined}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
          <FieldError>{touched.dueDate ? dueDateError : ''}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="milestone-owner">{ownerLabel}</FieldLabel>
          <Input
            id="milestone-owner"
            type="text"
            value={value.owner}
            onChange={e => onChange('owner', e.target.value)}
            onBlur={() => handleBlur('owner')}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
        </Field>
        <Field data-invalid={touched.progress && progressError ? true : undefined}>
          <FieldLabel htmlFor="milestone-progress">{progressLabel}</FieldLabel>
          <Input
            id="milestone-progress"
            type="number"
            min="0"
            max="100"
            value={value.progress}
            onChange={e => onChange('progress', e.target.value)}
            onBlur={() => handleBlur('progress')}
            aria-invalid={touched.progress && progressError ? true : undefined}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
          <FieldError>{touched.progress ? progressError : ''}</FieldError>
        </Field>
        <Field className="lg:col-span-2">
          <FieldLabel htmlFor="milestone-description">{descriptionLabel}</FieldLabel>
          <Textarea
            id="milestone-description"
            rows={3}
            value={value.description}
            onChange={e => onChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            className="ui-form-field resize-none rounded-2xl px-4 py-3"
          />
        </Field>
        <div className="flex justify-end gap-3 lg:col-span-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="ui-action-secondary rounded-xl px-5 py-3 font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button type="submit" className="rounded-xl px-5 py-3 font-semibold">
            {submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
