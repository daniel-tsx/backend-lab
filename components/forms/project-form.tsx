'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MarkdownField,
  MultiSelectField,
  SelectField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import {
  projectStatusOptions,
  projectTypeOptions,
  type Option,
} from '@/components/forms/options';
import { projectSchema, type ProjectInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Project } from '@/types';

const NONE: Option = { value: '', label: '— None —' };

export function projectToFormValues(project?: Project): ProjectInput {
  return {
    projectName: project?.projectName ?? '',
    projectType: project?.projectType ?? 'other',
    status: project?.status ?? 'active',
    description: project?.description ?? '',
    currentArchitecture: project?.currentArchitecture ?? '',
    backendRisks: project?.backendRisks ?? '',
    conceptsUsed: project?.conceptsUsed ?? [],
    conceptsToLearn: project?.conceptsToLearn ?? [],
    architectureNotes: project?.architectureNotes ?? '',
    improvementIdeas: project?.improvementIdeas ?? '',
    nextBackendAction: project?.nextBackendAction ?? '',
    relatedDecisionGuideIds: project?.relatedDecisionGuideIds ?? [],
    relatedCaseStudyId: project?.relatedCaseStudyId ?? '',
  };
}

export function ProjectForm({
  project,
  conceptOptions,
  guideOptions,
  caseStudyOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  project?: Project;
  conceptOptions: Option[];
  guideOptions: Option[];
  caseStudyOptions: Option[];
  action: (values: ProjectInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<ProjectInput>
      schema={projectSchema}
      defaultValues={projectToFormValues(project)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Project saved"
    >
      <SectionCard title="Project">
        <div className="space-y-5">
          <TextField name="projectName" label="Project name" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField name="projectType" label="Type" options={projectTypeOptions} />
            <SelectField name="status" label="Status" options={projectStatusOptions} />
          </div>
          <TextareaField name="description" label="Description" rows={2} />
        </div>
      </SectionCard>

      <SectionCard title="Backend reality">
        <div className="space-y-5">
          <MarkdownField name="currentArchitecture" label="Current architecture" rows={4} />
          <MarkdownField name="backendRisks" label="Backend risks" rows={4} />
          <MarkdownField name="architectureNotes" label="Architecture notes" rows={4} />
          <MarkdownField name="improvementIdeas" label="Improvement ideas" rows={4} />
          <TextField name="nextBackendAction" label="Next backend action" />
        </div>
      </SectionCard>

      <SectionCard title="Connections">
        <div className="space-y-5">
          <MultiSelectField name="conceptsUsed" label="Concepts already used" options={conceptOptions} />
          <MultiSelectField name="conceptsToLearn" label="Concepts worth learning" options={conceptOptions} />
          <MultiSelectField name="relatedDecisionGuideIds" label="Related decision guides" options={guideOptions} />
          <SelectField name="relatedCaseStudyId" label="Related case study" options={[NONE, ...caseStudyOptions]} />
        </div>
      </SectionCard>
    </EntityForm>
  );
}
