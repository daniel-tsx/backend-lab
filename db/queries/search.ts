import { ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import {
  caseStudies,
  concepts,
  decisionGuides,
  diagrams,
  glossaryTerms,
  labs,
  learningLogs,
  lessons,
  projects,
  snippets,
} from '@/db/schema';

export type SearchResultType =
  | 'concept'
  | 'lesson'
  | 'lab'
  | 'snippet'
  | 'diagram'
  | 'decision-guide'
  | 'case-study'
  | 'glossary'
  | 'project'
  | 'log';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const PER_TYPE_LIMIT = 6;

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const like = `%${q}%`;

  const [
    conceptRows,
    lessonRows,
    labRows,
    snippetRows,
    diagramRows,
    guideRows,
    caseRows,
    glossaryRows,
    projectRows,
    logRows,
  ] = await Promise.all([
    db
      .select({
        id: concepts.id,
        title: concepts.title,
        slug: concepts.slug,
        summary: concepts.summary,
      })
      .from(concepts)
      .where(or(ilike(concepts.title, like), ilike(concepts.summary, like)))
      .limit(PER_TYPE_LIMIT),
    db
      .select({ id: lessons.id, title: lessons.title, slug: lessons.slug })
      .from(lessons)
      .where(
        or(
          ilike(lessons.title, like),
          ilike(lessons.summary, like),
          ilike(lessons.ownWords, like),
          ilike(lessons.projectApplication, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({ id: labs.id, title: labs.title, slug: labs.slug })
      .from(labs)
      .where(
        or(
          ilike(labs.title, like),
          ilike(labs.description, like),
          ilike(labs.notebook, like),
          ilike(labs.whatLearned, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({ id: snippets.id, title: snippets.title })
      .from(snippets)
      .where(or(ilike(snippets.title, like), ilike(snippets.explanation, like)))
      .limit(PER_TYPE_LIMIT),
    db
      .select({ id: diagrams.id, title: diagrams.title })
      .from(diagrams)
      .where(
        or(ilike(diagrams.title, like), ilike(diagrams.description, like)),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({
        id: decisionGuides.id,
        title: decisionGuides.title,
        slug: decisionGuides.slug,
      })
      .from(decisionGuides)
      .where(
        or(
          ilike(decisionGuides.title, like),
          ilike(decisionGuides.question, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({
        id: caseStudies.id,
        title: caseStudies.title,
        slug: caseStudies.slug,
      })
      .from(caseStudies)
      .where(
        or(
          ilike(caseStudies.title, like),
          ilike(caseStudies.problemStatement, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({
        id: glossaryTerms.id,
        term: glossaryTerms.term,
        slug: glossaryTerms.slug,
      })
      .from(glossaryTerms)
      .where(
        or(
          ilike(glossaryTerms.term, like),
          ilike(glossaryTerms.definition, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({
        id: projects.id,
        title: projects.projectName,
        description: projects.description,
      })
      .from(projects)
      .where(
        or(
          ilike(projects.projectName, like),
          ilike(projects.description, like),
          ilike(projects.backendRisks, like),
          ilike(projects.nextBackendAction, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
    db
      .select({ id: learningLogs.id, title: learningLogs.title })
      .from(learningLogs)
      .where(
        or(
          ilike(learningLogs.title, like),
          ilike(learningLogs.summary, like),
          ilike(learningLogs.notes, like),
          ilike(learningLogs.blockers, like),
          ilike(learningLogs.nextStep, like),
        ),
      )
      .limit(PER_TYPE_LIMIT),
  ]);

  const results: SearchResult[] = [
    ...conceptRows.map((r) => ({
      type: 'concept' as const,
      id: r.id,
      title: r.title,
      subtitle: r.summary || 'Concept',
      href: `/concepts/${r.slug}`,
    })),
    ...lessonRows.map((r) => ({
      type: 'lesson' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Lesson',
      href: `/lessons/${r.slug}`,
    })),
    ...labRows.map((r) => ({
      type: 'lab' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Lab',
      href: `/labs/${r.slug}`,
    })),
    ...snippetRows.map((r) => ({
      type: 'snippet' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Snippet',
      href: `/snippets?id=${r.id}`,
    })),
    ...diagramRows.map((r) => ({
      type: 'diagram' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Diagram',
      href: `/diagrams/${r.id}`,
    })),
    ...guideRows.map((r) => ({
      type: 'decision-guide' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Decision guide',
      href: `/decision-guides/${r.slug}`,
    })),
    ...caseRows.map((r) => ({
      type: 'case-study' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Case study',
      href: `/case-studies/${r.slug}`,
    })),
    ...glossaryRows.map((r) => ({
      type: 'glossary' as const,
      id: r.id,
      title: r.term,
      subtitle: 'Glossary',
      href: `/glossary#${r.slug}`,
    })),
    ...projectRows.map((r) => ({
      type: 'project' as const,
      id: r.id,
      title: r.title,
      subtitle: r.description || 'Project',
      href: `/projects/${r.id}`,
    })),
    ...logRows.map((r) => ({
      type: 'log' as const,
      id: r.id,
      title: r.title,
      subtitle: 'Learning log',
      href: `/logs/${r.id}/edit`,
    })),
  ];

  return results;
}
