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
  caseStudyDomainOptions,
  caseStudyStatusOptions,
  difficultyOptions,
} from '@/components/forms/options';
import { caseStudySchema, type CaseStudyInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { CaseStudy, CaseStudyReviewScores } from '@/types';

const emptyScores: CaseStudyReviewScores = {
  requirementsClarity: 0,
  dataModelQuality: 0,
  apiQuality: 0,
  scalability: 0,
  reliability: 0,
  security: 0,
  simplicity: 0,
  costAwareness: 0,
};

export function caseStudyToFormValues(caseStudy?: CaseStudy): CaseStudyInput {
  return {
    title: caseStudy?.title ?? '',
    domain: caseStudy?.domain ?? 'generic-saas',
    difficulty: caseStudy?.difficulty ?? 'intermediate',
    status: caseStudy?.status ?? 'not-started',
    problemStatement: caseStudy?.problemStatement ?? '',
    functionalRequirements: caseStudy?.functionalRequirements ?? [],
    nonFunctionalRequirements: caseStudy?.nonFunctionalRequirements ?? [],
    constraints: caseStudy?.constraints ?? [],
    trafficAssumptions: caseStudy?.trafficAssumptions ?? '',
    dataModel: caseStudy?.dataModel ?? '',
    apiDesign: caseStudy?.apiDesign ?? '',
    architecture: caseStudy?.architecture ?? '',
    scalingStrategy: caseStudy?.scalingStrategy ?? '',
    reliabilityStrategy: caseStudy?.reliabilityStrategy ?? '',
    securityStrategy: caseStudy?.securityStrategy ?? '',
    observabilityStrategy: caseStudy?.observabilityStrategy ?? '',
    costConsiderations: caseStudy?.costConsiderations ?? '',
    tradeoffs: caseStudy?.tradeoffs ?? '',
    finalNotes: caseStudy?.finalNotes ?? '',
    reviewScores: caseStudy?.reviewScores ?? emptyScores,
  };
}

const scoreFields: { name: keyof CaseStudyReviewScores; label: string }[] = [
  { name: 'requirementsClarity', label: 'Requirements clarity' },
  { name: 'dataModelQuality', label: 'Data model quality' },
  { name: 'apiQuality', label: 'API quality' },
  { name: 'scalability', label: 'Scalability' },
  { name: 'reliability', label: 'Reliability' },
  { name: 'security', label: 'Security' },
  { name: 'simplicity', label: 'Simplicity' },
  { name: 'costAwareness', label: 'Cost awareness' },
];

export function CaseStudyForm({
  caseStudy,
  action,
  submitLabel,
  cancelHref,
}: {
  caseStudy?: CaseStudy;
  action: (values: CaseStudyInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<CaseStudyInput>
      schema={caseStudySchema}
      defaultValues={caseStudyToFormValues(caseStudy)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Case study saved"
    >
      <SectionCard title="Overview">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField name="domain" label="Domain" options={caseStudyDomainOptions} />
            <SelectField name="difficulty" label="Difficulty" options={difficultyOptions} />
            <SelectField name="status" label="Status" options={caseStudyStatusOptions} />
          </div>
          <MarkdownField name="problemStatement" label="Problem statement" rows={4} />
        </div>
      </SectionCard>

      <SectionCard title="Requirements & constraints">
        <div className="space-y-5">
          <StringListField name="functionalRequirements" label="Functional requirements" />
          <StringListField name="nonFunctionalRequirements" label="Non-functional requirements" />
          <StringListField name="constraints" label="Constraints" />
          <TextareaField name="trafficAssumptions" label="Back-of-the-envelope / traffic assumptions" rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="Design">
        <div className="space-y-5">
          <MarkdownField name="dataModel" label="Data model" rows={6} />
          <MarkdownField name="apiDesign" label="API design" rows={6} />
          <MarkdownField name="architecture" label="Architecture & core flows" rows={6} />
        </div>
      </SectionCard>

      <SectionCard title="Strategies">
        <div className="space-y-5">
          <MarkdownField name="scalingStrategy" label="Scaling strategy" rows={4} />
          <MarkdownField name="reliabilityStrategy" label="Reliability strategy" rows={4} />
          <MarkdownField name="securityStrategy" label="Security strategy" rows={4} />
          <MarkdownField name="observabilityStrategy" label="Observability strategy" rows={4} />
          <MarkdownField name="costConsiderations" label="Cost considerations" rows={4} />
          <MarkdownField name="tradeoffs" label="Trade-offs" rows={4} />
          <MarkdownField name="finalNotes" label="Final review notes" rows={4} />
        </div>
      </SectionCard>

      <SectionCard title="Review score (0–5 each)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scoreFields.map((f) => (
            <NumberField key={f.name} name={`reviewScores.${f.name}`} label={f.label} min={0} max={5} />
          ))}
        </div>
      </SectionCard>
    </EntityForm>
  );
}
