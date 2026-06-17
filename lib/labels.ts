/**
 * Human-readable labels and visual "tones" for every taxonomy value.
 * UI components (e.g. <StatusBadge>) map a Tone to concrete classes, so the
 * palette stays in one place.
 */
import type {
  CaseStudyDomain,
  CaseStudyStatus,
  ConceptCategory,
  ConceptStatus,
  DecisionCategory,
  DiagramType,
  Difficulty,
  Importance,
  LabStatus,
  LabType,
  LessonStatus,
  ModuleStatus,
  ModuleType,
  ProjectStatus,
  ProjectType,
  ReviewConfidence,
  ReviewDifficulty,
  ReviewStatus,
  SnippetCategory,
  SnippetLanguage,
} from '@/types/enums';

export type Tone =
  | 'slate'
  | 'violet'
  | 'sky'
  | 'teal'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'blue';

export const conceptCategoryLabels: Record<ConceptCategory, string> = {
  'api-design': 'API Design',
  database: 'Database',
  caching: 'Caching',
  queue: 'Queues',
  'background-jobs': 'Background Jobs',
  auth: 'Auth',
  security: 'Security',
  'rate-limiting': 'Rate Limiting',
  observability: 'Observability',
  reliability: 'Reliability',
  scalability: 'Scalability',
  serverless: 'Serverless',
  'distributed-systems': 'Distributed Systems',
  'architecture-pattern': 'Architecture Patterns',
  'system-design': 'System Design',
  devops: 'DevOps',
  storage: 'Storage',
  testing: 'Testing',
  other: 'Other',
};

export const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const difficultyTones: Record<Difficulty, Tone> = {
  beginner: 'emerald',
  intermediate: 'amber',
  advanced: 'rose',
};

export const conceptStatusLabels: Record<ConceptStatus, string> = {
  'not-started': 'Not started',
  reading: 'Reading',
  practicing: 'Practicing',
  understood: 'Understood',
  'needs-review': 'Needs review',
  mastered: 'Mastered',
};

export const conceptStatusTones: Record<ConceptStatus, Tone> = {
  'not-started': 'slate',
  reading: 'sky',
  practicing: 'blue',
  understood: 'teal',
  'needs-review': 'amber',
  mastered: 'emerald',
};

export const importanceLabels: Record<Importance, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const importanceTones: Record<Importance, Tone> = {
  low: 'slate',
  medium: 'sky',
  high: 'amber',
  critical: 'rose',
};

export const moduleTypeLabels: Record<ModuleType, string> = {
  fundamentals: 'Fundamentals',
  'practical-backend': 'Practical SaaS Backend',
  'architecture-patterns': 'Architecture Patterns',
  'database-deep-dive': 'Database Deep Dive',
  reliability: 'Reliability & Observability',
  security: 'Security',
  'system-design': 'System Design',
  'serverless-to-traditional-backend': 'Serverless → Traditional Backend',
  'project-application': 'Project Application',
};

export const moduleStatusLabels: Record<ModuleStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
  paused: 'Paused',
};

export const moduleStatusTones: Record<ModuleStatus, Tone> = {
  'not-started': 'slate',
  'in-progress': 'blue',
  completed: 'emerald',
  paused: 'amber',
};

export const lessonStatusLabels: Record<LessonStatus, string> = {
  'not-started': 'Not started',
  reading: 'Reading',
  completed: 'Completed',
  'needs-review': 'Needs review',
};

export const lessonStatusTones: Record<LessonStatus, Tone> = {
  'not-started': 'slate',
  reading: 'sky',
  completed: 'emerald',
  'needs-review': 'amber',
};

export const labTypeLabels: Record<LabType, string> = {
  implement: 'Implement',
  debug: 'Debug',
  design: 'Design',
  compare: 'Compare',
  refactor: 'Refactor',
  benchmark: 'Benchmark',
  'incident-analysis': 'Incident Analysis',
};

export const labStatusLabels: Record<LabStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
  skipped: 'Skipped',
};

export const labStatusTones: Record<LabStatus, Tone> = {
  'not-started': 'slate',
  'in-progress': 'blue',
  completed: 'emerald',
  skipped: 'rose',
};

export const caseStudyDomainLabels: Record<CaseStudyDomain, string> = {
  travel: 'Travel',
  'freelancer-tools': 'Freelancer Tools',
  'ai-cost-monitoring': 'AI Cost Monitoring',
  'developer-tools': 'Developer Tools',
  'content-platform': 'Content Platform',
  finance: 'Finance',
  'generic-saas': 'Generic SaaS',
  'internal-tool': 'Internal Tool',
  other: 'Other',
};

export const caseStudyStatusLabels: Record<CaseStudyStatus, string> = {
  'not-started': 'Not started',
  designing: 'Designing',
  reviewed: 'Reviewed',
  completed: 'Completed',
  'needs-redesign': 'Needs redesign',
};

export const caseStudyStatusTones: Record<CaseStudyStatus, Tone> = {
  'not-started': 'slate',
  designing: 'blue',
  reviewed: 'teal',
  completed: 'emerald',
  'needs-redesign': 'amber',
};

export const diagramTypeLabels: Record<DiagramType, string> = {
  'c4-context': 'C4 — Context',
  'c4-container': 'C4 — Container',
  'c4-component': 'C4 — Component',
  sequence: 'Sequence',
  'data-flow': 'Data Flow',
  deployment: 'Deployment',
  'entity-relationship': 'Entity Relationship',
  'queue-flow': 'Queue Flow',
  'incident-flow': 'Incident Flow',
  custom: 'Custom',
};

export const snippetLanguageLabels: Record<SnippetLanguage, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  sql: 'SQL',
  python: 'Python',
  pseudo: 'Pseudocode',
  bash: 'Bash',
  yaml: 'YAML',
  other: 'Other',
};

export const snippetCategoryLabels: Record<SnippetCategory, string> = {
  api: 'API',
  auth: 'Auth',
  database: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  'rate-limit': 'Rate Limit',
  webhook: 'Webhook',
  testing: 'Testing',
  deployment: 'Deployment',
  observability: 'Observability',
  security: 'Security',
  other: 'Other',
};

export const decisionCategoryLabels: Record<DecisionCategory, string> = {
  architecture: 'Architecture',
  database: 'Database',
  caching: 'Caching',
  queue: 'Queue',
  auth: 'Auth',
  deployment: 'Deployment',
  api: 'API',
  scaling: 'Scaling',
  storage: 'Storage',
  observability: 'Observability',
  security: 'Security',
  other: 'Other',
};

export const projectTypeLabels: Record<ProjectType, string> = {
  smarttrips: 'SmartTrips',
  duekind: 'DueKind',
  burncap: 'BurnCap',
  mergeattest: 'MergeAttest',
  aegisrail: 'AegisRail',
  podcut: 'PodCut',
  eastbase: 'Eastbase Studio',
  'internal-tool': 'Internal Tool',
  other: 'Other',
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
};

export const projectStatusTones: Record<ProjectStatus, Tone> = {
  active: 'emerald',
  paused: 'amber',
  archived: 'slate',
};

export const reviewDifficultyLabels: Record<ReviewDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const reviewConfidenceLabels: Record<ReviewConfidence, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const reviewConfidenceTones: Record<ReviewConfidence, Tone> = {
  low: 'rose',
  medium: 'amber',
  high: 'emerald',
};

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  mastered: 'Mastered',
};

/** Tailwind class sets per tone, used by badges and chips. */
export const toneBadgeClasses: Record<Tone, string> = {
  slate: 'bg-slate-500/12 text-slate-300 border-slate-500/25',
  violet: 'bg-violet-500/12 text-violet-300 border-violet-500/25',
  sky: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
  blue: 'bg-blue-500/12 text-blue-300 border-blue-500/25',
  teal: 'bg-teal-500/12 text-teal-300 border-teal-500/25',
  amber: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
  emerald: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
  rose: 'bg-rose-500/12 text-rose-300 border-rose-500/25',
};

export const toneDotClasses: Record<Tone, string> = {
  slate: 'bg-slate-400',
  violet: 'bg-violet-400',
  sky: 'bg-sky-400',
  blue: 'bg-blue-400',
  teal: 'bg-teal-400',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  rose: 'bg-rose-400',
};

/** Stable tone per concept category, for the concept map and category chips. */
export const conceptCategoryTones: Record<ConceptCategory, Tone> = {
  'api-design': 'violet',
  database: 'sky',
  caching: 'teal',
  queue: 'amber',
  'background-jobs': 'amber',
  auth: 'rose',
  security: 'rose',
  'rate-limiting': 'violet',
  observability: 'blue',
  reliability: 'blue',
  scalability: 'teal',
  serverless: 'violet',
  'distributed-systems': 'sky',
  'architecture-pattern': 'violet',
  'system-design': 'teal',
  devops: 'blue',
  storage: 'sky',
  testing: 'emerald',
  other: 'slate',
};
