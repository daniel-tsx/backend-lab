'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { setConceptStatusAction } from '@/app/concepts/actions';
import { ConceptStatusBadge } from '@/components/common/badges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { conceptStatusLabels } from '@/lib/labels';
import { conceptStatuses, type ConceptStatus } from '@/types/enums';

export function ConceptStatusButton({
  id,
  status,
}: {
  id: string;
  status: ConceptStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: ConceptStatus) {
    startTransition(async () => {
      const res = await setConceptStatusAction(id, next);
      if (res.ok) {
        toast.success('Status updated');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" disabled={pending} className="inline-flex items-center gap-1">
            <ConceptStatusBadge status={status} />
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="start">
        {conceptStatuses.map((s) => (
          <DropdownMenuItem key={s} onClick={() => change(s)}>
            {conceptStatusLabels[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
