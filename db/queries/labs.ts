import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import { labs } from '@/db/schema';
import { slugify } from '@/lib/slug';
import type { LabInput } from '@/lib/validations';
import type { Difficulty, LabStatus, LabType } from '@/types/enums';
import type { Concept, Lab, Module } from '@/types';

import { uniqueSlug } from './utils';

export interface LabFilters {
  difficulty?: Difficulty;
  labType?: LabType;
  status?: LabStatus;
  search?: string;
}

export interface LabWithRelations extends Lab {
  concept: Concept | null;
  module: Module | null;
}

export async function listLabs(filters: LabFilters = {}): Promise<Lab[]> {
  const conditions = [];
  if (filters.difficulty)
    conditions.push(eq(labs.difficulty, filters.difficulty));
  if (filters.labType) conditions.push(eq(labs.labType, filters.labType));
  if (filters.status) conditions.push(eq(labs.status, filters.status));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(labs.title, q),
        ilike(labs.description, q),
        ilike(labs.scenario, q),
      ),
    );
  }
  return db
    .select()
    .from(labs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(labs.updatedAt));
}

export async function getLabBySlug(
  slug: string,
): Promise<LabWithRelations | undefined> {
  const row = await db.query.labs.findFirst({
    where: eq(labs.slug, slug),
    with: { concept: true, module: true },
  });
  return row as LabWithRelations | undefined;
}

export async function getLabById(id: string): Promise<Lab | undefined> {
  return db.query.labs.findFirst({ where: eq(labs.id, id) });
}

export async function labsForConcept(conceptId: string): Promise<Lab[]> {
  return db.select().from(labs).where(eq(labs.relatedConceptId, conceptId));
}

export async function createLab(input: LabInput): Promise<Lab> {
  const slug = await uniqueSlug(slugify(input.title), async (s) =>
    Boolean(await db.query.labs.findFirst({ where: eq(labs.slug, s) })),
  );
  const [row] = await db
    .insert(labs)
    .values({
      ...input,
      relatedConceptId: input.relatedConceptId || null,
      moduleId: input.moduleId || null,
      slug,
    })
    .returning();
  return row;
}

export async function updateLab(id: string, input: LabInput): Promise<Lab> {
  const [row] = await db
    .update(labs)
    .set({
      ...input,
      relatedConceptId: input.relatedConceptId || null,
      moduleId: input.moduleId || null,
    })
    .where(eq(labs.id, id))
    .returning();
  return row;
}

export async function updateLabStatus(
  id: string,
  status: LabStatus,
): Promise<void> {
  await db.update(labs).set({ status }).where(eq(labs.id, id));
}

export interface LabCompletionFields {
  timeSpentMinutes: number;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
  thingsGotWrong: string;
  whatLearned: string;
}

/** Save outcome fields and mark the lab completed (completion flow). */
export async function completeLab(
  id: string,
  fields: LabCompletionFields,
): Promise<Lab> {
  const [row] = await db
    .update(labs)
    .set({ ...fields, status: 'completed' })
    .where(eq(labs.id, id))
    .returning();
  return row;
}

export async function deleteLab(id: string): Promise<void> {
  await db.delete(labs).where(eq(labs.id, id));
}
