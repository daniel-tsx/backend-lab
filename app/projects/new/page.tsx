import { PageHeader } from '@/components/common/page-header';
import { ProjectForm } from '@/components/forms/project-form';
import { getAllConcepts, listCaseStudies, listDecisionGuides } from '@/db/queries';

import { createProjectAction } from '../actions';

export const metadata = { title: 'New project' };

export default async function NewProjectPage() {
  const [concepts, guides, cases] = await Promise.all([
    getAllConcepts(),
    listDecisionGuides(),
    listCaseStudies(),
  ]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/projects" backLabel="Projects" title="New project" />
      <ProjectForm
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        guideOptions={guides.map((g) => ({ value: g.id, label: g.title }))}
        caseStudyOptions={cases.map((c) => ({ value: c.id, label: c.title }))}
        action={createProjectAction}
        submitLabel="Create project"
        cancelHref="/projects"
      />
    </div>
  );
}
