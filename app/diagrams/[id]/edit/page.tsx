import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { DiagramForm } from '@/components/forms/diagram-form';
import { getAllConcepts, getDiagramById, listCaseStudies, listProjects } from '@/db/queries';

import { updateDiagramAction } from '../../actions';

export const metadata = { title: 'Edit diagram' };

export default async function EditDiagramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [diagram, concepts, cases, projects] = await Promise.all([
    getDiagramById(id),
    getAllConcepts(),
    listCaseStudies(),
    listProjects(),
  ]);
  if (!diagram) notFound();

  async function action(values: Parameters<typeof updateDiagramAction>[1]) {
    'use server';
    return updateDiagramAction(id, values);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader backHref={`/diagrams/${id}`} backLabel="Back to diagram" title={`Edit: ${diagram.title}`} />
      <DiagramForm
        diagram={diagram}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        caseStudyOptions={cases.map((c) => ({ value: c.id, label: c.title }))}
        projectOptions={projects.map((p) => ({ value: p.id, label: p.projectName }))}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/diagrams/${id}`}
      />
    </div>
  );
}
