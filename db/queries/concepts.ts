import { and, arrayContains, eq, ilike, inArray, or } from 'drizzle-orm';

import { db } from '@/db';
import { concepts } from '@/db/schema';
import { conceptStatusWeight } from '@/lib/scoring';
import { slugify } from '@/lib/slug';
import type { ConceptInput } from '@/lib/validations';
import {
  type ConceptCategory,
  type ConceptStatus,
  type Difficulty,
  type Importance,
} from '@/types/enums';
import type { Concept } from '@/types';

import { uniqueSlug } from './utils';

export type ConceptSort =
  | 'importance'
  | 'difficulty'
  | 'updated'
  | 'review'
  | 'title';

export interface ConceptFilters {
  category?: ConceptCategory;
  difficulty?: Difficulty;
  status?: ConceptStatus;
  importance?: Importance;
  tag?: string;
  search?: string;
  sort?: ConceptSort;
}

const importanceRank: Record<Importance, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
const difficultyRank: Record<Difficulty, number> = {
  advanced: 0,
  intermediate: 1,
  beginner: 2,
};
// Higher number = more in need of review.
const reviewRank: Record<ConceptStatus, number> = {
  'needs-review': 0,
  reading: 1,
  practicing: 2,
  'not-started': 3,
  understood: 4,
  mastered: 5,
};

function sortConcepts(rows: Concept[], sort: ConceptSort): Concept[] {
  const sorted = [...rows];
  switch (sort) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'difficulty':
      return sorted.sort(
        (a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty],
      );
    case 'review':
      return sorted.sort((a, b) => reviewRank[a.status] - reviewRank[b.status]);
    case 'updated':
      return sorted.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    case 'importance':
    default:
      return sorted.sort(
        (a, b) =>
          importanceRank[a.importance] - importanceRank[b.importance] ||
          a.title.localeCompare(b.title),
      );
  }
}

export async function listConcepts(
  filters: ConceptFilters = {},
): Promise<Concept[]> {
  const conditions = [];
  if (filters.category) conditions.push(eq(concepts.category, filters.category));
  if (filters.difficulty)
    conditions.push(eq(concepts.difficulty, filters.difficulty));
  if (filters.status) conditions.push(eq(concepts.status, filters.status));
  if (filters.importance)
    conditions.push(eq(concepts.importance, filters.importance));
  if (filters.tag) conditions.push(arrayContains(concepts.tags, [filters.tag]));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(concepts.title, q),
        ilike(concepts.summary, q),
        ilike(concepts.commonMistakes, q),
        ilike(concepts.realWorldExamples, q),
        ilike(concepts.mentalModel, q),
      ),
    );
  }

  const rows = await db
    .select()
    .from(concepts)
    .where(conditions.length ? and(...conditions) : undefined);

  return sortConcepts(rows, filters.sort ?? 'importance');
}

export async function getAllConcepts(): Promise<Concept[]> {
  return listConcepts({ sort: 'title' });
}

export async function getConceptBySlug(
  slug: string,
): Promise<Concept | undefined> {
  return db.query.concepts.findFirst({ where: eq(concepts.slug, slug) });
}

export async function getConceptById(
  id: string,
): Promise<Concept | undefined> {
  return db.query.concepts.findFirst({ where: eq(concepts.id, id) });
}

export async function getConceptsByIds(ids: string[]): Promise<Concept[]> {
  if (ids.length === 0) return [];
  return db.select().from(concepts).where(inArray(concepts.id, ids));
}

export async function createConcept(input: ConceptInput): Promise<Concept> {
  const slug = await uniqueSlug(slugify(input.title), async (s) =>
    Boolean(await getConceptBySlug(s)),
  );
  const [row] = await db
    .insert(concepts)
    .values({ ...input, slug })
    .returning();
  return row;
}

export async function updateConcept(
  id: string,
  input: ConceptInput,
): Promise<Concept> {
  const [row] = await db
    .update(concepts)
    .set(input)
    .where(eq(concepts.id, id))
    .returning();
  return row;
}

export async function updateConceptStatus(
  id: string,
  status: ConceptStatus,
): Promise<void> {
  await db.update(concepts).set({ status }).where(eq(concepts.id, id));
}

export async function bulkUpdateConceptStatus(
  ids: string[],
  status: ConceptStatus,
): Promise<void> {
  if (ids.length === 0) return;
  await db.update(concepts).set({ status }).where(inArray(concepts.id, ids));
}

export async function deleteConcept(id: string): Promise<void> {
  await db.delete(concepts).where(eq(concepts.id, id));
}

/** Status counts for the dashboard, keyed by status. */
export async function conceptStatusCounts(): Promise<
  Record<ConceptStatus, number>
> {
  const rows = await db
    .select({ status: concepts.status })
    .from(concepts);
  const counts = {
    'not-started': 0,
    reading: 0,
    practicing: 0,
    understood: 0,
    'needs-review': 0,
    mastered: 0,
  } as Record<ConceptStatus, number>;
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

export { conceptStatusWeight };
