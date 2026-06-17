import { cn } from '@/lib/utils';

export function SectionCard({
  title,
  description,
  actions,
  icon: Icon,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('panel overflow-hidden', className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
          <div className="min-w-0 space-y-0.5">
            {title && (
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                {Icon && <Icon className="size-4 text-muted-foreground" />}
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
