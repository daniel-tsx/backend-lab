import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import { snippets } from '@/db/schema';
import type { SnippetInput } from '@/lib/validations';
import type { SnippetCategory, SnippetLanguage } from '@/types/enums';
import type { Snippet } from '@/types';

export interface SnippetFilters {
  language?: SnippetLanguage;
  category?: SnippetCategory;
  search?: string;
}

function normalizeRefs(input: SnippetInput) {
  return {
    relatedConceptId: input.relatedConceptId || null,
    relatedLabId: input.relatedLabId || null,
  };
}

export async function listSnippets(
  filters: SnippetFilters = {},
): Promise<Snippet[]> {
  const conditions = [];
  if (filters.language) conditions.push(eq(snippets.language, filters.language));
  if (filters.category) conditions.push(eq(snippets.category, filters.category));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(snippets.title, q),
        ilike(snippets.explanation, q),
        ilike(snippets.useCase, q),
      ),
    );
  }
  return db
    .select()
    .from(snippets)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(snippets.updatedAt));
}

export async function getSnippetById(id: string): Promise<Snippet | undefined> {
  return db.query.snippets.findFirst({ where: eq(snippets.id, id) });
}

export async function snippetsForConcept(conceptId: string): Promise<Snippet[]> {
  return db
    .select()
    .from(snippets)
    .where(eq(snippets.relatedConceptId, conceptId));
}

export async function createSnippet(input: SnippetInput): Promise<Snippet> {
  const [row] = await db
    .insert(snippets)
    .values({ ...input, ...normalizeRefs(input) })
    .returning();
  return row;
}

export async function updateSnippet(
  id: string,
  input: SnippetInput,
): Promise<Snippet> {
  const [row] = await db
    .update(snippets)
    .set({ ...input, ...normalizeRefs(input) })
    .where(eq(snippets.id, id))
    .returning();
  return row;
}

export async function deleteSnippet(id: string): Promise<void> {
  await db.delete(snippets).where(eq(snippets.id, id));
}
