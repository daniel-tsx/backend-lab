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
import {
  difficultyOptions,
  labStatusOptions,
  labTypeOptions,
  type Option,
} from '@/components/forms/options';
import { labSchema, type LabInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Lab } from '@/types';

const NONE: Option = { value: '', label: '— None —' };

export function labToFormValues(lab?: Lab): LabInput {
  return {
    title: lab?.title ?? '',
    relatedConceptId: lab?.relatedConceptId ?? '',
    moduleId: lab?.moduleId ?? '',
    difficulty: lab?.difficulty ?? 'intermediate',
    labType: lab?.labType ?? 'implement',
    status: lab?.status ?? 'not-started',
    description: lab?.description ?? '',
    scenario: lab?.scenario ?? '',
    requirements: lab?.requirements ?? '',
    starterCode: lab?.starterCode ?? '',
    expectedSolution: lab?.expectedSolution ?? '',
    hints: lab?.hints ?? [],
    successCriteria: lab?.successCriteria ?? [],
    timeSpentMinutes: lab?.timeSpentMinutes ?? 0,
    confidenceBefore: lab?.confidenceBefore ?? null,
    confidenceAfter: lab?.confidenceAfter ?? null,
    notes: lab?.notes ?? '',
    notebook: lab?.notebook ?? '',
    thingsGotWrong: lab?.thingsGotWrong ?? '',
    whatLearned: lab?.whatLearned ?? '',
  };
}

export function LabForm({
  lab,
  conceptOptions,
  moduleOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  lab?: Lab;
  conceptOptions: Option[];
  moduleOptions: Option[];
  action: (values: LabInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<LabInput>
      schema={labSchema}
      defaultValues={labToFormValues(lab)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Lab saved"
    >
      <SectionCard title="Lab">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField name="labType" label="Type" options={labTypeOptions} />
            <SelectField name="difficulty" label="Difficulty" options={difficultyOptions} />
            <SelectField name="status" label="Status" options={labStatusOptions} />
            <SelectField name="relatedConceptId" label="Related concept" options={[NONE, ...conceptOptions]} />
            <SelectField name="moduleId" label="Module" options={[NONE, ...moduleOptions]} />
            <NumberField name="timeSpentMinutes" label="Time spent (min)" min={0} />
          </div>
          <TextareaField name="description" label="Description" rows={2} />
          <TextareaField name="scenario" label="Scenario" rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="The exercise">
        <div className="space-y-5">
          <MarkdownField name="requirements" label="Requirements" rows={6} />
          <MarkdownField name="starterCode" label="Starter code" rows={6} />
          <StringListField name="hints" label="Hints" />
          <StringListField name="successCriteria" label="Success criteria" />
          <MarkdownField name="expectedSolution" label="Expected solution" rows={8} />
        </div>
      </SectionCard>

      <SectionCard title="My lab notebook">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField name="confidenceBefore" label="Confidence before (1–10)" min={1} max={10} nullable />
            <NumberField name="confidenceAfter" label="Confidence after (1–10)" min={1} max={10} nullable />
          </div>
          <MarkdownField name="notebook" label="My solution / working notes" rows={6} />
          <MarkdownField name="thingsGotWrong" label="Things I got wrong" rows={3} />
          <MarkdownField name="whatLearned" label="What I learned" rows={3} />
          <TextareaField name="notes" label="Other notes" rows={2} />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
