import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { ReviewCardForm } from '@/components/forms/review-card-form';
import { getAllConcepts, getReviewCardById, listLessons } from '@/db/queries';

import { updateReviewCardAction } from '../../actions';

export const metadata = { title: 'Edit review card' };

export default async function EditReviewCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [card, concepts, lessons] = await Promise.all([
    getReviewCardById(id),
    getAllConcepts(),
    listLessons(),
  ]);
  if (!card) notFound();

  async function action(values: Parameters<typeof updateReviewCardAction>[1]) {
    'use server';
    return updateReviewCardAction(id, values);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/reviews" backLabel="Review Center" title="Edit review card" />
      <ReviewCardForm
        card={card}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        lessonOptions={lessons.map((l) => ({ value: l.id, label: l.title }))}
        action={action}
        submitLabel="Save changes"
        cancelHref="/reviews"
      />
    </div>
  );
}
