import { PageHeader } from '@/components/common/page-header';
import { DiagramForm } from '@/components/forms/diagram-form';
import { getAllConcepts, listCaseStudies, listProjects } from '@/db/queries';
import { diagramTemplates } from '@/lib/diagram-templates';

import { createDiagramAction } from '../actions';

export const metadata = { title: 'New diagram' };

export default async function NewDiagramPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const [concepts, cases, projects] = await Promise.all([
    getAllConcepts(),
    listCaseStudies(),
    listProjects(),
  ]);
  const tpl = diagramTemplates.find((t) => t.key === template);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader backHref="/diagrams" backLabel="Diagrams" title="New diagram" />
      <DiagramForm
        preset={tpl ? { diagramType: tpl.diagramType, mermaidCode: tpl.code } : undefined}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        caseStudyOptions={cases.map((c) => ({ value: c.id, label: c.title }))}
        projectOptions={projects.map((p) => ({ value: p.id, label: p.projectName }))}
        action={createDiagramAction}
        submitLabel="Create diagram"
        cancelHref="/diagrams"
      />
    </div>
  );
}
