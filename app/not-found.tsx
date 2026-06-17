import Link from 'next/link';
import { Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <Compass className="size-7" />
      </span>
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        That page doesn&apos;t exist — it may have been deleted or the link is stale.
      </p>
      <Button render={<Link href="/" />} className="mt-5">
        Back to dashboard
      </Button>
    </div>
  );
}
