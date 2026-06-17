import {
  caseStudyDomains,
  caseStudyStatuses,
  conceptCategories,
  conceptStatuses,
  decisionCategories,
  diagramTypes,
  difficulties,
  importances,
  labStatuses,
  labTypes,
  lessonStatuses,
  moduleStatuses,
  moduleTypes,
  projectStatuses,
  projectTypes,
  reviewConfidences,
  reviewDifficulties,
  reviewStatuses,
  snippetCategories,
  snippetLanguages,
} from '@/types/enums';
import {
  caseStudyDomainLabels,
  caseStudyStatusLabels,
  conceptCategoryLabels,
  conceptStatusLabels,
  decisionCategoryLabels,
  diagramTypeLabels,
  difficultyLabels,
  importanceLabels,
  labStatusLabels,
  labTypeLabels,
  lessonStatusLabels,
  moduleStatusLabels,
  moduleTypeLabels,
  projectStatusLabels,
  projectTypeLabels,
  reviewConfidenceLabels,
  reviewDifficultyLabels,
  reviewStatusLabels,
  snippetCategoryLabels,
  snippetLanguageLabels,
} from '@/lib/labels';

export interface Option {
  value: string;
  label: string;
}

function build<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): Option[] {
  return values.map((v) => ({ value: v, label: labels[v] }));
}

export const conceptCategoryOptions = build(conceptCategories, conceptCategoryLabels);
export const difficultyOptions = build(difficulties, difficultyLabels);
export const conceptStatusOptions = build(conceptStatuses, conceptStatusLabels);
export const importanceOptions = build(importances, importanceLabels);
export const moduleTypeOptions = build(moduleTypes, moduleTypeLabels);
export const moduleStatusOptions = build(moduleStatuses, moduleStatusLabels);
export const lessonStatusOptions = build(lessonStatuses, lessonStatusLabels);
export const labTypeOptions = build(labTypes, labTypeLabels);
export const labStatusOptions = build(labStatuses, labStatusLabels);
export const caseStudyDomainOptions = build(caseStudyDomains, caseStudyDomainLabels);
export const caseStudyStatusOptions = build(caseStudyStatuses, caseStudyStatusLabels);
export const diagramTypeOptions = build(diagramTypes, diagramTypeLabels);
export const snippetLanguageOptions = build(snippetLanguages, snippetLanguageLabels);
export const snippetCategoryOptions = build(snippetCategories, snippetCategoryLabels);
export const decisionCategoryOptions = build(decisionCategories, decisionCategoryLabels);
export const projectTypeOptions = build(projectTypes, projectTypeLabels);
export const projectStatusOptions = build(projectStatuses, projectStatusLabels);
export const reviewDifficultyOptions = build(reviewDifficulties, reviewDifficultyLabels);
export const reviewConfidenceOptions = build(reviewConfidences, reviewConfidenceLabels);
export const reviewStatusOptions = build(reviewStatuses, reviewStatusLabels);
