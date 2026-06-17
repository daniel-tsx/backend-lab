'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  SelectField,
  TextareaField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import {
  reviewConfidenceOptions,
  reviewDifficultyOptions,
  reviewStatusOptions,
  type Option,
} from '@/components/forms/options';
import { reviewCardSchema, type ReviewCardInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { ReviewCard } from '@/types';

const NONE: Option = { value: '', label: '— None —' };

export function reviewCardToFormValues(card?: ReviewCard): ReviewCardInput {
  return {
    relatedConceptId: card?.relatedConceptId ?? '',
    relatedLessonId: card?.relatedLessonId ?? '',
    question: card?.question ?? '',
    answer: card?.answer ?? '',
    difficulty: card?.difficulty ?? 'medium',
    confidence: card?.confidence ?? 'low',
    status: card?.status ?? 'active',
    note: card?.note ?? '',
  };
}

export function ReviewCardForm({
  card,
  conceptOptions,
  lessonOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  card?: ReviewCard;
  conceptOptions: Option[];
  lessonOptions: Option[];
  action: (values: ReviewCardInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<ReviewCardInput>
      schema={reviewCardSchema}
      defaultValues={reviewCardToFormValues(card)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Review card saved"
    >
      <SectionCard title="Review card">
        <div className="space-y-5">
          <TextareaField name="question" label="Question" rows={3} required />
          <TextareaField name="answer" label="Answer" rows={5} />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField name="difficulty" label="Difficulty" options={reviewDifficultyOptions} />
            <SelectField name="confidence" label="Confidence" options={reviewConfidenceOptions} />
            <SelectField name="status" label="Status" options={reviewStatusOptions} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField name="relatedConceptId" label="Concept" options={[NONE, ...conceptOptions]} />
            <SelectField name="relatedLessonId" label="Lesson" options={[NONE, ...lessonOptions]} />
          </div>
          <TextareaField name="note" label="Note" rows={2} />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
