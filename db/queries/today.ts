import { subDays } from 'date-fns';

import { db } from '@/db';
import { learningLogs, modules as modulesTable } from '@/db/schema';
import {
  conceptStatusWeight,
  weaknessByCategory,
  type CategoryWeakness,
} from '@/lib/scoring';
import { type Importance } from '@/types/enums';
import type { Concept, Lab, Lesson, Module, Project } from '@/types';

import {
  computeStreak,
  getScoringData,
  pickRecommendedLab,
  pickRecommendedLesson,
} from './dashboard';
import { listDueReviewCards, type ReviewCardWithRelations } from './reviews';

const importanceRank: Record<Importance, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export interface TodayData {
  dueReviews: ReviewCardWithRelations[];
  recommendedLesson: Lesson | null;
  recommendedLessonModule: Module | null;
  recommendedLab: Lab | null;
  weakConcepts: Concept[];
  weakCategories: CategoryWeakness[];
  projects: Project[];
  streak: number;
  timeThisWeekMinutes: number;
  lessonsRemaining: number;
  labsRemaining: number;
}

/**
 * Everything the "Today" page needs to answer *what should I do next?* —
 * reuses the dashboard's recommendation helpers and the scoring engine so the
 * two pages never drift apart.
 */
export async function getTodayData(now: Date = new Date()): Promise<TodayData> {
  const [data, dueReviews, moduleRows, logs] = await Promise.all([
    getScoringData(),
    listDueReviewCards(now),
    db.select().from(modulesTable),
    db.select().from(learningLogs),
  ]);

  const modules = moduleRows as Module[];
  const inProgressModuleIds = new Set(
    modules.filter((m) => m.status === 'in-progress').map((m) => m.id),
  );
  const recommendedLesson = pickRecommendedLesson(
    data.lessons,
    inProgressModuleIds,
  );
  const recommendedLessonModule = recommendedLesson
    ? (modules.find((m) => m.id === recommendedLesson.moduleId) ?? null)
    : null;
  const recommendedLab = pickRecommendedLab(data.labs);

  const weakCategories = weaknessByCategory(data).slice(0, 3);
  const weakCategorySet = new Set(weakCategories.map((w) => w.category));

  // Concepts worth a study block now: flagged for review first, then those in
  // the weakest categories, then the least-learned high-importance ones.
  const weakConcepts = data.concepts
    .filter((c) => conceptStatusWeight[c.status] < 0.8)
    .sort((a, b) => {
      const aReview = a.status === 'needs-review' ? 0 : 1;
      const bReview = b.status === 'needs-review' ? 0 : 1;
      if (aReview !== bReview) return aReview - bReview;
      const aCat = weakCategorySet.has(a.category) ? 0 : 1;
      const bCat = weakCategorySet.has(b.category) ? 0 : 1;
      if (aCat !== bCat) return aCat - bCat;
      const sw = conceptStatusWeight[a.status] - conceptStatusWeight[b.status];
      if (sw !== 0) return sw;
      return importanceRank[a.importance] - importanceRank[b.importance];
    })
    .slice(0, 6);

  const projects = data.projects
    .filter((p) => p.status === 'active')
    .slice(0, 5);

  const weekAgo = subDays(now, 7);
  const timeThisWeekMinutes = logs
    .filter((l) => l.date >= weekAgo)
    .reduce((sum, l) => sum + l.timeSpentMinutes, 0);
  const streak = computeStreak(
    logs.map((l) => l.date),
    now,
  );

  return {
    dueReviews,
    recommendedLesson,
    recommendedLessonModule,
    recommendedLab,
    weakConcepts,
    weakCategories,
    projects,
    streak,
    timeThisWeekMinutes,
    lessonsRemaining: data.lessons.filter((l) => l.status !== 'completed')
      .length,
    labsRemaining: data.labs.filter(
      (l) => l.status === 'not-started' || l.status === 'in-progress',
    ).length,
  };
}
