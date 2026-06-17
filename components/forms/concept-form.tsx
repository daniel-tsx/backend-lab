'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MarkdownField,
  MultiSelectField,
  SelectField,
  TagsField,
  TextField,
  TextareaField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import {
  conceptCategoryOptions,
  conceptStatusOptions,
  difficultyOptions,
  importanceOptions,
  type Option,
} from '@/components/forms/options';
import { conceptSchema, type ConceptInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Concept } from '@/types';

export function conceptToFormValues(concept?: Concept): ConceptInput {
  return {
    title: concept?.title ?? '',
    summary: concept?.summary ?? '',
    category: concept?.category ?? 'api-design',
    difficulty: concept?.difficulty ?? 'beginner',
    status: concept?.status ?? 'not-started',
    importance: concept?.importance ?? 'medium',
    mentalModel: concept?.mentalModel ?? '',
    howItWorks: concept?.howItWorks ?? '',
    whenToUse: concept?.whenToUse ?? '',
    whenNotToUse: concept?.whenNotToUse ?? '',
    commonMistakes: concept?.commonMistakes ?? '',
    tradeoffs: concept?.tradeoffs ?? '',
    realWorldExamples: concept?.realWorldExamples ?? '',
    relatedConceptIds: concept?.relatedConceptIds ?? [],
    prerequisiteConceptIds: concept?.prerequisiteConceptIds ?? [],
    tags: concept?.tags ?? [],
  };
}

export function ConceptForm({
  concept,
  conceptOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  concept?: Concept;
  conceptOptions: Option[];
  action: (values: ConceptInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<ConceptInput>
      schema={conceptSchema}
      defaultValues={conceptToFormValues(concept)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Concept saved"
    >
      <SectionCard title="Basics">
        <div className="space-y-5">
          <TextField name="title" label="Title" placeholder="e.g. Rate limiting" required />
          <TextareaField
            name="summary"
            label="Summary"
            placeholder="One or two sentences capturing the essence."
            rows={2}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField name="category" label="Category" options={conceptCategoryOptions} />
            <SelectField name="difficulty" label="Difficulty" options={difficultyOptions} />
            <SelectField name="status" label="Status" options={conceptStatusOptions} />
            <SelectField name="importance" label="Importance" options={importanceOptions} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Understanding">
        <div className="space-y-5">
          <MarkdownField name="mentalModel" label="Mental model" rows={5} />
          <MarkdownField name="howItWorks" label="How it works" rows={8} />
        </div>
      </SectionCard>

      <SectionCard title="Judgment">
        <div className="space-y-5">
          <MarkdownField name="whenToUse" label="When to use" rows={5} />
          <MarkdownField name="whenNotToUse" label="When NOT to use" rows={5} />
          <MarkdownField name="tradeoffs" label="Trade-offs" rows={5} />
          <MarkdownField name="commonMistakes" label="Common mistakes" rows={5} />
          <MarkdownField name="realWorldExamples" label="Real-world examples" rows={4} />
        </div>
      </SectionCard>

      <SectionCard title="Connections">
        <div className="space-y-5">
          <MultiSelectField
            name="prerequisiteConceptIds"
            label="Prerequisites"
            options={conceptOptions}
            placeholder="Concepts to learn first"
          />
          <MultiSelectField
            name="relatedConceptIds"
            label="Related concepts"
            options={conceptOptions}
            placeholder="Concepts this connects to"
          />
          <TagsField name="tags" label="Tags" />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
