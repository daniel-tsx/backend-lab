import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { DecisionGuideForm } from '@/components/forms/decision-guide-form';
import { getAllConcepts, getDecisionGuideBySlug, listLabs } from '@/db/queries';

import { updateDecisionGuideAction } from '../../actions';

export const metadata = { title: 'Edit decision guide' };

export default async function EditDecisionGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [guide, concepts, labs] = await Promise.all([
    getDecisionGuideBySlug(slug),
    getAllConcepts(),
    listLabs(),
  ]);
  if (!guide) notFound();

  async function action(values: Parameters<typeof updateDecisionGuideAction>[1]) {
    'use server';
    return updateDecisionGuideAction(guide!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/decision-guides/${slug}`} backLabel="Back to guide" title={`Edit: ${guide.title}`} />
      <DecisionGuideForm
        guide={guide}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        labOptions={labs.map((l) => ({ value: l.id, label: l.title }))}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/decision-guides/${slug}`}
      />
    </div>
  );
}
