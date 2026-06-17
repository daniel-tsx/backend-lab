import { and, asc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import { glossaryTerms } from '@/db/schema';
import { slugify } from '@/lib/slug';
import type { GlossaryTermInput } from '@/lib/validations';
import type { ConceptCategory } from '@/types/enums';
import type { GlossaryTerm } from '@/types';

import { uniqueSlug } from './utils';

export interface GlossaryFilters {
  category?: ConceptCategory;
  search?: string;
}

export async function listGlossaryTerms(
  filters: GlossaryFilters = {},
): Promise<GlossaryTerm[]> {
  const conditions = [];
  if (filters.category)
    conditions.push(eq(glossaryTerms.category, filters.category));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(glossaryTerms.term, q),
        ilike(glossaryTerms.definition, q),
        ilike(glossaryTerms.commonConfusion, q),
      ),
    );
  }
  return db
    .select()
    .from(glossaryTerms)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(glossaryTerms.term));
}

export async function getGlossaryTermBySlug(
  slug: string,
): Promise<GlossaryTerm | undefined> {
  return db.query.glossaryTerms.findFirst({
    where: eq(glossaryTerms.slug, slug),
  });
}

export async function getGlossaryTermById(
  id: string,
): Promise<GlossaryTerm | undefined> {
  return db.query.glossaryTerms.findFirst({ where: eq(glossaryTerms.id, id) });
}

export async function createGlossaryTerm(
  input: GlossaryTermInput,
): Promise<GlossaryTerm> {
  const slug = await uniqueSlug(slugify(input.term), async (s) =>
    Boolean(
      await db.query.glossaryTerms.findFirst({
        where: eq(glossaryTerms.slug, s),
      }),
    ),
  );
  const [row] = await db
    .insert(glossaryTerms)
    .values({ ...input, slug })
    .returning();
  return row;
}

export async function updateGlossaryTerm(
  id: string,
  input: GlossaryTermInput,
): Promise<GlossaryTerm> {
  const [row] = await db
    .update(glossaryTerms)
    .set(input)
    .where(eq(glossaryTerms.id, id))
    .returning();
  return row;
}

export async function deleteGlossaryTerm(id: string): Promise<void> {
  await db.delete(glossaryTerms).where(eq(glossaryTerms.id, id));
}
