'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { completeLessonAction } from '@/app/lessons/actions';
import {
  ReviewCardDrafts,
  type ReviewDraft,
} from '@/components/forms/review-card-drafts';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Lesson } from '@/types';

export function CompleteLessonDialog({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [ownWords, setOwnWords] = useState(lesson.ownWords);
  const [projectApplication, setProjectApplication] = useState(
    lesson.projectApplication,
  );
  const [drafts, setDrafts] = useState<ReviewDraft[]>(() =>
    lesson.questionsToAnswer.map((q) => ({ question: q, answer: '' })),
  );

  function submit() {
    startTransition(async () => {
      const res = await completeLessonAction(lesson.id, {
        ownWords,
        projectApplication,
        reviewCards: drafts,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.message ?? 'Lesson completed');
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
          <DialogTitle>Complete lesson</DialogTitle>
          <DialogDescription>
            Capture what stuck before marking it done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lesson-own-words">In my own words</Label>
            <Textarea
              id="lesson-own-words"
              rows={3}
              value={ownWords}
              onChange={(e) => setOwnWords(e.target.value)}
              placeholder="Explain the core idea as if teaching it."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lesson-project-application">
              How this applies to my projects
            </Label>
            <Textarea
              id="lesson-project-application"
              rows={3}
              value={projectApplication}
              onChange={(e) => setProjectApplication(e.target.value)}
              placeholder="Where would you use this in SmartTrips, DueKind, …?"
            />
          </div>
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
