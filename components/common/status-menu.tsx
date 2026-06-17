'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ActionResult } from '@/lib/action-result';
import type { Option } from '@/components/forms/options';

/**
 * Generic quick status changer. `onSelect` is a bound server action that takes
 * the chosen value and returns an ActionResult.
 */
export function StatusMenu({
  trigger,
  options,
  onSelect,
}: {
  trigger: React.ReactNode;
  options: Option[];
  onSelect: (value: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function select(value: string) {
    startTransition(async () => {
      const res = await onSelect(value);
      if (res.ok) {
        toast.success(res.message ?? 'Status updated');
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" disabled={pending} className="inline-flex items-center gap-1">
            {trigger}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="start">
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => select(o.value)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
