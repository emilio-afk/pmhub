import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DeliverableFormValue {
  title: string;
  category: string;
  version: string;
  url: string;
  notes: string;
}

interface DeliverableFormProps {
  value: DeliverableFormValue;
  titleLabel: string;
  titlePlaceholder: string;
  categoryLabel: string;
  versionLabel: string;
  resourceLinkLabel: string;
  notesLabel: string;
  cancelLabel: string;
  submitLabel: string;
  titleErrorMessage: string;
  urlRequiredErrorMessage: string;
  urlInvalidErrorMessage: string;
  onChange: (field: keyof DeliverableFormValue, nextValue: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function DeliverableForm({
  value,
  titleLabel,
  titlePlaceholder,
  categoryLabel,
  versionLabel,
  resourceLinkLabel,
  notesLabel,
  cancelLabel,
  submitLabel,
  titleErrorMessage,
  urlRequiredErrorMessage,
  urlInvalidErrorMessage,
  onChange,
  onCancel,
  onSubmit,
}: DeliverableFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof DeliverableFormValue, boolean>>>({});
  const titleError = value.title.trim() ? '' : titleErrorMessage;
  const urlError = (() => {
    const url = value.url.trim();
    if (!url) return urlRequiredErrorMessage;
    try {
      new URL(url);
      return '';
    } catch {
      return urlInvalidErrorMessage;
    }
  })();
  const handleBlur = (field: keyof DeliverableFormValue) => {
    setTouched(current => ({ ...current, [field]: true }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched({ title: true, category: true, version: true, url: true, notes: true });

    if (titleError || urlError) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="ui-form-shell grid grid-cols-1 gap-4 rounded-3xl p-5 lg:grid-cols-2">
        <Field data-invalid={touched.title && titleError ? true : undefined}>
          <FieldLabel htmlFor="deliverable-title">{titleLabel}</FieldLabel>
          <Input
            id="deliverable-title"
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
        <Field>
          <FieldLabel htmlFor="deliverable-category">{categoryLabel}</FieldLabel>
          <Input
            id="deliverable-category"
            type="text"
            value={value.category}
            onChange={e => onChange('category', e.target.value)}
            onBlur={() => handleBlur('category')}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="deliverable-version">{versionLabel}</FieldLabel>
          <Input
            id="deliverable-version"
            type="text"
            value={value.version}
            onChange={e => onChange('version', e.target.value)}
            onBlur={() => handleBlur('version')}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
        </Field>
        <Field data-invalid={touched.url && urlError ? true : undefined}>
          <FieldLabel htmlFor="deliverable-url">{resourceLinkLabel}</FieldLabel>
          <Input
            id="deliverable-url"
            required
            type="url"
            value={value.url}
            onChange={e => onChange('url', e.target.value)}
            onBlur={() => handleBlur('url')}
            aria-invalid={touched.url && urlError ? true : undefined}
            className="ui-form-field h-12 rounded-2xl px-4"
          />
          <FieldError>{touched.url ? urlError : ''}</FieldError>
        </Field>
        <Field className="lg:col-span-2">
          <FieldLabel htmlFor="deliverable-notes">{notesLabel}</FieldLabel>
          <Textarea
            id="deliverable-notes"
            rows={3}
            value={value.notes}
            onChange={e => onChange('notes', e.target.value)}
            onBlur={() => handleBlur('notes')}
            className="ui-form-field resize-none rounded-2xl px-4 py-3"
          />
        </Field>
        <div className="flex justify-end gap-3 lg:col-span-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="ui-action-secondary rounded-xl px-5 py-3 font-semibold">
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
