import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { ProjectForm } from '@/components/forms/project-form';
import {
  getAllConcepts,
  getProjectById,
  listCaseStudies,
  listDecisionGuides,
} from '@/db/queries';

import { updateProjectAction } from '../../actions';

export const metadata = { title: 'Edit project' };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, concepts, guides, cases] = await Promise.all([
    getProjectById(id),
    getAllConcepts(),
    listDecisionGuides(),
    listCaseStudies(),
  ]);
  if (!project) notFound();

  async function action(values: Parameters<typeof updateProjectAction>[1]) {
    'use server';
    return updateProjectAction(id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/projects/${id}`} backLabel="Back to project" title={`Edit: ${project.projectName}`} />
      <ProjectForm
        project={project}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        guideOptions={guides.map((g) => ({ value: g.id, label: g.title }))}
        caseStudyOptions={cases.map((c) => ({ value: c.id, label: c.title }))}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/projects/${id}`}
      />
    </div>
  );
}
