'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MarkdownField,
  NumberField,
  SelectField,
  StringListField,
  TextField,
  TextareaField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import { lessonStatusOptions, type Option } from '@/components/forms/options';
import { lessonSchema, type LessonInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Lesson } from '@/types';

export function lessonToFormValues(lesson?: Lesson, moduleId = ''): LessonInput {
  return {
    moduleId: lesson?.moduleId ?? moduleId,
    title: lesson?.title ?? '',
    order: lesson?.order ?? 0,
    summary: lesson?.summary ?? '',
    body: lesson?.body ?? '',
    keyTakeaways: lesson?.keyTakeaways ?? [],
    questionsToAnswer: lesson?.questionsToAnswer ?? [],
    commonMisconceptions: lesson?.commonMisconceptions ?? [],
    practicalChecklist: lesson?.practicalChecklist ?? [],
    ownWords: lesson?.ownWords ?? '',
    projectApplication: lesson?.projectApplication ?? '',
    status: lesson?.status ?? 'not-started',
  };
}

export function LessonForm({
  lesson,
  moduleId,
  moduleOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  lesson?: Lesson;
  moduleId?: string;
  moduleOptions: Option[];
  action: (values: LessonInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<LessonInput>
      schema={lessonSchema}
      defaultValues={lessonToFormValues(lesson, moduleId)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Lesson saved"
    >
      <SectionCard title="Lesson">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField name="moduleId" label="Module" options={moduleOptions} required />
            <NumberField name="order" label="Order" min={0} />
            <SelectField name="status" label="Status" options={lessonStatusOptions} />
          </div>
          <TextareaField name="summary" label="Summary" rows={2} />
          <MarkdownField name="body" label="Body" rows={14} />
        </div>
      </SectionCard>

      <SectionCard title="Study aids">
        <div className="space-y-5">
          <StringListField name="keyTakeaways" label="Key takeaways" />
          <StringListField name="questionsToAnswer" label="Questions to answer" />
          <StringListField name="commonMisconceptions" label="Common misconceptions" />
          <StringListField name="practicalChecklist" label="Practical checklist" />
        </div>
      </SectionCard>

      <SectionCard title="Make it yours">
        <div className="space-y-5">
          <MarkdownField name="ownWords" label="Explain in my own words" rows={4} />
          <MarkdownField name="projectApplication" label="How this applies to my projects" rows={4} />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
