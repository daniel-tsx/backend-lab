import { and, asc, eq, lte } from 'drizzle-orm';

import { db } from '@/db';
import { reviewCards } from '@/db/schema';
import { initialSchedule, scheduleNext } from '@/lib/review-scheduler';
import type { ReviewCardInput } from '@/lib/validations';
import type { ReviewGrade } from '@/types/enums';
import type { Concept, Lesson, ReviewCard } from '@/types';

export interface ReviewCardWithRelations extends ReviewCard {
  concept: Concept | null;
  lesson: Lesson | null;
}

export async function listReviewCards(): Promise<ReviewCardWithRelations[]> {
  const rows = await db.query.reviewCards.findMany({
    orderBy: [asc(reviewCards.nextReviewAt)],
    with: { concept: true, lesson: true },
  });
  return rows as ReviewCardWithRelations[];
}

export async function listDueReviewCards(
  now: Date = new Date(),
): Promise<ReviewCardWithRelations[]> {
  const rows = await db.query.reviewCards.findMany({
    where: and(
      eq(reviewCards.status, 'active'),
      lte(reviewCards.nextReviewAt, now),
    ),
    orderBy: [asc(reviewCards.nextReviewAt)],
    with: { concept: true, lesson: true },
  });
  return rows as ReviewCardWithRelations[];
}

export async function dueReviewCount(now: Date = new Date()): Promise<number> {
  const rows = await db
    .select({ id: reviewCards.id })
    .from(reviewCards)
    .where(
      and(eq(reviewCards.status, 'active'), lte(reviewCards.nextReviewAt, now)),
    );
  return rows.length;
}

export async function getReviewCardById(
  id: string,
): Promise<ReviewCard | undefined> {
  return db.query.reviewCards.findFirst({ where: eq(reviewCards.id, id) });
}

export async function reviewCardsForConcept(
  conceptId: string,
): Promise<ReviewCard[]> {
  return db
    .select()
    .from(reviewCards)
    .where(eq(reviewCards.relatedConceptId, conceptId));
}

export async function createReviewCard(
  input: ReviewCardInput,
): Promise<ReviewCard> {
  const [row] = await db
    .insert(reviewCards)
    .values({
      ...input,
      relatedConceptId: input.relatedConceptId || null,
      relatedLessonId: input.relatedLessonId || null,
      ...initialSchedule(),
    })
    .returning();
  return row;
}

/**
 * Bulk-create review cards from drafts captured in a completion flow.
 * Skips drafts without a question; links each card to a concept or lesson.
 */
export async function createReviewCardsFromDrafts(
  drafts: { question: string; answer: string }[],
  link: { conceptId?: string | null; lessonId?: string | null },
): Promise<number> {
  const rows = drafts
    .filter((d) => d.question.trim().length > 0)
    .map((d) => ({
      question: d.question.trim(),
      answer: d.answer ?? '',
      relatedConceptId: link.conceptId ?? null,
      relatedLessonId: link.lessonId ?? null,
      ...initialSchedule(),
    }));
  if (rows.length === 0) return 0;
  await db.insert(reviewCards).values(rows);
  return rows.length;
}

export async function updateReviewCard(
  id: string,
  input: ReviewCardInput,
): Promise<ReviewCard> {
  const [row] = await db
    .update(reviewCards)
    .set({
      ...input,
      relatedConceptId: input.relatedConceptId || null,
      relatedLessonId: input.relatedLessonId || null,
    })
    .where(eq(reviewCards.id, id))
    .returning();
  return row;
}

/** Apply a grade: advance scheduling state via the SM-2 scheduler. */
export async function gradeReviewCard(
  id: string,
  grade: ReviewGrade,
): Promise<ReviewCard | undefined> {
  const card = await getReviewCardById(id);
  if (!card) return undefined;
  const update = scheduleNext(card, grade);
  const [row] = await db
    .update(reviewCards)
    .set(update)
    .where(eq(reviewCards.id, id))
    .returning();
  return row;
}

export async function setReviewCardStatus(
  id: string,
  status: ReviewCard['status'],
): Promise<void> {
  await db.update(reviewCards).set({ status }).where(eq(reviewCards.id, id));
}

export async function deleteReviewCard(id: string): Promise<void> {
  await db.delete(reviewCards).where(eq(reviewCards.id, id));
}
