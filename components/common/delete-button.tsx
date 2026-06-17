'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { ActionResult } from '@/lib/action-result';

export function DeleteButton({
  action,
  entity = 'item',
  triggerLabel,
  iconOnly = false,
}: {
  action: () => Promise<ActionResult>;
  entity?: string;
  triggerLabel?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(res.message ?? 'Deleted');
        if (res.redirectTo) router.push(res.redirectTo);
        else router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size={iconOnly ? 'icon-sm' : 'sm'}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${entity}`}
          >
            <Trash2 className="size-4" />
            {!iconOnly && (triggerLabel ?? 'Delete')}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {entity}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes this {entity}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel render={<Button variant="ghost">Cancel</Button>} />
          <AlertDialogAction
            render={
              <Button variant="destructive" onClick={onConfirm} disabled={pending}>
                {pending ? 'Deleting…' : 'Delete'}
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
