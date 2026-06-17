'use server';

import { revalidatePath } from 'next/cache';

import {
  createLesson,
  deleteLesson,
  updateLesson,
  updateLessonStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { lessonSchema } from '@/lib/validations';
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

export async function deleteLessonAction(id: string): Promise<ActionResult> {
  try {
    await deleteLesson(id);
    revalidatePath('/lessons');
    return { ok: true, redirectTo: '/lessons', message: 'Lesson deleted' };
  } catch (error) {
    return actionError(error);
  }
}
