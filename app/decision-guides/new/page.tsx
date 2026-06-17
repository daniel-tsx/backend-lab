import { PageHeader } from '@/components/common/page-header';
import { DecisionGuideForm } from '@/components/forms/decision-guide-form';
import { getAllConcepts, listLabs } from '@/db/queries';

import { createDecisionGuideAction } from '../actions';

export const metadata = { title: 'New decision guide' };

export default async function NewDecisionGuidePage() {
  const [concepts, labs] = await Promise.all([getAllConcepts(), listLabs()]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/decision-guides" backLabel="Decision Guides" title="New decision guide" />
      <DecisionGuideForm
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        labOptions={labs.map((l) => ({ value: l.id, label: l.title }))}
        action={createDecisionGuideAction}
        submitLabel="Create guide"
        cancelHref="/decision-guides"
      />
    </div>
  );
}
