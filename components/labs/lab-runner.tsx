'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Pause, Play, Save } from 'lucide-react';
import { toast } from 'sonner';

import {
  addLabTimeAction,
  saveLabNotebookAction,
  setLabCriteriaAction,
} from '@/app/labs/actions';
import { CompleteLabDialog } from '@/components/labs/complete-lab-dialog';
import { SectionCard } from '@/components/common/section-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatMinutes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Lab } from '@/types';

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LabRunner({
  lab,
  conceptTitle,
}: {
  lab: Lab;
  conceptTitle?: string | null;
}) {
  const router = useRouter();
  const [, startCriteria] = useTransition();
  const [pending, startTransition] = useTransition();

  const [checked, setChecked] = useState<string[]>(lab.completedCriteria);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [manual, setManual] = useState('');
  const [notebook, setNotebook] = useState(lab.notebook);
  const [confidenceBefore, setConfidenceBefore] = useState<number | null>(
    lab.confidenceBefore,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function toggleCriterion(criterion: string) {
    const next = checked.includes(criterion)
      ? checked.filter((c) => c !== criterion)
      : [...checked, criterion];
    setChecked(next);
    startCriteria(async () => {
      const res = await setLabCriteriaAction(lab.id, next);
      if (!res.ok) toast.error(res.error);
    });
  }

  function logTime(minutes: number) {
    startTransition(async () => {
      const res = await addLabTimeAction(lab.id, minutes);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? 'Time logged');
      setRunning(false);
      setElapsed(0);
      setManual('');
      router.refresh();
    });
  }

  function saveNotes() {
    startTransition(async () => {
      const res = await saveLabNotebookAction(lab.id, {
        notebook,
        confidenceBefore,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? 'Notes saved');
      router.refresh();
    });
  }

  const doneCount = lab.successCriteria.filter((c) => checked.includes(c)).length;

  return (
    <SectionCard
      title="Run this lab"
      icon={Clock}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatMinutes(lab.timeSpentMinutes)} logged
          </span>
          <CompleteLabDialog lab={lab} conceptTitle={conceptTitle} />
        </div>
      }
    >
      <div className="space-y-6">
        {lab.successCriteria.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Success criteria
              </p>
              <span className="text-xs tabular-nums text-muted-foreground">
                {doneCount}/{lab.successCriteria.length}
              </span>
            </div>
            <ul className="space-y-2">
              {lab.successCriteria.map((c, i) => {
                const isChecked = checked.includes(c);
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <Checkbox
                      id={`criterion-${i}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleCriterion(c)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`criterion-${i}`}
                      className={cn(
                        'text-sm font-normal leading-snug',
                        isChecked && 'text-muted-foreground line-through',
                      )}
                    >
                      {c}
                    </Label>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Time tracking */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
          <span className="font-mono text-lg tabular-nums">{clock(elapsed)}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setRunning((r) => !r)}
          >
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? 'Pause' : 'Start'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || elapsed < 60}
            onClick={() => logTime(Math.round(elapsed / 60))}
          >
            Log timer
          </Button>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              placeholder="min"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              className="h-8 w-20"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || !manual}
              onClick={() => logTime(Number(manual))}
            >
              Add time
            </Button>
          </div>
        </div>

        {/* Working notes */}
        <div className="space-y-3 border-t border-border/70 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Working notes
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="confidence-before" className="text-xs font-normal text-muted-foreground">
                Confidence before
              </Label>
              <Input
                id="confidence-before"
                type="number"
                min={1}
                max={10}
                value={confidenceBefore ?? ''}
                onChange={(e) =>
                  setConfidenceBefore(e.target.value === '' ? null : Number(e.target.value))
                }
                className="h-8 w-16"
              />
            </div>
          </div>
          <Textarea
            rows={6}
            value={notebook}
            placeholder="Scratchpad: your approach, what you tried, snippets…"
            onChange={(e) => setNotebook(e.target.value)}
            className="font-mono text-[13px] leading-relaxed"
            spellCheck={false}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={pending}
              onClick={saveNotes}
            >
              <Save className="size-4" />
              {pending ? 'Saving…' : 'Save notes'}
            </Button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
