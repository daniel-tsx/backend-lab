'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { importDataAction, resetSeedAction } from '@/app/settings/actions';
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

export function DataManagement() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, startImport] = useTransition();
  const [resetting, startReset] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startImport(async () => {
      const text = await file.text();
      const res = await importDataAction(text);
      if (res.ok) {
        toast.success(res.message ?? 'Imported');
        router.refresh();
      } else {
        toast.error(res.error);
      }
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  function onReset() {
    startReset(async () => {
      const res = await resetSeedAction();
      if (res.ok) {
        toast.success(res.message ?? 'Reset');
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" render={<a href="/api/export" download />} className="gap-1.5">
        <Download className="size-4" />
        Export JSON
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />
      <Button
        variant="outline"
        className="gap-1.5"
        disabled={importing}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-4" />
        {importing ? 'Importing…' : 'Import JSON'}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="outline" className="gap-1.5 text-amber-300" disabled={resetting}>
              <RotateCcw className="size-4" />
              Reset seed data
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to seed data?</AlertDialogTitle>
            <AlertDialogDescription>
              This wipes all current data and restores the original seed (concepts, labs,
              case studies, etc.). Export a backup first if you want to keep your changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="ghost">Cancel</Button>} />
            <AlertDialogAction
              render={
                <Button variant="destructive" onClick={onReset} disabled={resetting}>
                  {resetting ? 'Resetting…' : 'Reset everything'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
