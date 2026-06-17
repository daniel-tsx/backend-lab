import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import { caseStudies } from '@/db/schema';
import { slugify } from '@/lib/slug';
import type { CaseStudyInput } from '@/lib/validations';
import type {
  CaseStudyDomain,
  CaseStudyStatus,
  Difficulty,
} from '@/types/enums';
import type { CaseStudy, CaseStudyReviewScores, Diagram } from '@/types';

import { uniqueSlug } from './utils';

export interface CaseStudyFilters {
  domain?: CaseStudyDomain;
  difficulty?: Difficulty;
  status?: CaseStudyStatus;
  search?: string;
}

export interface CaseStudyWithDiagrams extends CaseStudy {
  diagrams: Diagram[];
}

export async function listCaseStudies(
  filters: CaseStudyFilters = {},
): Promise<CaseStudy[]> {
  const conditions = [];
  if (filters.domain) conditions.push(eq(caseStudies.domain, filters.domain));
  if (filters.difficulty)
    conditions.push(eq(caseStudies.difficulty, filters.difficulty));
  if (filters.status) conditions.push(eq(caseStudies.status, filters.status));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(caseStudies.title, q),
        ilike(caseStudies.problemStatement, q),
      ),
    );
  }
  return db
    .select()
    .from(caseStudies)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(caseStudies.updatedAt));
}

export async function getCaseStudyBySlug(
  slug: string,
): Promise<CaseStudyWithDiagrams | undefined> {
  const row = await db.query.caseStudies.findFirst({
    where: eq(caseStudies.slug, slug),
    with: { diagrams: true },
  });
  return row as CaseStudyWithDiagrams | undefined;
}

export async function getCaseStudyById(
  id: string,
): Promise<CaseStudy | undefined> {
  return db.query.caseStudies.findFirst({ where: eq(caseStudies.id, id) });
}

export async function createCaseStudy(
  input: CaseStudyInput,
): Promise<CaseStudy> {
  const slug = await uniqueSlug(slugify(input.title), async (s) =>
    Boolean(
      await db.query.caseStudies.findFirst({ where: eq(caseStudies.slug, s) }),
    ),
  );
  const [row] = await db
    .insert(caseStudies)
    .values({ ...input, reviewScores: input.reviewScores ?? null, slug })
    .returning();
  return row;
}

export async function updateCaseStudy(
  id: string,
  input: CaseStudyInput,
): Promise<CaseStudy> {
  const [row] = await db
    .update(caseStudies)
    .set({ ...input, reviewScores: input.reviewScores ?? null })
    .where(eq(caseStudies.id, id))
    .returning();
  return row;
}

export async function updateCaseStudyStatus(
  id: string,
  status: CaseStudyStatus,
): Promise<void> {
  await db.update(caseStudies).set({ status }).where(eq(caseStudies.id, id));
}

export async function updateCaseStudyReviewScores(
  id: string,
  reviewScores: CaseStudyReviewScores,
): Promise<void> {
  await db
    .update(caseStudies)
    .set({ reviewScores })
    .where(eq(caseStudies.id, id));
}

export async function deleteCaseStudy(id: string): Promise<void> {
  await db.delete(caseStudies).where(eq(caseStudies.id, id));
}
