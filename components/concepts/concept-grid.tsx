'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import {
  bulkSetConceptStatusAction,
  setConceptStatusAction,
} from '@/app/concepts/actions';
import {
  CategoryBadge,
  ConceptStatusBadge,
  DifficultyBadge,
  ImportanceBadge,
  ToneBadge,
} from '@/components/common/badges';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { conceptStatusLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { conceptStatuses, type ConceptStatus } from '@/types/enums';
import type { Concept } from '@/types';

export function ConceptGrid({ concepts }: { concepts: Concept[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeStatus(id: string, status: ConceptStatus) {
    startTransition(async () => {
      const res = await setConceptStatusAction(id, status);
      if (res.ok) {
        toast.success('Status updated');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function bulkChange(status: ConceptStatus) {
    const ids = [...selected];
    startTransition(async () => {
      const res = await bulkSetConceptStatusAction(ids, status);
      if (res.ok) {
        toast.success(`Updated ${ids.length} concepts`);
        setSelected(new Set());
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {concepts.map((c) => (
          <div
            key={c.id}
            className={cn(
              'panel group flex flex-col gap-3 p-4 transition-colors hover:border-border',
              selected.has(c.id) && 'ring-1 ring-primary/50',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selected.has(c.id)}
                  onCheckedChange={() => toggle(c.id)}
                  className="mt-0.5"
                  aria-label={`Select ${c.title}`}
                />
                <Link href={`/concepts/${c.slug}`} className="font-medium leading-tight hover:text-primary">
                  {c.title}
                </Link>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button type="button" disabled={pending} className="shrink-0">
                      <ToneBadge tone="slate" className="gap-1">
                        {conceptStatusLabels[c.status]}
                        <ChevronDown className="size-3" />
                      </ToneBadge>
                    </button>
                  }
                />
                <DropdownMenuContent align="end">
                  {conceptStatuses.map((s) => (
                    <DropdownMenuItem key={s} onClick={() => changeStatus(c.id, s)}>
                      {conceptStatusLabels[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {c.summary && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{c.summary}</p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={c.category} />
              <DifficultyBadge difficulty={c.difficulty} />
              <ImportanceBadge importance={c.importance} />
            </div>
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-popover px-4 py-2 shadow-lg">
          <span className="text-sm">{selected.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" disabled={pending} className="gap-1">
                  Set status <ChevronDown className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {conceptStatuses.map((s) => (
                <DropdownMenuItem key={s} onClick={() => bulkChange(s)}>
                  {conceptStatusLabels[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}
    </>
  );
}
