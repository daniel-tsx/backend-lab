'use client';

import { EntityForm } from '@/components/forms/entity-form';
import {
  MermaidField,
  SelectField,
  TextareaField,
  TextField,
} from '@/components/forms/form-fields';
import { SectionCard } from '@/components/common/section-card';
import { diagramTypeOptions, type Option } from '@/components/forms/options';
import { diagramSchema, type DiagramInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/action-result';
import type { Diagram, DiagramType } from '@/types';

const NONE: Option = { value: '', label: '— None —' };

export function diagramToFormValues(
  diagram?: Diagram,
  preset?: { diagramType?: DiagramType; mermaidCode?: string },
): DiagramInput {
  return {
    title: diagram?.title ?? '',
    description: diagram?.description ?? '',
    diagramType: diagram?.diagramType ?? preset?.diagramType ?? 'custom',
    relatedConceptId: diagram?.relatedConceptId ?? '',
    relatedCaseStudyId: diagram?.relatedCaseStudyId ?? '',
    relatedProjectId: diagram?.relatedProjectId ?? '',
    mermaidCode: diagram?.mermaidCode ?? preset?.mermaidCode ?? '',
    notes: diagram?.notes ?? '',
  };
}

export function DiagramForm({
  diagram,
  preset,
  conceptOptions,
  caseStudyOptions,
  projectOptions,
  action,
  submitLabel,
  cancelHref,
}: {
  diagram?: Diagram;
  preset?: { diagramType?: DiagramType; mermaidCode?: string };
  conceptOptions: Option[];
  caseStudyOptions: Option[];
  projectOptions: Option[];
  action: (values: DiagramInput) => Promise<ActionResult>;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <EntityForm<DiagramInput>
      schema={diagramSchema}
      defaultValues={diagramToFormValues(diagram, preset)}
      action={action}
      submitLabel={submitLabel}
      cancelHref={cancelHref}
      successMessage="Diagram saved"
    >
      <SectionCard title="Diagram">
        <div className="space-y-5">
          <TextField name="title" label="Title" required />
          <TextareaField name="description" label="Description" rows={2} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField name="diagramType" label="Type" options={diagramTypeOptions} />
            <SelectField name="relatedConceptId" label="Concept" options={[NONE, ...conceptOptions]} />
            <SelectField name="relatedCaseStudyId" label="Case study" options={[NONE, ...caseStudyOptions]} />
            <SelectField name="relatedProjectId" label="Project" options={[NONE, ...projectOptions]} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Mermaid">
        <MermaidField name="mermaidCode" required />
      </SectionCard>

      <SectionCard title="Notes">
        <TextareaField name="notes" rows={3} />
      </SectionCard>
    </EntityForm>
  );
}
