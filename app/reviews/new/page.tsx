import { PageHeader } from '@/components/common/page-header';
import { ReviewCardForm } from '@/components/forms/review-card-form';
import { getAllConcepts, listLessons } from '@/db/queries';

import { createReviewCardAction } from '../actions';

export const metadata = { title: 'New review card' };

export default async function NewReviewCardPage() {
  const [concepts, lessons] = await Promise.all([getAllConcepts(), listLessons()]);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/reviews" backLabel="Review Center" title="New review card" />
      <ReviewCardForm
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        lessonOptions={lessons.map((l) => ({ value: l.id, label: l.title }))}
        action={createReviewCardAction}
        submitLabel="Create card"
        cancelHref="/reviews"
      />
    </div>
  );
}
