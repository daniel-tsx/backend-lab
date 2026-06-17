import { desc, eq, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { concepts, labs, learningLogs } from '@/db/schema';
import type { LearningLogInput } from '@/lib/validations';
import type { LearningLog } from '@/types';

export async function listLearningLogs(): Promise<LearningLog[]> {
  return db.select().from(learningLogs).orderBy(desc(learningLogs.date));
}

export interface EntityRef {
  id: string;
  slug: string;
  title: string;
}

export interface LearningLogWithLinks extends LearningLog {
  concepts: EntityRef[];
  labs: EntityRef[];
}

/** Learning logs with their linked concepts/labs resolved to titles + slugs. */
export async function listLearningLogsWithLinks(): Promise<
  LearningLogWithLinks[]
> {
  const logs = await listLearningLogs();
  const conceptIds = [...new Set(logs.flatMap((l) => l.conceptIds))];
  const labIds = [...new Set(logs.flatMap((l) => l.labIds))];

  const [conceptRows, labRows] = await Promise.all([
    conceptIds.length
      ? db
          .select({ id: concepts.id, slug: concepts.slug, title: concepts.title })
          .from(concepts)
          .where(inArray(concepts.id, conceptIds))
      : Promise.resolve([] as EntityRef[]),
    labIds.length
      ? db
          .select({ id: labs.id, slug: labs.slug, title: labs.title })
          .from(labs)
          .where(inArray(labs.id, labIds))
      : Promise.resolve([] as EntityRef[]),
  ]);

  const conceptById = new Map(conceptRows.map((c) => [c.id, c]));
  const labById = new Map(labRows.map((l) => [l.id, l]));

  return logs.map((log) => ({
    ...log,
    concepts: log.conceptIds
      .map((id) => conceptById.get(id))
      .filter((c): c is EntityRef => Boolean(c)),
    labs: log.labIds
      .map((id) => labById.get(id))
      .filter((l): l is EntityRef => Boolean(l)),
  }));
}

export async function getLearningLogById(
  id: string,
): Promise<LearningLog | undefined> {
  return db.query.learningLogs.findFirst({ where: eq(learningLogs.id, id) });
}

export async function createLearningLog(
  input: LearningLogInput,
): Promise<LearningLog> {
  const [row] = await db.insert(learningLogs).values(input).returning();
  return row;
}

export async function updateLearningLog(
  id: string,
  input: LearningLogInput,
): Promise<LearningLog> {
  const [row] = await db
    .update(learningLogs)
    .set(input)
    .where(eq(learningLogs.id, id))
    .returning();
  return row;
}

export async function deleteLearningLog(id: string): Promise<void> {
  await db.delete(learningLogs).where(eq(learningLogs.id, id));
}
