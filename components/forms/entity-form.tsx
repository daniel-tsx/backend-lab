'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import { toast } from 'sonner';

import { SubmitBar } from '@/components/forms/form-fields';
import type { ActionResult } from '@/lib/action-result';
import { cn } from '@/lib/utils';

export function EntityForm<TValues extends FieldValues>({
  schema,
  defaultValues,
  action,
  children,
  submitLabel,
  cancelHref,
  successMessage = 'Saved',
  className,
}: {
  schema: ZodType<unknown>;
  defaultValues: DefaultValues<TValues>;
  action: (values: TValues) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  successMessage?: string;
  className?: string;
}) {
  const methods = useForm<TValues>({
    resolver: zodResolver(
      schema as unknown as Parameters<typeof zodResolver>[0],
    ) as unknown as Resolver<TValues>,
    defaultValues,
  });
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onSubmit = methods.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const result = await action(values);
        if (result.ok) {
          toast.success(result.message ?? successMessage);
          if (result.redirectTo) router.push(result.redirectTo);
          else router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
        {children}
        <SubmitBar
          pending={pending}
          submitLabel={submitLabel}
          onCancel={cancelHref ? () => router.push(cancelHref) : undefined}
        />
      </form>
    </FormProvider>
  );
}
