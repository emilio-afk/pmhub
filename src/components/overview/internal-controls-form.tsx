import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ProjectMetaFormValue {
  health: string;
  budgetHours: string;
  usedHours: string;
  budgetAmount: string;
  spentAmount: string;
  scopeSummary: string;
}

interface InternalControlsFormProps {
  value: ProjectMetaFormValue;
  canManage: boolean;
  projectHealthLabel: string;
  onTrackLabel: string;
  atRiskLabel: string;
  criticalLabel: string;
  budgetHoursLabel: string;
  usedHoursLabel: string;
  budgetAmountLabel: string;
  spentAmountLabel: string;
  scopeControlLabel: string;
  scopePlaceholder: string;
  saveLabel: string;
  hoursConsumedLabel: string;
  hoursConsumedValue: string;
  hoursConsumedPercent: string;
  hoursConsumedProgress: number;
  budgetConsumedLabel: string;
  budgetConsumedValue: string;
  budgetConsumedPercent: string;
  budgetConsumedProgress: number;
  scopeChangesLabel: string;
  scopeChangesValue: string;
  scopeSummaryValue: string;
  invalidNumberMessage: string;
  nonNegativeNumberMessage: string;
  onChange: (field: keyof ProjectMetaFormValue, nextValue: string) => void;
  onHealthChange: (nextValue: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function InternalControlsForm({
  value,
  canManage,
  projectHealthLabel,
  onTrackLabel,
  atRiskLabel,
  criticalLabel,
  budgetHoursLabel,
  usedHoursLabel,
  budgetAmountLabel,
  spentAmountLabel,
  scopeControlLabel,
  scopePlaceholder,
  saveLabel,
  hoursConsumedLabel,
  hoursConsumedValue,
  hoursConsumedPercent,
  hoursConsumedProgress,
  budgetConsumedLabel,
  budgetConsumedValue,
  budgetConsumedPercent,
  budgetConsumedProgress,
  scopeChangesLabel,
  scopeChangesValue,
  scopeSummaryValue,
  invalidNumberMessage,
  nonNegativeNumberMessage,
  onChange,
  onHealthChange,
  onSubmit,
}: InternalControlsFormProps) {
  const [touched, setTouched] = React.useState<Partial<Record<keyof ProjectMetaFormValue, boolean>>>({});
  const numericFields: Array<keyof ProjectMetaFormValue> = ['budgetHours', 'usedHours', 'budgetAmount', 'spentAmount'];
  const getNumericError = (field: keyof ProjectMetaFormValue) => {
    const rawValue = value[field];
    if (typeof rawValue !== 'string' || rawValue.trim() === '') return '';

    const parsedValue = Number(rawValue);
    if (!Number.isFinite(parsedValue)) return invalidNumberMessage;
    if (parsedValue < 0) return nonNegativeNumberMessage;

    return '';
  };
  const handleBlur = (field: keyof ProjectMetaFormValue) => {
    setTouched(current => ({ ...current, [field]: true }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const nextTouched = numericFields.reduce<Partial<Record<keyof ProjectMetaFormValue, boolean>>>(
      (accumulator, field) => ({ ...accumulator, [field]: true }),
      { health: true, scopeSummary: true },
    );
    setTouched(nextTouched);

    if (numericFields.some(field => getNumericError(field))) {
      e.preventDefault();
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-4">
        <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="project-health">{projectHealthLabel}</FieldLabel>
            <Select disabled={!canManage} value={value.health} onValueChange={onHealthChange}>
              <SelectTrigger id="project-health" className="h-12 w-full rounded-2xl bg-white px-4 disabled:bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="green">{onTrackLabel}</SelectItem>
                  <SelectItem value="yellow">{atRiskLabel}</SelectItem>
                  <SelectItem value="red">{criticalLabel}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="budget-hours">{budgetHoursLabel}</FieldLabel>
            <Input
              id="budget-hours"
              type="number"
              inputMode="decimal"
              disabled={!canManage}
              value={value.budgetHours}
              onChange={e => onChange('budgetHours', e.target.value)}
              onBlur={() => handleBlur('budgetHours')}
              aria-invalid={touched.budgetHours && getNumericError('budgetHours') ? true : undefined}
              className="h-12 rounded-2xl bg-white px-4 disabled:bg-gray-50"
            />
            <FieldError>{touched.budgetHours ? getNumericError('budgetHours') : ''}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="used-hours">{usedHoursLabel}</FieldLabel>
            <Input
              id="used-hours"
              type="number"
              inputMode="decimal"
              disabled={!canManage}
              value={value.usedHours}
              onChange={e => onChange('usedHours', e.target.value)}
              onBlur={() => handleBlur('usedHours')}
              aria-invalid={touched.usedHours && getNumericError('usedHours') ? true : undefined}
              className="h-12 rounded-2xl bg-white px-4 disabled:bg-gray-50"
            />
            <FieldError>{touched.usedHours ? getNumericError('usedHours') : ''}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="budget-amount">{budgetAmountLabel}</FieldLabel>
            <Input
              id="budget-amount"
              type="number"
              inputMode="decimal"
              disabled={!canManage}
              value={value.budgetAmount}
              onChange={e => onChange('budgetAmount', e.target.value)}
              onBlur={() => handleBlur('budgetAmount')}
              aria-invalid={touched.budgetAmount && getNumericError('budgetAmount') ? true : undefined}
              className="h-12 rounded-2xl bg-white px-4 disabled:bg-gray-50"
            />
            <FieldError>{touched.budgetAmount ? getNumericError('budgetAmount') : ''}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="spent-amount">{spentAmountLabel}</FieldLabel>
            <Input
              id="spent-amount"
              type="number"
              inputMode="decimal"
              disabled={!canManage}
              value={value.spentAmount}
              onChange={e => onChange('spentAmount', e.target.value)}
              onBlur={() => handleBlur('spentAmount')}
              aria-invalid={touched.spentAmount && getNumericError('spentAmount') ? true : undefined}
              className="h-12 rounded-2xl bg-white px-4 disabled:bg-gray-50"
            />
            <FieldError>{touched.spentAmount ? getNumericError('spentAmount') : ''}</FieldError>
          </Field>
        </FieldGroup>
        <Field>
          <FieldLabel htmlFor="scope-summary">{scopeControlLabel}</FieldLabel>
          <Textarea
            id="scope-summary"
            rows={5}
            disabled={!canManage}
            value={value.scopeSummary}
            onChange={e => onChange('scopeSummary', e.target.value)}
            onBlur={() => handleBlur('scopeSummary')}
            placeholder={scopePlaceholder}
            className="resize-none rounded-2xl bg-white px-4 py-3 disabled:bg-gray-50"
          />
        </Field>
        {canManage && (
          <div className="flex justify-end">
            <Button type="submit" className="rounded-xl px-5 py-3 font-semibold">
              {saveLabel}
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{hoursConsumedLabel}</p>
          <p className="text-3xl font-bold text-gray-900">{hoursConsumedValue}</p>
          <Progress value={hoursConsumedProgress} className="mt-4 h-2 rounded-full bg-gray-200 [&_[data-slot=progress-indicator]]:bg-gray-900" />
          <p className="mt-2 text-sm text-gray-500">{hoursConsumedPercent}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{budgetConsumedLabel}</p>
          <p className="text-3xl font-bold text-gray-900">{budgetConsumedValue}</p>
          <Progress value={budgetConsumedProgress} className="mt-4 h-2 rounded-full bg-gray-200 [&_[data-slot=progress-indicator]]:bg-gray-900" />
          <p className="mt-2 text-sm text-gray-500">{budgetConsumedPercent}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{scopeChangesLabel}</p>
          <p className="text-3xl font-bold text-gray-900">{scopeChangesValue}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-500">{scopeSummaryValue}</p>
        </div>
      </div>
    </form>
  );
}
