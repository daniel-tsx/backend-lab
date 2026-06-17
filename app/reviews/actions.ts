'use server';

import { revalidatePath } from 'next/cache';

import {
  createReviewCard,
  deleteReviewCard,
  gradeReviewCard,
  setReviewCardStatus,
  updateReviewCard,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { reviewCardSchema } from '@/lib/validations';
import { reviewGrades, reviewStatuses, type ReviewGrade } from '@/types/enums';

export async function gradeReviewCardAction(
  id: string,
  grade: string,
): Promise<ActionResult> {
  try {
    if (!reviewGrades.includes(grade as ReviewGrade)) {
      return { ok: false, error: 'Invalid grade' };
    }
    await gradeReviewCard(id, grade as ReviewGrade);
    revalidatePath('/reviews');
    revalidatePath('/');
    return { ok: true, message: 'Graded' };
  } catch (error) {
    return actionError(error);
  }
}

export async function createReviewCardAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = reviewCardSchema.parse(values);
    await createReviewCard(parsed);
    revalidatePath('/reviews');
    return { ok: true, redirectTo: '/reviews', message: 'Review card created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateReviewCardAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = reviewCardSchema.parse(values);
    await updateReviewCard(id, parsed);
    revalidatePath('/reviews');
    return { ok: true, redirectTo: '/reviews', message: 'Review card updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setReviewCardStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    const valid = reviewStatuses.includes(status as (typeof reviewStatuses)[number]);
    if (!valid) return { ok: false, error: 'Invalid status' };
    await setReviewCardStatus(id, status as (typeof reviewStatuses)[number]);
    revalidatePath('/reviews');
    return { ok: true, message: 'Updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteReviewCardAction(id: string): Promise<ActionResult> {
  try {
    await deleteReviewCard(id);
    revalidatePath('/reviews');
    return { ok: true, message: 'Deleted' };
  } catch (error) {
    return actionError(error);
  }
}
