'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  DateField,
  MultiSelectField,
  NumberField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import type { Option } from '@/components/forms/options';
import { learningLogSchema, type LearningLogInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { LearningLog } from '@/types';

export function learningLogToFormValues(log?: LearningLog): LearningLogInput {
  return {
    date: log?.date ?? new Date(),
    title: log?.title ?? '',
    summary: log?.summary ?? '',
    conceptIds: log?.conceptIds ?? [],
    labIds: log?.labIds ?? [],
    timeSpentMinutes: log?.timeSpentMinutes ?? 0,
    confidenceChange: log?.confidenceChange ?? 0,
    blockers: log?.blockers ?? '',
    notes: log?.notes ?? '',
    nextStep: log?.nextStep ?? '',
  };
}

export function LearningLogForm({
  log,
  conceptOptions,
  labOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  log?: LearningLog;
  conceptOptions: Option[];
  labOptions: Option[];
  action: (values: LearningLogInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<LearningLogInput>
      schema={learningLogSchema}
      defaultValues={learningLogToFormValues(log)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Log saved"
    >
      <SectionCard title="What I did">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <DateField name="date" label="Date" />
            <NumberField name="timeSpentMinutes" label="Time spent (min)" min={0} />
            <NumberField name="confidenceChange" label="Confidence change (-10…10)" min={-10} max={10} />
          </div>
          <TextField name="title" label="Title" required />
          <TextareaField name="summary" label="Summary" rows={3} />
          <MultiSelectField
            name="conceptIds"
            label="Concepts studied"
            options={conceptOptions}
            placeholder="Link concepts…"
          />
          <MultiSelectField
            name="labIds"
            label="Labs completed"
            options={labOptions}
            placeholder="Link labs…"
          />
        </div>
      </SectionCard>

      <SectionCard title="Reflection">
        <div className="space-y-5">
          <TextareaField name="blockers" label="Blockers" rows={2} />
          <TextareaField name="notes" label="Notes" rows={3} />
          <TextField name="nextStep" label="Next step" />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
