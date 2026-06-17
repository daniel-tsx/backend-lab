'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { completeLabAction } from '@/app/labs/actions';
import {
  ReviewCardDrafts,
  type ReviewDraft,
} from '@/components/forms/review-card-drafts';
import { conceptStatusOptions } from '@/components/forms/options';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Lab } from '@/types';

const numberOrNull = (v: string) => (v === '' ? null : Number(v));

export function CompleteLabDialog({
  lab,
  conceptTitle,
}: {
  lab: Lab;
  conceptTitle?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [timeSpentMinutes, setTime] = useState(lab.timeSpentMinutes);
  const [confidenceBefore, setBefore] = useState<number | null>(
    lab.confidenceBefore,
  );
  const [confidenceAfter, setAfter] = useState<number | null>(
    lab.confidenceAfter,
  );
  const [thingsGotWrong, setWrong] = useState(lab.thingsGotWrong);
  const [whatLearned, setLearned] = useState(lab.whatLearned);
  const [conceptStatus, setConceptStatus] = useState('');
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);

  function submit() {
    startTransition(async () => {
      const res = await completeLabAction(lab.id, {
        timeSpentMinutes,
        confidenceBefore,
        confidenceAfter,
        thingsGotWrong,
        whatLearned,
        reviewCards: drafts,
        conceptStatus: conceptStatus || null,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? 'Lab completed');
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <CheckCircle2 className="size-4" />
            Complete
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete lab</DialogTitle>
          <DialogDescription>
            Record the outcome so future-you can learn from it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lab-time">Time (min)</Label>
              <Input
                id="lab-time"
                type="number"
                min={0}
                value={timeSpentMinutes}
                onChange={(e) => setTime(Number(e.target.value || 0))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lab-before">Confidence before</Label>
              <Input
                id="lab-before"
                type="number"
                min={1}
                max={10}
                value={confidenceBefore ?? ''}
                onChange={(e) => setBefore(numberOrNull(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lab-after">Confidence after</Label>
              <Input
                id="lab-after"
                type="number"
                min={1}
                max={10}
                value={confidenceAfter ?? ''}
                onChange={(e) => setAfter(numberOrNull(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lab-wrong">What I got wrong</Label>
            <Textarea
              id="lab-wrong"
              rows={2}
              value={thingsGotWrong}
              onChange={(e) => setWrong(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lab-learned">What I learned</Label>
            <Textarea
              id="lab-learned"
              rows={2}
              value={whatLearned}
              onChange={(e) => setLearned(e.target.value)}
            />
          </div>

          {conceptTitle && (
            <div className="space-y-1.5">
              <Label>Update “{conceptTitle}” to</Label>
              <Select
                value={conceptStatus}
                onValueChange={(v) => setConceptStatus(v ?? '')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— Leave unchanged —" />
                </SelectTrigger>
                <SelectContent>
                  {conceptStatusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Review cards</Label>
            <ReviewCardDrafts value={drafts} onChange={setDrafts} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={pending} />}>
            Cancel
          </DialogClose>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : 'Mark completed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
