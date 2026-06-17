'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  SelectField,
  TagsField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import {
  snippetCategoryOptions,
  snippetLanguageOptions,
  type Option,
} from '@/components/forms/options';
import { snippetSchema, type SnippetInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Snippet } from '@/types';

const NONE: Option = { value: '', label: '— None —' };

export function snippetToFormValues(snippet?: Snippet): SnippetInput {
  return {
    title: snippet?.title ?? '',
    language: snippet?.language ?? 'typescript',
    category: snippet?.category ?? 'api',
    code: snippet?.code ?? '',
    explanation: snippet?.explanation ?? '',
    useCase: snippet?.useCase ?? '',
    relatedConceptId: snippet?.relatedConceptId ?? '',
    relatedLabId: snippet?.relatedLabId ?? '',
    tags: snippet?.tags ?? [],
  };
}

export function SnippetForm({
  snippet,
  conceptOptions,
  labOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  snippet?: Snippet;
  conceptOptions: Option[];
  labOptions: Option[];
  action: (values: SnippetInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<SnippetInput>
      schema={snippetSchema}
      defaultValues={snippetToFormValues(snippet)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Snippet saved"
    >
      <SectionCard title="Snippet">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField name="language" label="Language" options={snippetLanguageOptions} />
            <SelectField name="category" label="Category" options={snippetCategoryOptions} />
            <SelectField name="relatedConceptId" label="Concept" options={[NONE, ...conceptOptions]} />
            <SelectField name="relatedLabId" label="Lab" options={[NONE, ...labOptions]} />
          </div>
          <TextareaField name="code" label="Code" rows={12} mono required />
          <TextareaField name="explanation" label="Explanation" rows={3} />
          <TextField name="useCase" label="Use case" />
          <TagsField name="tags" label="Tags" />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
