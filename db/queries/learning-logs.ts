import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { learningLogs } from '@/db/schema';
import type { LearningLogInput } from '@/lib/validations';
import type { LearningLog } from '@/types';

export async function listLearningLogs(): Promise<LearningLog[]> {
  return db.select().from(learningLogs).orderBy(desc(learningLogs.date));
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
