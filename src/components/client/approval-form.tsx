import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ApprovalFormValue {
  title: string;
  itemType: string;
  description: string;
}

interface ApprovalFormProps {
  value: ApprovalFormValue;
  titleLabel: string;
  titlePlaceholder: string;
  categoryLabel: string;
  descriptionLabel: string;
  cancelLabel: string;
  submitLabel: string;
  deliverableLabel: string;
  changeRequestLabel: string;
  phaseLabel: string;
  copyLabel: string;
  designLabel: string;
  titleErrorMessage: string;
  itemTypeErrorMessage: string;
  onChange: (field: keyof ApprovalFormValue, nextValue: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ApprovalForm({
  value,
  titleLabel,
  titlePlaceholder,
  categoryLabel,
  descriptionLabel,
  cancelLabel,
  submitLabel,
  deliverableLabel,
  changeRequestLabel,
  phaseLabel,
  copyLabel,
  designLabel,
  titleErrorMessage,
  itemTypeErrorMessage,
  onChange,
  onCancel,
  onSubmit,
}: ApprovalFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof ApprovalFormValue, boolean>>>({});
  const titleError = value.title.trim() ? '' : titleErrorMessage;
  const itemTypeError = value.itemType.trim() ? '' : itemTypeErrorMessage;
  const handleBlur = (field: keyof ApprovalFormValue) => {
    setTouched(current => ({ ...current, [field]: true }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched({ title: true, itemType: true, description: true });

    if (titleError || itemTypeError) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="ui-form-shell grid grid-cols-1 gap-4 rounded-3xl p-5 lg:grid-cols-[1fr,220px]">
        <Field data-invalid={touched.title && titleError ? true : undefined}>
          <FieldLabel htmlFor="approval-title">{titleLabel}</FieldLabel>
          <Input
            id="approval-title"
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
        <Field data-invalid={touched.itemType && itemTypeError ? true : undefined}>
          <FieldLabel htmlFor="approval-item-type">{categoryLabel}</FieldLabel>
          <Select
            value={value.itemType}
            onValueChange={nextValue => {
              onChange('itemType', nextValue);
              setTouched(current => ({ ...current, itemType: true }));
            }}
          >
            <SelectTrigger
              id="approval-item-type"
              className="ui-form-field h-12 w-full rounded-2xl px-4"
              aria-invalid={touched.itemType && itemTypeError ? true : undefined}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="deliverable">{deliverableLabel}</SelectItem>
                <SelectItem value="change-request">{changeRequestLabel}</SelectItem>
                <SelectItem value="phase">{phaseLabel}</SelectItem>
                <SelectItem value="copy">{copyLabel}</SelectItem>
                <SelectItem value="design">{designLabel}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{touched.itemType ? itemTypeError : ''}</FieldError>
        </Field>
        <Field className="lg:col-span-2">
          <FieldLabel htmlFor="approval-description">{descriptionLabel}</FieldLabel>
          <Textarea
            id="approval-description"
            rows={3}
            value={value.description}
            onChange={e => onChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
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
