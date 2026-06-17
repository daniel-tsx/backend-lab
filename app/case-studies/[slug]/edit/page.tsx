import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { CaseStudyForm } from '@/components/forms/case-study-form';
import { getCaseStudyBySlug } from '@/db/queries';

import { updateCaseStudyAction } from '../../actions';

export const metadata = { title: 'Edit case study' };

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);
  if (!caseStudy) notFound();

  async function action(values: Parameters<typeof updateCaseStudyAction>[1]) {
    'use server';
    return updateCaseStudyAction(caseStudy!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/case-studies/${slug}`} backLabel="Back to case" title={`Edit: ${caseStudy.title}`} />
      <CaseStudyForm
        caseStudy={caseStudy}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/case-studies/${slug}`}
      />
    </div>
  );
}
