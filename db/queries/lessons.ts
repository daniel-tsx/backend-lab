import { asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { lessons } from '@/db/schema';
import { slugify } from '@/lib/slug';
import type { LessonInput } from '@/lib/validations';
import type { LessonStatus } from '@/types/enums';
import type { Lesson, Module } from '@/types';

import { uniqueSlug } from './utils';

export interface LessonWithModule extends Lesson {
  module: Module | null;
}

export async function listLessons(): Promise<LessonWithModule[]> {
  const rows = await db.query.lessons.findMany({
    orderBy: [asc(lessons.order)],
    with: { module: true },
  });
  return rows as LessonWithModule[];
}

export async function listLessonsByModule(
  moduleId: string,
): Promise<Lesson[]> {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId))
    .orderBy(asc(lessons.order));
}

export async function getLessonBySlug(
  slug: string,
): Promise<LessonWithModule | undefined> {
  const row = await db.query.lessons.findFirst({
    where: eq(lessons.slug, slug),
    with: { module: true },
  });
  return row as LessonWithModule | undefined;
}

export async function getLessonById(id: string): Promise<Lesson | undefined> {
  return db.query.lessons.findFirst({ where: eq(lessons.id, id) });
}

export async function createLesson(input: LessonInput): Promise<Lesson> {
  const slug = await uniqueSlug(slugify(input.title), async (s) =>
    Boolean(await db.query.lessons.findFirst({ where: eq(lessons.slug, s) })),
  );
  const [row] = await db
    .insert(lessons)
    .values({ ...input, slug })
    .returning();
  return row;
}

export async function updateLesson(
  id: string,
  input: LessonInput,
): Promise<Lesson> {
  const [row] = await db
    .update(lessons)
    .set(input)
    .where(eq(lessons.id, id))
    .returning();
  return row;
}

export async function updateLessonStatus(
  id: string,
  status: LessonStatus,
): Promise<void> {
  await db.update(lessons).set({ status }).where(eq(lessons.id, id));
}

export async function deleteLesson(id: string): Promise<void> {
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function recentlyCompletedLessons(
  limit = 5,
): Promise<LessonWithModule[]> {
  const rows = await db.query.lessons.findMany({
    where: eq(lessons.status, 'completed'),
    orderBy: [asc(lessons.order)],
    with: { module: true },
    limit,
  });
  return rows as LessonWithModule[];
}
