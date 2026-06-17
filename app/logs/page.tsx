import Link from 'next/link';
import { NotebookPen, Pencil, Plus } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { listLearningLogsWithLinks } from '@/db/queries';
import { formatDate, formatMinutes } from '@/lib/format';

import { deleteLearningLogAction } from './actions';

export const metadata = { title: 'Learning Log' };

export default async function LogsPage() {
  const logs = await listLearningLogsWithLinks();

  return (
    <div>
      <PageHeader
        title="Learning Log"
        description="A running journal of what you studied, practiced, and got stuck on."
        actions={
          <Button render={<Link href="/logs/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New entry
          </Button>
        }
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No log entries yet"
          description="Capture your first learning session."
          action={
            <Button render={<Link href="/logs/new" />} variant="outline">
              New entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(log.date)}</span>
                    {log.timeSpentMinutes > 0 && <span>· {formatMinutes(log.timeSpentMinutes)}</span>}
                    {log.confidenceChange !== 0 && (
                      <ToneBadge tone={log.confidenceChange > 0 ? 'emerald' : 'rose'}>
                        {log.confidenceChange > 0 ? '+' : ''}
                        {log.confidenceChange} confidence
                      </ToneBadge>
                    )}
                  </div>
                  <h3 className="mt-1 font-medium">{log.title}</h3>
                  {log.summary && <p className="mt-1 text-sm text-muted-foreground">{log.summary}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon-sm" render={<Link href={`/logs/${log.id}/edit`} />} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteButton action={deleteLearningLogAction.bind(null, log.id)} entity="log entry" iconOnly />
                </div>
              </div>
              {(log.concepts.length > 0 || log.labs.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {log.concepts.map((c) => (
                    <Link key={c.id} href={`/concepts/${c.slug}`}>
                      <ToneBadge tone="violet">{c.title}</ToneBadge>
                    </Link>
                  ))}
                  {log.labs.map((l) => (
                    <Link key={l.id} href={`/labs/${l.slug}`}>
                      <ToneBadge tone="teal">{l.title}</ToneBadge>
                    </Link>
                  ))}
                </div>
              )}
              {log.nextStep && (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">Next:</span> {log.nextStep}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
