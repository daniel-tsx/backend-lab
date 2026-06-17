'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MarkdownField,
  MultiSelectField,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import {
  moduleStatusOptions,
  moduleTypeOptions,
  type Option,
} from '@/components/forms/options';
import { moduleSchema, type ModuleInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Module } from '@/types';

export function moduleToFormValues(
  module?: Module,
  conceptIds: string[] = [],
): ModuleInput {
  return {
    title: module?.title ?? '',
    description: module?.description ?? '',
    moduleType: module?.moduleType ?? 'fundamentals',
    order: module?.order ?? 0,
    estimatedHours: module?.estimatedHours ?? 0,
    status: module?.status ?? 'not-started',
    outcome: module?.outcome ?? '',
    notes: module?.notes ?? '',
    conceptIds,
  };
}

export function ModuleForm({
  module,
  conceptIds,
  conceptOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  module?: Module;
  conceptIds?: string[];
  conceptOptions: Option[];
  action: (values: ModuleInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<ModuleInput>
      schema={moduleSchema}
      defaultValues={moduleToFormValues(module, conceptIds)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Path saved"
    >
      <SectionCard title="Learning path">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <TextareaField name="description" label="Description" rows={3} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField name="moduleType" label="Type" options={moduleTypeOptions} />
            <SelectField name="status" label="Status" options={moduleStatusOptions} />
            <NumberField name="order" label="Order" min={0} />
            <NumberField name="estimatedHours" label="Est. hours" min={0} />
          </div>
          <MarkdownField name="outcome" label="Outcome" rows={3} />
          <MarkdownField name="notes" label="Notes" rows={3} />
          <MultiSelectField
            name="conceptIds"
            label="Concepts in this path"
            options={conceptOptions}
            placeholder="Add concepts"
          />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
