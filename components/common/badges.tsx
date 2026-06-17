import { cn } from '@/lib/utils';
import {
  caseStudyStatusLabels,
  caseStudyStatusTones,
  conceptCategoryLabels,
  conceptCategoryTones,
  conceptStatusLabels,
  conceptStatusTones,
  difficultyLabels,
  difficultyTones,
  importanceLabels,
  importanceTones,
  labStatusLabels,
  labStatusTones,
  labTypeLabels,
  lessonStatusLabels,
  lessonStatusTones,
  moduleStatusLabels,
  moduleStatusTones,
  projectStatusLabels,
  projectStatusTones,
  reviewConfidenceLabels,
  reviewConfidenceTones,
  toneBadgeClasses,
  toneDotClasses,
  type Tone,
} from '@/lib/labels';
import type {
  CaseStudyStatus,
  ConceptCategory,
  ConceptStatus,
  Difficulty,
  Importance,
  LabStatus,
  LabType,
  LessonStatus,
  ModuleStatus,
  ProjectStatus,
  ReviewConfidence,
} from '@/types/enums';

export function ToneBadge({
  tone,
  children,
  dot = false,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        toneBadgeClasses[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', toneDotClasses[tone])} />}
      {children}
    </span>
  );
}

export function ConceptStatusBadge({ status }: { status: ConceptStatus }) {
  return (
    <ToneBadge tone={conceptStatusTones[status]} dot>
      {conceptStatusLabels[status]}
    </ToneBadge>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <ToneBadge tone={difficultyTones[difficulty]}>{difficultyLabels[difficulty]}</ToneBadge>;
}

export function ImportanceBadge({ importance }: { importance: Importance }) {
  return <ToneBadge tone={importanceTones[importance]}>{importanceLabels[importance]}</ToneBadge>;
}

export function CategoryBadge({ category }: { category: ConceptCategory }) {
  return (
    <ToneBadge tone={conceptCategoryTones[category]}>
      {conceptCategoryLabels[category]}
    </ToneBadge>
  );
}

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  return <ToneBadge tone={moduleStatusTones[status]} dot>{moduleStatusLabels[status]}</ToneBadge>;
}

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  return <ToneBadge tone={lessonStatusTones[status]} dot>{lessonStatusLabels[status]}</ToneBadge>;
}

export function LabStatusBadge({ status }: { status: LabStatus }) {
  return <ToneBadge tone={labStatusTones[status]} dot>{labStatusLabels[status]}</ToneBadge>;
}

export function LabTypeBadge({ labType }: { labType: LabType }) {
  return <ToneBadge tone="violet">{labTypeLabels[labType]}</ToneBadge>;
}

export function CaseStudyStatusBadge({ status }: { status: CaseStudyStatus }) {
  return (
    <ToneBadge tone={caseStudyStatusTones[status]} dot>
      {caseStudyStatusLabels[status]}
    </ToneBadge>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <ToneBadge tone={projectStatusTones[status]} dot>{projectStatusLabels[status]}</ToneBadge>;
}

export function ReviewConfidenceBadge({ confidence }: { confidence: ReviewConfidence }) {
  return (
    <ToneBadge tone={reviewConfidenceTones[confidence]}>
      {reviewConfidenceLabels[confidence]}
    </ToneBadge>
  );
}
