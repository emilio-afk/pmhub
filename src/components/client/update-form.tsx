import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface UpdateFormValue {
  title: string;
  progress: string;
  summary: string;
  achievements: string;
  blockers: string;
  nextSteps: string;
}

interface UpdateFormProps {
  value: UpdateFormValue;
  titleLabel: string;
  progressLabel: string;
  summaryLabel: string;
  achievementsLabel: string;
  blockersLabel: string;
  nextStepsLabel: string;
  titlePlaceholder: string;
  cancelLabel: string;
  submitLabel: string;
  titleErrorMessage: string;
  progressErrorMessage: string;
  onChange: (field: keyof UpdateFormValue, nextValue: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function UpdateForm({
  value,
  titleLabel,
  progressLabel,
  summaryLabel,
  achievementsLabel,
  blockersLabel,
  nextStepsLabel,
  titlePlaceholder,
  cancelLabel,
  submitLabel,
  titleErrorMessage,
  progressErrorMessage,
  onChange,
  onCancel,
  onSubmit,
}: UpdateFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof UpdateFormValue, boolean>>>({});
  const titleError = value.title.trim() ? '' : titleErrorMessage;
  const progressError = value.progress === '' || (/^\d+(\.\d+)?$/.test(value.progress) && Number(value.progress) >= 0 && Number(value.progress) <= 100)
    ? ''
    : progressErrorMessage;
  const handleBlur = (field: keyof UpdateFormValue) => {
    setTouched(current => ({ ...current, [field]: true }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched({
      title: true,
      progress: true,
      summary: true,
      achievements: true,
      blockers: true,
      nextSteps: true,
    });

    if (titleError || progressError) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="ui-form-shell grid grid-cols-1 gap-4 rounded-3xl p-5 lg:grid-cols-2">
        <Field data-invalid={touched.title && titleError ? true : undefined}>
          <FieldLabel htmlFor="update-title">{titleLabel}</FieldLabel>
          <Input
            id="update-title"
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
        <Field data-invalid={touched.progress && progressError ? true : undefined}>
          <FieldLabel htmlFor="update-progress">{progressLabel}</FieldLabel>
          <Input
            id="update-progress"
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
          <FieldLabel htmlFor="update-summary">{summaryLabel}</FieldLabel>
          <Textarea
            id="update-summary"
            rows={3}
            value={value.summary}
            onChange={e => onChange('summary', e.target.value)}
            onBlur={() => handleBlur('summary')}
            className="ui-form-field resize-none rounded-2xl px-4 py-3"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="update-achievements">{achievementsLabel}</FieldLabel>
          <Textarea
            id="update-achievements"
            rows={3}
            value={value.achievements}
            onChange={e => onChange('achievements', e.target.value)}
            onBlur={() => handleBlur('achievements')}
            className="ui-form-field resize-none rounded-2xl px-4 py-3"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="update-blockers">{blockersLabel}</FieldLabel>
          <Textarea
            id="update-blockers"
            rows={3}
            value={value.blockers}
            onChange={e => onChange('blockers', e.target.value)}
            onBlur={() => handleBlur('blockers')}
            className="ui-form-field resize-none rounded-2xl px-4 py-3"
          />
        </Field>
        <Field className="lg:col-span-2">
          <FieldLabel htmlFor="update-next-steps">{nextStepsLabel}</FieldLabel>
          <Textarea
            id="update-next-steps"
            rows={3}
            value={value.nextSteps}
            onChange={e => onChange('nextSteps', e.target.value)}
            onBlur={() => handleBlur('nextSteps')}
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
