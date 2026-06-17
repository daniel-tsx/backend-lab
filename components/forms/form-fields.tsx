'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { MermaidEditor } from '@/components/diagrams/mermaid-editor';
import { ToneBadge } from '@/components/common/badges';
import { cn } from '@/lib/utils';
import type { Option } from './options';

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  const err = name
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], errors);
  const message = (err as { message?: unknown })?.message;
  return typeof message === 'string' ? message : undefined;
}

export function FieldShell({
  label,
  htmlFor,
  description,
  error,
  required,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  placeholder,
  description,
  required,
  type = 'text',
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: React.ReactNode;
  required?: boolean;
  type?: string;
}) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <FieldShell label={label} htmlFor={name} description={description} error={error} required={required}>
      <Input id={name} type={type} placeholder={placeholder} aria-invalid={!!error} {...register(name)} />
    </FieldShell>
  );
}

export function NumberField({
  name,
  label,
  description,
  min,
  max,
  nullable = false,
}: {
  name: string;
  label?: string;
  description?: React.ReactNode;
  min?: number;
  max?: number;
  nullable?: boolean;
}) {
  const error = useFieldError(name);
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} htmlFor={name} description={description} error={error}>
          <Input
            id={name}
            type="number"
            min={min}
            max={max}
            value={field.value ?? ''}
            aria-invalid={!!error}
            onChange={(e) => {
              const v = e.target.value;
              field.onChange(v === '' ? (nullable ? null : 0) : Number(v));
            }}
          />
        </FieldShell>
      )}
    />
  );
}

export function DateField({
  name,
  label,
  description,
}: {
  name: string;
  label?: string;
  description?: React.ReactNode;
}) {
  const error = useFieldError(name);
  const toInputValue = (v: unknown): string => {
    if (!v) return '';
    const d = v instanceof Date ? v : new Date(v as string);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} htmlFor={name} description={description} error={error}>
          <Input
            id={name}
            type="date"
            value={toInputValue(field.value)}
            onChange={(e) =>
              field.onChange(e.target.value ? new Date(e.target.value) : null)
            }
          />
        </FieldShell>
      )}
    />
  );
}

export function TextareaField({
  name,
  label,
  placeholder,
  description,
  rows = 4,
  required,
  mono = false,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: React.ReactNode;
  rows?: number;
  required?: boolean;
  mono?: boolean;
}) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <FieldShell label={label} htmlFor={name} description={description} error={error} required={required}>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!error}
        spellCheck={mono ? false : undefined}
        className={mono ? 'font-mono text-[13px] leading-relaxed' : undefined}
        {...register(name)}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  options,
  placeholder = 'Select…',
  description,
  required,
}: {
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  description?: React.ReactNode;
  required?: boolean;
}) {
  const error = useFieldError(name);
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description} error={error} required={required}>
          <Select value={field.value ?? ''} onValueChange={field.onChange}>
            <SelectTrigger className="w-full" aria-invalid={!!error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      )}
    />
  );
}

export function MarkdownField({
  name,
  label,
  description,
  rows = 10,
  required,
}: {
  name: string;
  label?: string;
  description?: React.ReactNode;
  rows?: number;
  required?: boolean;
}) {
  const error = useFieldError(name);
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description} error={error} required={required}>
          <MarkdownEditor value={field.value ?? ''} onChange={field.onChange} rows={rows} />
        </FieldShell>
      )}
    />
  );
}

export function MermaidField({
  name,
  label,
  description,
  required,
}: {
  name: string;
  label?: string;
  description?: React.ReactNode;
  required?: boolean;
}) {
  const error = useFieldError(name);
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description} error={error} required={required}>
          <MermaidEditor value={field.value ?? ''} onChange={field.onChange} />
        </FieldShell>
      )}
    />
  );
}

/** Newline-separated text mapped to a string[]. */
export function StringListField({
  name,
  label,
  placeholder,
  description = 'One item per line.',
  rows = 4,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: React.ReactNode;
  rows?: number;
}) {
  const error = useFieldError(name);
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description} error={error}>
          <Textarea
            rows={rows}
            placeholder={placeholder}
            value={Array.isArray(field.value) ? field.value.join('\n') : ''}
            onChange={(e) =>
              field.onChange(
                e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </FieldShell>
      )}
    />
  );
}

/** Comma-separated chips mapped to a string[]. */
export function TagsField({
  name,
  label,
  placeholder = 'comma, separated, tags',
  description = 'Separate with commas.',
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: React.ReactNode;
}) {
  const error = useFieldError(name);
  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FieldShell label={label} description={description} error={error}>
          <Input
            placeholder={placeholder}
            value={Array.isArray(field.value) ? field.value.join(', ') : ''}
            onChange={(e) =>
              field.onChange(
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </FieldShell>
      )}
    />
  );
}

/** Searchable multi-select bound to a string[] of option values. */
export function MultiSelectField({
  name,
  label,
  options,
  description,
  placeholder = 'Select…',
}: {
  name: string;
  label?: string;
  options: Option[];
  description?: React.ReactNode;
  placeholder?: string;
}) {
  const error = useFieldError(name);
  const labelByValue = new Map(options.map((o) => [o.value, o.label]));
  return (
    <Controller
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        const toggle = (value: string) =>
          field.onChange(
            selected.includes(value)
              ? selected.filter((v) => v !== value)
              : [...selected, value],
          );
        return (
          <FieldShell label={label} description={description} error={error}>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate text-muted-foreground">
                      {selected.length ? `${selected.length} selected` : placeholder}
                    </span>
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-[--anchor-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search…" />
                  <CommandList>
                    <CommandEmpty>No matches.</CommandEmpty>
                    <CommandGroup>
                      {options.map((o) => (
                        <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                          <Check
                            className={cn(
                              'size-4',
                              selected.includes(o.value) ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selected.map((v) => (
                  <button key={v} type="button" onClick={() => toggle(v)}>
                    <ToneBadge tone="violet" className="gap-1">
                      {labelByValue.get(v) ?? v}
                      <X className="size-3" />
                    </ToneBadge>
                  </button>
                ))}
              </div>
            )}
          </FieldShell>
        );
      }}
    />
  );
}

export function SubmitBar({
  pending,
  submitLabel = 'Save',
  onCancel,
}: {
  pending?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-4">
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}
