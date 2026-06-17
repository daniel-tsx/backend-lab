import { PageHeader } from '@/components/common/page-header';
import { CaseStudyForm } from '@/components/forms/case-study-form';

import { createCaseStudyAction } from '../actions';

export const metadata = { title: 'New case study' };

export default function NewCaseStudyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/case-studies" backLabel="Casebook" title="New system design case" />
      <CaseStudyForm action={createCaseStudyAction} submitLabel="Create case" cancelHref="/case-studies" />
    </div>
  );
}
