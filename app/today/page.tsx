import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  FlaskConical,
  GraduationCap,
  Rocket,
  Sparkles,
  Target,
} from 'lucide-react';

import {
  ConceptStatusBadge,
  LabStatusBadge,
  ToneBadge,
} from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatCard } from '@/components/common/stat-card';
import { ReviewSession } from '@/components/reviews/review-session';
import { getTodayData } from '@/db/queries';
import { conceptCategoryLabels } from '@/lib/labels';
import { formatMinutes } from '@/lib/format';

export const metadata = { title: 'Today' };

export default async function TodayPage() {
  const data = await getTodayData();

  const hasContent =
    data.dueReviews.length > 0 ||
    data.recommendedLesson ||
    data.recommendedLab ||
    data.weakConcepts.length > 0;

  if (!hasContent) {
    return (
      <div>
        <PageHeader
          eyebrow="Today"
          title="Your study session"
          description="What to do next, in one place."
        />
        <EmptyState
          icon={Sparkles}
          title="Nothing queued"
          description="Seed the lab or start a learning path, then come back — this page will tell you exactly what to work on next."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${data.streak}-day streak · ${formatMinutes(data.timeThisWeekMinutes)} this week`}
        title="Today"
        description="Your next 30–60 minutes of backend learning, in priority order."
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Reviews due" value={data.dueReviews.length} icon={Brain} tone="rose" />
        <StatCard label="Lessons left" value={data.lessonsRemaining} icon={GraduationCap} tone="sky" />
        <StatCard label="Labs to do" value={data.labsRemaining} icon={FlaskConical} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Start here: clear due reviews */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">1 · Clear your due reviews</h2>
            {data.dueReviews.length > 0 && (
              <Link href="/reviews" className="text-xs text-primary hover:underline">
                Review center
              </Link>
            )}
          </div>
          <ReviewSession cards={data.dueReviews} />
        </div>

        {/* Up next: a lesson and a lab */}
        <div className="space-y-4">
          <SectionCard title="2 · Continue learning" icon={GraduationCap}>
            {data.recommendedLesson ? (
              <Link href={`/lessons/${data.recommendedLesson.slug}`} className="group block">
                {data.recommendedLessonModule && (
                  <p className="text-xs text-muted-foreground">
                    {data.recommendedLessonModule.title}
                  </p>
                )}
                <p className="mt-0.5 font-medium group-hover:text-primary">
                  {data.recommendedLesson.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {data.recommendedLesson.summary}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                  Open lesson <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No lessons queued. Nice work.</p>
            )}
          </SectionCard>

          <SectionCard title="3 · Get hands-on" icon={FlaskConical}>
            {data.recommendedLab ? (
              <Link href={`/labs/${data.recommendedLab.slug}`} className="group block">
                <div className="flex items-center gap-2">
                  <LabStatusBadge status={data.recommendedLab.status} />
                </div>
                <p className="mt-1.5 font-medium group-hover:text-primary">
                  {data.recommendedLab.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {data.recommendedLab.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                  Open lab <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No labs queued.</p>
            )}
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Study these next"
          description="Flagged for review or least solid — pick one to deepen"
          icon={Target}
        >
          {data.weakConcepts.length > 0 ? (
            <ul className="space-y-2">
              {data.weakConcepts.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/concepts/${c.slug}`}
                    className="group flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-sm group-hover:text-primary">{c.title}</span>
                    <ConceptStatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing weak right now — solid.</p>
          )}
        </SectionCard>

        <SectionCard
          title="Weakest areas"
          description="Categories pulling your readiness down"
          icon={Target}
        >
          {data.weakCategories.length > 0 ? (
            <ul className="space-y-2">
              {data.weakCategories.map((w) => (
                <li key={w.category}>
                  <Link
                    href={`/concepts?category=${w.category}`}
                    className="group flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="group-hover:text-primary">
                      {conceptCategoryLabels[w.category]}
                    </span>
                    <ToneBadge tone={w.weakness > 60 ? 'rose' : w.weakness > 35 ? 'amber' : 'slate'}>
                      {w.weakness}
                    </ToneBadge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Move a project forward"
        description="The next backend action waiting in your real products"
        icon={Rocket}
        actions={
          <Link href="/projects" className="text-xs text-primary hover:underline">
            All projects
          </Link>
        }
      >
        {data.projects.length > 0 ? (
          <ul className="space-y-3">
            {data.projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="group block">
                  <span className="text-sm font-medium group-hover:text-primary">
                    {p.projectName}
                  </span>
                  {p.nextBackendAction ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      Next: {p.nextBackendAction}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/70">No next action set.</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No active projects yet.</p>
        )}
      </SectionCard>
    </div>
  );
}
