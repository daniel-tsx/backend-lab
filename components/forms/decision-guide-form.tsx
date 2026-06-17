'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MarkdownField,
  MultiSelectField,
  SelectField,
  StringListField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import { Button } from '@/components/ui/button';
import { decisionCategoryOptions, type Option } from '@/components/forms/options';
import { decisionGuideSchema, type DecisionGuideInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { DecisionGuide } from '@/types';

export function decisionGuideToFormValues(guide?: DecisionGuide): DecisionGuideInput {
  return {
    title: guide?.title ?? '',
    category: guide?.category ?? 'architecture',
    question: guide?.question ?? '',
    shortAnswer: guide?.shortAnswer ?? '',
    options: guide?.options ?? [],
    comparisonCriteria: guide?.comparisonCriteria ?? [],
    recommendationRules: guide?.recommendationRules ?? '',
    examples: guide?.examples ?? '',
    relatedConceptIds: guide?.relatedConceptIds ?? [],
    relatedLabIds: guide?.relatedLabIds ?? [],
  };
}

function OptionsField() {
  const { control } = useFormContext<DecisionGuideInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border border-border/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Option {index + 1}
            </span>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <TextField name={`options.${index}.name`} label="Name" />
            <TextareaField name={`options.${index}.description`} label="Description" rows={2} />
            <TextareaField name={`options.${index}.whenToChoose`} label="When to choose" rows={2} />
            <TextareaField name={`options.${index}.tradeoffs`} label="Trade-offs" rows={2} />
            <TextareaField name={`options.${index}.failureModes`} label="Failure modes" rows={2} />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() =>
          append({ name: '', description: '', whenToChoose: '', tradeoffs: '', failureModes: '' })
        }
      >
        <Plus className="size-4" />
        Add option
      </Button>
    </div>
  );
}

export function DecisionGuideForm({
  guide,
  conceptOptions,
  labOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  guide?: DecisionGuide;
  conceptOptions: Option[];
  labOptions: Option[];
  action: (values: DecisionGuideInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<DecisionGuideInput>
      schema={decisionGuideSchema}
      defaultValues={decisionGuideToFormValues(guide)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Guide saved"
    >
      <SectionCard title="The question">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <SelectField name="category" label="Category" options={decisionCategoryOptions} />
          <TextareaField name="question" label="Question" rows={2} />
          <TextareaField name="shortAnswer" label="Short answer" rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="Options">
        <OptionsField />
      </SectionCard>

      <SectionCard title="Guidance">
        <div className="space-y-5">
          <StringListField name="comparisonCriteria" label="Comparison criteria" />
          <MarkdownField name="recommendationRules" label="Recommendation rules" rows={5} />
          <MarkdownField name="examples" label="Examples (from my projects)" rows={4} />
          <MultiSelectField name="relatedConceptIds" label="Related concepts" options={conceptOptions} />
          <MultiSelectField name="relatedLabIds" label="Related labs" options={labOptions} />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
