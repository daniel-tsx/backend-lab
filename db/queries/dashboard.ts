import { format, startOfDay, subDays } from 'date-fns';

import { db } from '@/db';
import {
  caseStudies,
  concepts,
  decisionGuides,
  diagrams,
  labs,
  learningLogs,
  lessons,
  modules as modulesTable,
  projects,
  reviewCards,
} from '@/db/schema';
import {
  backendConfidenceIndex,
  learningProgressScore,
  systemDesignReadinessScore,
  weaknessByCategory,
  type ScoringData,
} from '@/lib/scoring';
import { isDue } from '@/lib/review-scheduler';
import {
  conceptCategories,
  difficulties,
  type ConceptCategory,
  type Difficulty,
} from '@/types/enums';
import type { CaseStudy, Lab, Lesson, Module } from '@/types';

/** Fetch every entity needed by the scoring engine in parallel. */
export async function getScoringData(): Promise<ScoringData> {
  const [
    conceptRows,
    lessonRows,
    labRows,
    caseStudyRows,
    diagramRows,
    decisionGuideRows,
    reviewCardRows,
    projectRows,
  ] = await Promise.all([
    db.select().from(concepts),
    db.select().from(lessons),
    db.select().from(labs),
    db.select().from(caseStudies),
    db.select().from(diagrams),
    db.select().from(decisionGuides),
    db.select().from(reviewCards),
    db.select().from(projects),
  ]);
  return {
    concepts: conceptRows,
    lessons: lessonRows,
    labs: labRows,
    caseStudies: caseStudyRows,
    diagrams: diagramRows,
    decisionGuides: decisionGuideRows,
    reviewCards: reviewCardRows,
    projects: projectRows,
  };
}

export function computeStreak(dates: Date[], now: Date): number {
  if (dates.length === 0) return 0;
  const days = new Set(
    dates.map((d) => startOfDay(d).getTime()),
  );
  const today = startOfDay(now).getTime();
  const yesterday = startOfDay(subDays(now, 1)).getTime();
  // Streak counts only if there was activity today or yesterday.
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = startOfDay(subDays(new Date(cursor), 1)).getTime();
  }
  return streak;
}

/** First incomplete lesson in an in-progress module, else first incomplete lesson. */
export function pickRecommendedLesson(
  lessons: Lesson[],
  inProgressModuleIds: Set<string>,
): Lesson | null {
  return (
    lessons
      .filter(
        (l) => inProgressModuleIds.has(l.moduleId) && l.status !== 'completed',
      )
      .sort((a, b) => a.order - b.order)[0] ??
    lessons
      .filter((l) => l.status !== 'completed')
      .sort((a, b) => a.order - b.order)[0] ??
    null
  );
}

/** Resume an in-progress lab, else the next not-started one. */
export function pickRecommendedLab(labs: Lab[]): Lab | null {
  return (
    labs
      .filter((l) => l.status === 'in-progress')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ??
    labs.filter((l) => l.status === 'not-started')[0] ??
    null
  );
}

export interface DashboardData {
  scores: {
    learningProgress: ReturnType<typeof learningProgressScore>;
    confidence: ReturnType<typeof backendConfidenceIndex>;
    systemDesign: ReturnType<typeof systemDesignReadinessScore>;
  };
  counts: {
    conceptsTotal: number;
    conceptsMastered: number;
    conceptsNeedingReview: number;
    labsTotal: number;
    labsCompleted: number;
    caseStudiesTotal: number;
    caseStudiesCompleted: number;
    dueReviews: number;
    modulesInProgress: number;
  };
  conceptStatusCounts: { status: string; count: number }[];
  conceptsByCategory: { category: ConceptCategory; count: number }[];
  difficultyDistribution: { difficulty: Difficulty; count: number }[];
  labCompletionByCategory: {
    category: ConceptCategory;
    completed: number;
    total: number;
  }[];
  weakness: ReturnType<typeof weaknessByCategory>;
  streak: number;
  timeThisWeekMinutes: number;
  timeSeries: { date: string; minutes: number }[];
  confidenceTrend: { date: string; value: number }[];
  modulesInProgress: Module[];
  caseStudiesInProgress: CaseStudy[];
  recommendedLesson: Lesson | null;
  recommendedLab: Lab | null;
}

export async function getDashboardData(
  now: Date = new Date(),
): Promise<DashboardData> {
  const [data, logs, moduleRows] = await Promise.all([
    getScoringData(),
    db.select().from(learningLogs),
    db.select().from(modulesTable),
  ]);

  const scores = {
    learningProgress: learningProgressScore(data),
    confidence: backendConfidenceIndex(data),
    systemDesign: systemDesignReadinessScore(data),
  };

  const conceptStatuses = [
    'not-started',
    'reading',
    'practicing',
    'understood',
    'needs-review',
    'mastered',
  ];
  const conceptStatusCounts = conceptStatuses.map((status) => ({
    status,
    count: data.concepts.filter((c) => c.status === status).length,
  }));

  const conceptsByCategory = conceptCategories
    .map((category) => ({
      category,
      count: data.concepts.filter((c) => c.category === category).length,
    }))
    .filter((c) => c.count > 0);

  const difficultyDistribution = difficulties.map((difficulty) => ({
    difficulty,
    count: data.concepts.filter((c) => c.difficulty === difficulty).length,
  }));

  const conceptCategoryById = new Map(
    data.concepts.map((c) => [c.id, c.category]),
  );
  const labCompletionByCategory = conceptCategories
    .map((category) => {
      const labsInCat = data.labs.filter(
        (l) =>
          l.relatedConceptId &&
          conceptCategoryById.get(l.relatedConceptId) === category,
      );
      return {
        category,
        completed: labsInCat.filter((l) => l.status === 'completed').length,
        total: labsInCat.length,
      };
    })
    .filter((c) => c.total > 0);

  const modules = moduleRows as Module[];
  const modulesInProgress = modules.filter((m) => m.status === 'in-progress');
  const caseStudiesInProgress = data.caseStudies.filter(
    (c) => c.status === 'designing' || c.status === 'needs-redesign',
  );

  // Recommend the first incomplete lesson in an in-progress module.
  const inProgressModuleIds = new Set(modulesInProgress.map((m) => m.id));
  const recommendedLesson = pickRecommendedLesson(
    data.lessons,
    inProgressModuleIds,
  );
  const recommendedLab = pickRecommendedLab(data.labs);

  // Time + confidence series from the learning log (last 14 entries by day).
  const weekAgo = subDays(now, 7);
  const timeThisWeekMinutes = logs
    .filter((l) => l.date >= weekAgo)
    .reduce((sum, l) => sum + l.timeSpentMinutes, 0);

  const sortedLogs = [...logs].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const timeSeries = sortedLogs.slice(-14).map((l) => ({
    date: format(l.date, 'MMM d'),
    minutes: l.timeSpentMinutes,
  }));

  let runningConfidence = 50;
  const confidenceTrend = sortedLogs.slice(-14).map((l) => {
    runningConfidence = Math.max(
      0,
      Math.min(100, runningConfidence + l.confidenceChange * 2),
    );
    return { date: format(l.date, 'MMM d'), value: runningConfidence };
  });

  const streak = computeStreak(
    logs.map((l) => l.date),
    now,
  );

  return {
    scores,
    counts: {
      conceptsTotal: data.concepts.length,
      conceptsMastered: data.concepts.filter((c) => c.status === 'mastered')
        .length,
      conceptsNeedingReview: data.concepts.filter(
        (c) => c.status === 'needs-review',
      ).length,
      labsTotal: data.labs.length,
      labsCompleted: data.labs.filter((l) => l.status === 'completed').length,
      caseStudiesTotal: data.caseStudies.length,
      caseStudiesCompleted: data.caseStudies.filter(
        (c) => c.status === 'completed',
      ).length,
      dueReviews: data.reviewCards.filter((c) => isDue(c, now)).length,
      modulesInProgress: modulesInProgress.length,
    },
    conceptStatusCounts,
    conceptsByCategory,
    difficultyDistribution,
    labCompletionByCategory,
    weakness: weaknessByCategory(data).slice(0, 8),
    streak,
    timeThisWeekMinutes,
    timeSeries,
    confidenceTrend,
    modulesInProgress,
    caseStudiesInProgress,
    recommendedLesson,
    recommendedLab,
  };
}
