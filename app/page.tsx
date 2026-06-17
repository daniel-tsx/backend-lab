import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Flame,
  FlaskConical,
  GraduationCap,
  Layers,
  Network,
  Rocket,
  Target,
  TrendingUp,
} from 'lucide-react';

import { CategoryBadge, ToneBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatCard } from '@/components/common/stat-card';
import {
  AreaTrend,
  CHART_COLORS,
  Donut,
  HorizontalBars,
  LineTrend,
  StackedBars,
} from '@/components/charts/chart-primitives';
import { ChartLegend, WeaknessHeatmap } from '@/components/charts/weakness-heatmap';
import { ScorePanel } from '@/components/dashboard/score-panel';
import { Button } from '@/components/ui/button';
import { getDashboardData, listProjects } from '@/db/queries';
import {
  conceptCategoryLabels,
  conceptStatusLabels,
  difficultyLabels,
  moduleStatusLabels,
} from '@/lib/labels';
import { formatMinutes } from '@/lib/format';
import type { ConceptStatus, Difficulty } from '@/types/enums';

export default async function DashboardPage() {
  const [data, projects] = await Promise.all([getDashboardData(), listProjects()]);
  const { counts, scores } = data;

  if (counts.conceptsTotal === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Backend Architecture Lab"
          title="Welcome to your learning cockpit"
          description="Your database is connected but empty. Seed it to populate concepts, labs, case studies, and more."
        />
        <EmptyState
          icon={Rocket}
          title="Seed your lab"
          description="Run pnpm db:push && pnpm db:seed in your terminal, then refresh. You'll get 56 concepts, 12 labs, 10 system-design cases, and a full learning path."
        />
      </div>
    );
  }

  const categoryData = data.conceptsByCategory.map((c) => ({
    label: conceptCategoryLabels[c.category],
    count: c.count,
  }));
  const statusData = data.conceptStatusCounts
    .filter((s) => s.count > 0)
    .map((s) => ({
      label: conceptStatusLabels[s.status as ConceptStatus],
      count: s.count,
    }));
  const difficultyData = data.difficultyDistribution
    .filter((d) => d.count > 0)
    .map((d) => ({
      label: difficultyLabels[d.difficulty as Difficulty],
      count: d.count,
    }));
  const labData = data.labCompletionByCategory.map((c) => ({
    label: conceptCategoryLabels[c.category],
    completed: c.completed,
    remaining: c.total - c.completed,
  }));
  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${data.streak}-day streak · ${formatMinutes(data.timeThisWeekMinutes)} this week`}
        title="Dashboard"
        description="Where your backend knowledge stands, and what to work on next."
        actions={
          <>
            <Button variant="outline" render={<Link href="/today" />} className="gap-1.5">
              <CalendarCheck className="size-4" />
              Today
            </Button>
            {counts.dueReviews > 0 ? (
              <Button render={<Link href="/reviews" />} className="gap-1.5">
                <Brain className="size-4" />
                Review {counts.dueReviews} due
              </Button>
            ) : (
              <Button variant="outline" render={<Link href="/reviews" />}>
                Review center
              </Button>
            )}
          </>
        }
      />

      {/* Scores */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ScorePanel
          title="Learning Progress"
          subtitle="Concepts, lessons, labs, and reviews"
          breakdown={scores.learningProgress}
          icon={TrendingUp}
        />
        <ScorePanel
          title="Backend Confidence"
          subtitle="How sure you are, backed by practice"
          breakdown={scores.confidence}
          icon={Target}
        />
        <ScorePanel
          title="System Design Readiness"
          subtitle="Casework, diagrams, and coverage"
          breakdown={scores.systemDesign}
          icon={Layers}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Concepts mastered" value={counts.conceptsMastered} hint={`of ${counts.conceptsTotal}`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Need review" value={counts.conceptsNeedingReview} icon={Brain} tone="amber" />
        <StatCard label="Labs completed" value={counts.labsCompleted} hint={`of ${counts.labsTotal}`} icon={FlaskConical} tone="violet" />
        <StatCard label="Cases completed" value={counts.caseStudiesCompleted} hint={`of ${counts.caseStudiesTotal}`} icon={Layers} tone="teal" />
        <StatCard label="Reviews due" value={counts.dueReviews} icon={Target} tone="rose" />
        <StatCard label="Day streak" value={data.streak} icon={Flame} tone="amber" />
      </div>

      {/* Up next */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Next lesson" icon={GraduationCap} className="lg:col-span-1">
          {data.recommendedLesson ? (
            <Link href={`/lessons/${data.recommendedLesson.slug}`} className="group block">
              <p className="font-medium group-hover:text-primary">{data.recommendedLesson.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{data.recommendedLesson.summary}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                Continue <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No lessons queued. Nice work.</p>
          )}
        </SectionCard>
        <SectionCard title="Next lab" icon={FlaskConical} className="lg:col-span-1">
          {data.recommendedLab ? (
            <Link href={`/labs/${data.recommendedLab.slug}`} className="group block">
              <p className="font-medium group-hover:text-primary">{data.recommendedLab.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{data.recommendedLab.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                Open lab <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No labs queued.</p>
          )}
        </SectionCard>
        <SectionCard title="Current focus" icon={Target} className="lg:col-span-1">
          {data.modulesInProgress.length > 0 ? (
            <ul className="space-y-2">
              {data.modulesInProgress.map((m) => (
                <li key={m.id}>
                  <Link href={`/modules/${m.slug}`} className="group flex items-center justify-between gap-2">
                    <span className="truncate text-sm group-hover:text-primary">{m.title}</span>
                    <ToneBadge tone="blue">{moduleStatusLabels[m.status]}</ToneBadge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No modules in progress. Pick a learning path.</p>
          )}
        </SectionCard>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Learning time" description="Minutes logged per study session">
          <AreaTrend data={data.timeSeries} xKey="date" dataKey="minutes" />
        </SectionCard>
        <SectionCard title="Confidence trend" description="Self-reported confidence over time">
          <LineTrend data={data.confidenceTrend} xKey="date" dataKey="value" />
        </SectionCard>
        <SectionCard title="Concepts by category">
          <HorizontalBars data={categoryData} categoryKey="label" valueKey="count" />
        </SectionCard>
        <SectionCard title="Lab completion by category">
          {labData.length > 0 ? (
            <>
              <StackedBars
                data={labData}
                categoryKey="label"
                keys={['completed', 'remaining']}
                colors={['var(--chart-2)', 'var(--muted)']}
              />
              <ChartLegend
                className="mt-2 px-2"
                items={[
                  { label: 'Completed', color: 'var(--chart-2)' },
                  { label: 'Remaining', color: 'var(--muted)' },
                ]}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Link labs to concepts to see this.</p>
          )}
        </SectionCard>
        <SectionCard title="Concepts by status">
          <div className="flex items-center gap-4">
            <Donut data={statusData} nameKey="label" valueKey="count" colors={CHART_COLORS} />
            <ChartLegend
              className="flex-col"
              items={statusData.map((s, i) => ({
                label: s.label,
                color: CHART_COLORS[i % CHART_COLORS.length],
                value: s.count,
              }))}
            />
          </div>
        </SectionCard>
        <SectionCard title="Difficulty distribution">
          <div className="flex items-center gap-4">
            <Donut data={difficultyData} nameKey="label" valueKey="count" colors={['var(--chart-2)', 'var(--chart-4)', 'var(--destructive)']} />
            <ChartLegend
              className="flex-col"
              items={difficultyData.map((d, i) => ({
                label: d.label,
                color: ['var(--chart-2)', 'var(--chart-4)', 'var(--destructive)'][i % 3],
                value: d.count,
              }))}
            />
          </div>
        </SectionCard>
      </div>

      {/* Weakness + apply */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Weakness heatmap"
          description="Categories needing attention (darker = weaker)"
          icon={Target}
        >
          <WeaknessHeatmap items={data.weakness} />
        </SectionCard>
        <SectionCard
          title="Apply to my projects"
          description="Backend work waiting in your real products"
          icon={Rocket}
          actions={
            <Link href="/projects" className="text-xs text-primary hover:underline">
              All projects
            </Link>
          }
        >
          {activeProjects.length > 0 ? (
            <ul className="space-y-3">
              {activeProjects.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="group block">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium group-hover:text-primary">{p.projectName}</span>
                    </div>
                    {p.nextBackendAction && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        Next: {p.nextBackendAction}
                      </p>
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

      {/* Cases in progress + map preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="System design in progress"
          icon={Layers}
          actions={
            <Link href="/case-studies" className="text-xs text-primary hover:underline">
              Casebook
            </Link>
          }
        >
          {data.caseStudiesInProgress.length > 0 ? (
            <ul className="space-y-2">
              {data.caseStudiesInProgress.map((c) => (
                <li key={c.id}>
                  <Link href={`/case-studies/${c.slug}`} className="group flex items-center justify-between gap-2">
                    <span className="truncate text-sm group-hover:text-primary">{c.title}</span>
                    <CategoryBadge category={'system-design'} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No cases in progress. Open the casebook.</p>
          )}
        </SectionCard>
        <SectionCard
          title="Architecture map"
          icon={Network}
          actions={
            <Link href="/concept-map" className="text-xs text-primary hover:underline">
              Open map
            </Link>
          }
        >
          <p className="text-sm text-muted-foreground">
            Explore how {counts.conceptsTotal} concepts connect — prerequisites, relationships, and what to learn next.
          </p>
          <Button variant="outline" render={<Link href="/concept-map" />} className="mt-4 gap-1.5">
            <Network className="size-4" />
            Open concept map
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}
