import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ClientActionFormValue {
  title: string;
  dueDate: string;
  description: string;
}

interface ClientActionFormProps {
  value: ClientActionFormValue;
  titleLabel: string;
  titlePlaceholder: string;
  dueDateLabel: string;
  descriptionLabel: string;
  cancelLabel: string;
  submitLabel: string;
  titleErrorMessage: string;
  dueDateErrorMessage: string;
  onChange: (field: keyof ClientActionFormValue, nextValue: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ClientActionForm({
  value,
  titleLabel,
  titlePlaceholder,
  dueDateLabel,
  descriptionLabel,
  cancelLabel,
  submitLabel,
  titleErrorMessage,
  dueDateErrorMessage,
  onChange,
  onCancel,
  onSubmit,
}: ClientActionFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof ClientActionFormValue, boolean>>>({});
  const titleError = value.title.trim() ? '' : titleErrorMessage;
  const dueDateError = value.dueDate ? '' : dueDateErrorMessage;
  const handleBlur = (field: keyof ClientActionFormValue) => {
    setTouched(current => ({ ...current, [field]: true }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched({ title: true, dueDate: true, description: true });

    if (titleError || dueDateError) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="grid grid-cols-1 gap-4 rounded-3xl border border-gray-100 bg-gray-50/70 p-5">
        <Field data-invalid={touched.title && titleError ? true : undefined}>
          <FieldLabel htmlFor="client-action-title">{titleLabel}</FieldLabel>
          <Input
            id="client-action-title"
            required
            type="text"
            value={value.title}
            onChange={e => onChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            aria-invalid={touched.title && titleError ? true : undefined}
            placeholder={titlePlaceholder}
            className="h-12 rounded-2xl bg-white px-4"
          />
          <FieldError>{touched.title ? titleError : ''}</FieldError>
        </Field>
        <Field data-invalid={touched.dueDate && dueDateError ? true : undefined}>
          <FieldLabel htmlFor="client-action-due-date">{dueDateLabel}</FieldLabel>
          <Input
            id="client-action-due-date"
            required
            type="date"
            value={value.dueDate}
            onChange={e => onChange('dueDate', e.target.value)}
            onBlur={() => handleBlur('dueDate')}
            aria-invalid={touched.dueDate && dueDateError ? true : undefined}
            className="h-12 rounded-2xl bg-white px-4"
          />
          <FieldError>{touched.dueDate ? dueDateError : ''}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="client-action-description">{descriptionLabel}</FieldLabel>
          <Textarea
            id="client-action-description"
            rows={3}
            value={value.description}
            onChange={e => onChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            className="resize-none rounded-2xl bg-white px-4 py-3"
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl px-5 py-3 font-semibold text-gray-600 hover:bg-white">
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
