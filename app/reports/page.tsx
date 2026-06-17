import Link from 'next/link';
import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  FlaskConical,
  Layers,
  ListChecks,
  Server,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { isSameMonth, subDays } from 'date-fns';

import { ToneBadge } from '@/components/common/badges';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { ScorePanel } from '@/components/dashboard/score-panel';
import { Button } from '@/components/ui/button';
import { getScoringData, listLearningLogs } from '@/db/queries';
import { conceptCategoryLabels } from '@/lib/labels';
import { formatDate, formatMinutes } from '@/lib/format';
import { isDue } from '@/lib/review-scheduler';
import {
  backendConfidenceIndex,
  conceptStatusWeight,
  learningProgressScore,
  projectBackendReadiness,
  projectReadinessSignals,
  systemDesignReadinessScore,
  weaknessByCategory,
} from '@/lib/scoring';
import type { ConceptCategory } from '@/types/enums';

export const metadata = { title: 'Reports' };

const SERVERLESS_CATEGORIES: ConceptCategory[] = ['serverless', 'queue', 'background-jobs'];

export default async function ReportsPage() {
  const now = new Date();
  const [data, logs] = await Promise.all([getScoringData(), listLearningLogs()]);

  const scores = {
    learningProgress: learningProgressScore(data),
    confidence: backendConfidenceIndex(data),
    systemDesign: systemDesignReadinessScore(data),
  };

  const weekAgo = subDays(now, 7);
  const weekLogs = logs.filter((l) => l.date >= weekAgo);
  const weekMinutes = weekLogs.reduce((s, l) => s + l.timeSpentMinutes, 0);
  const weekConcepts = new Set(weekLogs.flatMap((l) => l.conceptIds));
  const weekLabs = new Set(weekLogs.flatMap((l) => l.labIds));
  const nextSteps = weekLogs.map((l) => l.nextStep).filter(Boolean).slice(0, 4);

  const masteredThisMonth = data.concepts.filter(
    (c) => c.status === 'mastered' && isSameMonth(c.updatedAt, now),
  );
  const labsThisMonth = data.labs.filter(
    (l) => l.status === 'completed' && isSameMonth(l.updatedAt, now),
  );

  const weakness = weaknessByCategory(data).slice(0, 6);

  const studied = new Set(
    data.concepts.filter((c) => conceptStatusWeight[c.status] >= 0.8).map((c) => c.id),
  );
  const projectReadiness = data.projects
    .map((p) => ({
      project: p,
      ...projectBackendReadiness(projectReadinessSignals(p, data.diagrams, studied)),
    }))
    .sort((a, b) => b.score - a.score);

  const serverlessConcepts = data.concepts.filter((c) =>
    SERVERLESS_CATEGORIES.includes(c.category),
  );
  const serverlessMaturity =
    serverlessConcepts.length > 0
      ? Math.round(
          (serverlessConcepts.reduce((s, c) => s + conceptStatusWeight[c.status], 0) /
            serverlessConcepts.length) *
            100,
        )
      : 0;

  const needsReview = data.concepts.filter((c) => c.status === 'needs-review');
  const lowConfidenceCards = data.reviewCards.filter((r) => r.confidence === 'low');

  // --- Weekly review signals -----------------------------------------------
  const masteredThisWeek = data.concepts.filter(
    (c) => c.status === 'mastered' && c.updatedAt >= weekAgo,
  );
  const lessonsCompletedThisWeek = data.lessons.filter(
    (l) => l.status === 'completed' && l.updatedAt >= weekAgo,
  );
  const labsCompletedThisWeek = data.labs.filter(
    (l) => l.status === 'completed' && l.updatedAt >= weekAgo,
  );
  const improvedCount =
    masteredThisWeek.length +
    lessonsCompletedThisWeek.length +
    labsCompletedThisWeek.length;
  const blockersThisWeek = weekLogs.filter((l) => l.blockers.trim().length > 0);

  const dueReviews = data.reviewCards.filter((c) => isDue(c, now));
  const staleThreshold = subDays(now, 3);
  const staleReviews = dueReviews.filter(
    (c) => new Date(c.nextReviewAt) < staleThreshold,
  );

  const lowestReadiness = projectReadiness[projectReadiness.length - 1];
  const focusNextWeek: string[] = [];
  if (weakness[0])
    focusNextWeek.push(
      `Shore up ${conceptCategoryLabels[weakness[0].category]} — your weakest area`,
    );
  if (needsReview[0])
    focusNextWeek.push(`Re-study “${needsReview[0].title}”, flagged for review`);
  if (dueReviews.length > 0)
    focusNextWeek.push(
      `Clear ${dueReviews.length} due review card${dueReviews.length > 1 ? 's' : ''}`,
    );
  if (lowestReadiness && lowestReadiness.score < 100)
    focusNextWeek.push(
      `Raise ${lowestReadiness.project.projectName} readiness (${lowestReadiness.satisfied}/${lowestReadiness.total})`,
    );
  const focusTop = focusNextWeek.slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekly review"
        description="What moved this week, what's gone stale, and where to point next week."
        actions={
          <Button render={<Link href="/logs/new" />} className="gap-1.5">
            <CalendarPlus className="size-4" />
            Plan next week
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ScorePanel title="Learning Progress" breakdown={scores.learningProgress} icon={TrendingUp} />
        <ScorePanel title="Backend Confidence" breakdown={scores.confidence} icon={Target} />
        <ScorePanel title="System Design Readiness" breakdown={scores.systemDesign} icon={Layers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="This week" icon={TrendingUp}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{formatMinutes(weekMinutes)}</p>
              <p className="text-xs text-muted-foreground">studied</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{weekConcepts.size}</p>
              <p className="text-xs text-muted-foreground">concepts touched</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{weekLabs.size}</p>
              <p className="text-xs text-muted-foreground">labs done</p>
            </div>
          </div>
          {nextSteps.length > 0 && (
            <div className="mt-4 border-t border-border/70 pt-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next week&apos;s focus</p>
              <ul className="space-y-1 text-sm text-foreground/90">
                {nextSteps.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        <SectionCard title="This month" icon={CheckCircle2}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold">{masteredThisMonth.length}</p>
              <p className="text-xs text-muted-foreground">concepts mastered</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{labsThisMonth.length}</p>
              <p className="text-xs text-muted-foreground">labs completed</p>
            </div>
          </div>
          {masteredThisMonth.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {masteredThisMonth.slice(0, 10).map((c) => (
                <Link key={c.id} href={`/concepts/${c.slug}`}>
                  <ToneBadge tone="emerald">{c.title}</ToneBadge>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="What improved this week" icon={Sparkles}>
          {improvedCount > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">{masteredThisWeek.length}</p>
                  <p className="text-xs text-muted-foreground">concepts mastered</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{lessonsCompletedThisWeek.length}</p>
                  <p className="text-xs text-muted-foreground">lessons done</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{labsCompletedThisWeek.length}</p>
                  <p className="text-xs text-muted-foreground">labs done</p>
                </div>
              </div>
              {masteredThisWeek.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
                  {masteredThisWeek.slice(0, 10).map((c) => (
                    <Link key={c.id} href={`/concepts/${c.slug}`}>
                      <ToneBadge tone="emerald">{c.title}</ToneBadge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing completed yet this week — a good week to finish one lesson or lab.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Blockers this week" icon={AlertTriangle}>
          {blockersThisWeek.length > 0 ? (
            <ul className="space-y-3">
              {blockersThisWeek.map((l) => (
                <li key={l.id} className="text-sm">
                  <p className="text-foreground/90">{l.blockers}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(l.date)} · {l.title}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No blockers logged this week.
            </p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Weakest categories" icon={Target}>
          <ul className="space-y-2.5">
            {weakness.map((w) => (
              <li key={w.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <Link href={`/concepts?category=${w.category}`} className="hover:text-primary">
                    {conceptCategoryLabels[w.category]}
                  </Link>
                  <span className="tabular-nums text-muted-foreground">{w.weakness}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-rose-400/70" style={{ width: `${w.weakness}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Project readiness" icon={FlaskConical}>
          {projectReadiness.length > 0 ? (
            <ul className="space-y-2.5">
              {projectReadiness.map(({ project, score, satisfied, total }) => (
                <li key={project.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/projects/${project.id}`} className="hover:text-primary">
                      {project.projectName}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">
                      {satisfied}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${score}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Stale & overdue" icon={AlertTriangle}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Review cards due</span>
              <Link href="/reviews" className="font-medium tabular-nums hover:text-primary">
                {dueReviews.length}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overdue 3+ days</span>
              <span
                className={`font-medium tabular-nums ${staleReviews.length > 0 ? 'text-rose-300' : ''}`}
              >
                {staleReviews.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Concepts flagged for review</span>
              <span className="font-medium tabular-nums">{needsReview.length}</span>
            </div>
            {dueReviews.length > 0 && (
              <Link href="/reviews" className="inline-block pt-1 text-primary hover:underline">
                Run a review session →
              </Link>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Focus for next week" icon={ListChecks}>
          {focusTop.length > 0 ? (
            <ol className="space-y-2.5">
              {focusTop.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">
              You&apos;re in good shape — pick a new concept or lab to push forward.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/logs/new" />}
            className="mt-4 gap-1.5"
          >
            <CalendarPlus className="size-4" />
            Capture this in a log
          </Button>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Serverless maturity" icon={Server}>
          <div className="flex items-center gap-4">
            <p className="text-3xl font-semibold tabular-nums">{serverlessMaturity}</p>
            <p className="text-sm text-muted-foreground">
              Average mastery across serverless, queues, and background jobs ({serverlessConcepts.length} concepts).
              When this is high and you have a queue-based workflow, you&apos;re ready to judge the serverless-to-dedicated migration.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="What I still misunderstand" icon={Target}>
          {needsReview.length > 0 || lowConfidenceCards.length > 0 ? (
            <div className="space-y-3">
              {needsReview.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300/80">
                    Concepts flagged for review
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {needsReview.map((c) => (
                      <Link key={c.id} href={`/concepts/${c.slug}`}>
                        <ToneBadge tone="amber">{c.title}</ToneBadge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {lowConfidenceCards.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {lowConfidenceCards.length} review card{lowConfidenceCards.length > 1 ? 's' : ''} still at low confidence.{' '}
                  <Link href="/reviews" className="text-primary hover:underline">
                    Review now
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing flagged — solid.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
