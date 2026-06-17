import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import { decisionGuides } from '@/db/schema';
import { slugify } from '@/lib/slug';
import type { DecisionGuideInput } from '@/lib/validations';
import type { DecisionCategory } from '@/types/enums';
import type { DecisionGuide } from '@/types';

import { uniqueSlug } from './utils';

export interface DecisionGuideFilters {
  category?: DecisionCategory;
  search?: string;
}

export async function listDecisionGuides(
  filters: DecisionGuideFilters = {},
): Promise<DecisionGuide[]> {
  const conditions = [];
  if (filters.category)
    conditions.push(eq(decisionGuides.category, filters.category));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(decisionGuides.title, q),
        ilike(decisionGuides.question, q),
        ilike(decisionGuides.shortAnswer, q),
      ),
    );
  }
  return db
    .select()
    .from(decisionGuides)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(decisionGuides.updatedAt));
}

export async function getDecisionGuideBySlug(
  slug: string,
): Promise<DecisionGuide | undefined> {
  return db.query.decisionGuides.findFirst({
    where: eq(decisionGuides.slug, slug),
  });
}

export async function getDecisionGuideById(
  id: string,
): Promise<DecisionGuide | undefined> {
  return db.query.decisionGuides.findFirst({
    where: eq(decisionGuides.id, id),
  });
}

export async function createDecisionGuide(
  input: DecisionGuideInput,
): Promise<DecisionGuide> {
  const slug = await uniqueSlug(slugify(input.title), async (s) =>
    Boolean(
      await db.query.decisionGuides.findFirst({
        where: eq(decisionGuides.slug, s),
      }),
    ),
  );
  const [row] = await db
    .insert(decisionGuides)
    .values({ ...input, slug })
    .returning();
  return row;
}

export async function updateDecisionGuide(
  id: string,
  input: DecisionGuideInput,
): Promise<DecisionGuide> {
  const [row] = await db
    .update(decisionGuides)
    .set(input)
    .where(eq(decisionGuides.id, id))
    .returning();
  return row;
}

export async function deleteDecisionGuide(id: string): Promise<void> {
  await db.delete(decisionGuides).where(eq(decisionGuides.id, id));
}
