'use server';

import { revalidatePath } from 'next/cache';

import {
  completeLesson,
  createLesson,
  createReviewCardsFromDrafts,
  deleteLesson,
  updateLesson,
  updateLessonStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { lessonCompletionSchema, lessonSchema } from '@/lib/validations';
import type { LessonStatus } from '@/types/enums';

export async function createLessonAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = lessonSchema.parse(values);
    const row = await createLesson(parsed);
    revalidatePath('/lessons');
    return { ok: true, redirectTo: `/lessons/${row.slug}`, message: 'Lesson created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateLessonAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = lessonSchema.parse(values);
    const row = await updateLesson(id, parsed);
    revalidatePath('/lessons');
    revalidatePath(`/lessons/${row.slug}`);
    return { ok: true, redirectTo: `/lessons/${row.slug}`, message: 'Lesson updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setLessonStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await updateLessonStatus(id, status as LessonStatus);
    revalidatePath('/lessons');
    return { ok: true, message: 'Status updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function completeLessonAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = lessonCompletionSchema.parse(values);
    const row = await completeLesson(id, {
      ownWords: parsed.ownWords,
      projectApplication: parsed.projectApplication,
    });
    const created = await createReviewCardsFromDrafts(parsed.reviewCards, {
      lessonId: id,
    });
    revalidatePath('/lessons');
    revalidatePath(`/lessons/${row.slug}`);
    revalidatePath('/reviews');
    revalidatePath('/');
    return {
      ok: true,
      message: created > 0 ? `Lesson completed · ${created} cards added` : 'Lesson completed',
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteLessonAction(id: string): Promise<ActionResult> {
  try {
    await deleteLesson(id);
    revalidatePath('/lessons');
    return { ok: true, redirectTo: '/lessons', message: 'Lesson deleted' };
  } catch (error) {
    return actionError(error);
  }
}
