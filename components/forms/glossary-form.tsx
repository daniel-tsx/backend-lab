'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MultiSelectField,
  SelectField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import { conceptCategoryOptions, type Option } from '@/components/forms/options';
import { glossaryTermSchema, type GlossaryTermInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { GlossaryTerm } from '@/types';

export function glossaryToFormValues(term?: GlossaryTerm): GlossaryTermInput {
  return {
    term: term?.term ?? '',
    definition: term?.definition ?? '',
    category: term?.category ?? 'other',
    example: term?.example ?? '',
    commonConfusion: term?.commonConfusion ?? '',
    relatedConceptIds: term?.relatedConceptIds ?? [],
  };
}

export function GlossaryForm({
  term,
  conceptOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  term?: GlossaryTerm;
  conceptOptions: Option[];
  action: (values: GlossaryTermInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<GlossaryTermInput>
      schema={glossaryTermSchema}
      defaultValues={glossaryToFormValues(term)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Term saved"
    >
      <SectionCard title="Glossary term">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="term" label="Term" required />
            <SelectField name="category" label="Category" options={conceptCategoryOptions} />
          </div>
          <TextareaField name="definition" label="Definition" rows={3} />
          <TextareaField name="example" label="Example" rows={2} />
          <TextareaField name="commonConfusion" label="Common confusion" rows={2} />
          <MultiSelectField name="relatedConceptIds" label="Related concepts" options={conceptOptions} />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
