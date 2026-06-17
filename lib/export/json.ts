import { db } from '@/db';
import {
  appSettings,
  caseStudies,
  concepts,
  decisionGuides,
  diagrams,
  glossaryTerms,
  labs,
  learningLogs,
  lessons,
  moduleConcepts,
  modules,
  projects,
  reviewCards,
  snippets,
} from '@/db/schema';
import { clearAllData } from '@/seed';

export interface BackupFile {
  version: number;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export async function buildExport(): Promise<BackupFile> {
  const [
    conceptRows,
    moduleRows,
    moduleConceptRows,
    lessonRows,
    labRows,
    caseStudyRows,
    decisionGuideRows,
    projectRows,
    diagramRows,
    snippetRows,
    reviewCardRows,
    learningLogRows,
    glossaryRows,
    settingRows,
  ] = await Promise.all([
    db.select().from(concepts),
    db.select().from(modules),
    db.select().from(moduleConcepts),
    db.select().from(lessons),
    db.select().from(labs),
    db.select().from(caseStudies),
    db.select().from(decisionGuides),
    db.select().from(projects),
    db.select().from(diagrams),
    db.select().from(snippets),
    db.select().from(reviewCards),
    db.select().from(learningLogs),
    db.select().from(glossaryTerms),
    db.select().from(appSettings),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      concepts: conceptRows,
      modules: moduleRows,
      moduleConcepts: moduleConceptRows,
      lessons: lessonRows,
      labs: labRows,
      caseStudies: caseStudyRows,
      decisionGuides: decisionGuideRows,
      projects: projectRows,
      diagrams: diagramRows,
      snippets: snippetRows,
      reviewCards: reviewCardRows,
      learningLogs: learningLogRows,
      glossaryTerms: glossaryRows,
      appSettings: settingRows,
    },
  };
}

function coerceDates<T extends Record<string, unknown>>(
  rows: unknown[] | undefined,
  fields: string[],
): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((raw) => {
    const row = { ...(raw as Record<string, unknown>) };
    for (const f of fields) {
      if (row[f] != null) row[f] = new Date(row[f] as string);
    }
    return row as T;
  });
}

const TS = ['createdAt', 'updatedAt'];

/** Replace all data with a previously exported backup. */
export async function applyImport(backup: BackupFile): Promise<void> {
  const d = backup?.data;
  if (!d) throw new Error('Invalid backup: missing data');

  await clearAllData();
  await db.delete(appSettings);

  const insert = async (table: Parameters<typeof db.insert>[0], rows: unknown[]) => {
    if (rows.length > 0) await db.insert(table).values(rows as never);
  };

  await insert(concepts, coerceDates(d.concepts, TS));
  await insert(modules, coerceDates(d.modules, TS));
  await insert(moduleConcepts, coerceDates(d.moduleConcepts, []));
  await insert(lessons, coerceDates(d.lessons, TS));
  await insert(labs, coerceDates(d.labs, TS));
  await insert(caseStudies, coerceDates(d.caseStudies, TS));
  await insert(decisionGuides, coerceDates(d.decisionGuides, TS));
  await insert(projects, coerceDates(d.projects, TS));
  await insert(diagrams, coerceDates(d.diagrams, TS));
  await insert(snippets, coerceDates(d.snippets, TS));
  await insert(
    reviewCards,
    coerceDates(d.reviewCards, [...TS, 'nextReviewAt', 'lastReviewedAt']),
  );
  await insert(learningLogs, coerceDates(d.learningLogs, [...TS, 'date']));
  await insert(glossaryTerms, coerceDates(d.glossaryTerms, TS));
  await insert(appSettings, coerceDates(d.appSettings, ['updatedAt']));
}
