/**
 * Central taxonomy for the Backend Architecture Lab.
 *
 * These are intentionally plain `as const` arrays rather than Postgres enums:
 * - They feed Zod validation, Drizzle column `$type`, and UI dropdowns from one source.
 * - Adding a new value never requires a database migration.
 *
 * Human-readable labels live in `lib/labels.ts`.
 */

export const conceptCategories = [
  'api-design',
  'database',
  'caching',
  'queue',
  'background-jobs',
  'auth',
  'security',
  'rate-limiting',
  'observability',
  'reliability',
  'scalability',
  'serverless',
  'distributed-systems',
  'architecture-pattern',
  'system-design',
  'devops',
  'storage',
  'testing',
  'other',
] as const;
export type ConceptCategory = (typeof conceptCategories)[number];

export const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof difficulties)[number];

export const conceptStatuses = [
  'not-started',
  'reading',
  'practicing',
  'understood',
  'needs-review',
  'mastered',
] as const;
export type ConceptStatus = (typeof conceptStatuses)[number];

export const importances = ['low', 'medium', 'high', 'critical'] as const;
export type Importance = (typeof importances)[number];

export const moduleTypes = [
  'fundamentals',
  'practical-backend',
  'architecture-patterns',
  'database-deep-dive',
  'reliability',
  'security',
  'system-design',
  'serverless-to-traditional-backend',
  'project-application',
] as const;
export type ModuleType = (typeof moduleTypes)[number];

export const moduleStatuses = [
  'not-started',
  'in-progress',
  'completed',
  'paused',
] as const;
export type ModuleStatus = (typeof moduleStatuses)[number];

export const lessonStatuses = [
  'not-started',
  'reading',
  'completed',
  'needs-review',
] as const;
export type LessonStatus = (typeof lessonStatuses)[number];

export const labTypes = [
  'implement',
  'debug',
  'design',
  'compare',
  'refactor',
  'benchmark',
  'incident-analysis',
] as const;
export type LabType = (typeof labTypes)[number];

export const labStatuses = [
  'not-started',
  'in-progress',
  'completed',
  'skipped',
] as const;
export type LabStatus = (typeof labStatuses)[number];

export const caseStudyDomains = [
  'travel',
  'freelancer-tools',
  'ai-cost-monitoring',
  'developer-tools',
  'content-platform',
  'finance',
  'generic-saas',
  'internal-tool',
  'other',
] as const;
export type CaseStudyDomain = (typeof caseStudyDomains)[number];

export const caseStudyStatuses = [
  'not-started',
  'designing',
  'reviewed',
  'completed',
  'needs-redesign',
] as const;
export type CaseStudyStatus = (typeof caseStudyStatuses)[number];

export const diagramTypes = [
  'c4-context',
  'c4-container',
  'c4-component',
  'sequence',
  'data-flow',
  'deployment',
  'entity-relationship',
  'queue-flow',
  'incident-flow',
  'custom',
] as const;
export type DiagramType = (typeof diagramTypes)[number];

export const snippetLanguages = [
  'typescript',
  'javascript',
  'sql',
  'python',
  'pseudo',
  'bash',
  'yaml',
  'other',
] as const;
export type SnippetLanguage = (typeof snippetLanguages)[number];

export const snippetCategories = [
  'api',
  'auth',
  'database',
  'cache',
  'queue',
  'rate-limit',
  'webhook',
  'testing',
  'deployment',
  'observability',
  'security',
  'other',
] as const;
export type SnippetCategory = (typeof snippetCategories)[number];

export const decisionCategories = [
  'architecture',
  'database',
  'caching',
  'queue',
  'auth',
  'deployment',
  'api',
  'scaling',
  'storage',
  'observability',
  'security',
  'other',
] as const;
export type DecisionCategory = (typeof decisionCategories)[number];

export const projectTypes = [
  'smarttrips',
  'duekind',
  'burncap',
  'mergeattest',
  'aegisrail',
  'podcut',
  'eastbase',
  'internal-tool',
  'other',
] as const;
export type ProjectType = (typeof projectTypes)[number];

export const projectStatuses = ['active', 'paused', 'archived'] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const reviewDifficulties = ['easy', 'medium', 'hard'] as const;
export type ReviewDifficulty = (typeof reviewDifficulties)[number];

export const reviewConfidences = ['low', 'medium', 'high'] as const;
export type ReviewConfidence = (typeof reviewConfidences)[number];

export const reviewStatuses = ['active', 'suspended', 'mastered'] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

/** Grades the user gives a card during a review session (drives scheduling). */
export const reviewGrades = ['forgot', 'shaky', 'good', 'easy'] as const;
export type ReviewGrade = (typeof reviewGrades)[number];
