'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbError =
    error.message.includes('DATABASE_URL') ||
    error.message.toLowerCase().includes('connect') ||
    error.message.toLowerCase().includes('econnrefused');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      {isDbError ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The app couldn&apos;t reach the database. Make sure{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">DATABASE_URL</code> is set in{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>, then run{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm db:push</code> and{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm db:seed</code>.
        </p>
      ) : (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{error.message}</p>
      )}
      <Button onClick={reset} className="mt-5 gap-1.5">
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
