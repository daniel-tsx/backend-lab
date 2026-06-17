'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookA,
  Boxes,
  FileText,
  FlaskConical,
  FolderGit2,
  Layers,
  NotebookPen,
  Plus,
  Scale,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { allNavItems } from '@/lib/nav';
import { searchAction } from '@/app/actions/search';
import type { SearchResult } from '@/db/queries/search';

export const OPEN_COMMAND_EVENT = 'backend-lab:open-command';

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}

interface CreateItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const createItems: CreateItem[] = [
  { label: 'New concept', href: '/concepts/new', icon: Boxes },
  { label: 'New lab', href: '/labs/new', icon: FlaskConical },
  { label: 'New lesson', href: '/lessons/new', icon: FileText },
  { label: 'New diagram', href: '/diagrams/new', icon: Workflow },
  { label: 'New system design case', href: '/case-studies/new', icon: Layers },
  { label: 'New decision guide', href: '/decision-guides/new', icon: Scale },
  { label: 'New project', href: '/projects/new', icon: FolderGit2 },
  { label: 'New review card', href: '/reviews/new', icon: Plus },
  { label: 'New learning log', href: '/logs/new', icon: NotebookPen },
  { label: 'New glossary term', href: '/glossary/new', icon: BookA },
];

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        try {
          setResults(await searchAction(query));
        } catch {
          setResults([]);
        }
      });
    }, 180);
    return () => clearTimeout(handle);
  }, [query]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router],
  );

  const q = query.trim().toLowerCase();
  const filteredNav = q
    ? allNavItems.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
      )
    : allNavItems;
  const filteredCreate = q
    ? createItems.filter((i) => i.label.toLowerCase().includes(q))
    : createItems;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command menu"
      description="Search the lab and jump anywhere"
      className="top-[12vh]"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search concepts, labs, diagrams… or type a command"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  value={`${r.type}-${r.id}`}
                  onSelect={() => go(r.href)}
                >
                  <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
                    {r.subtitle}
                  </span>
                  <span className="truncate">{r.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredNav.length > 0 && (
            <>
              {results.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Go to">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.href}
                      value={`nav-${item.href}`}
                      onSelect={() => go(item.href)}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{item.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {filteredCreate.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Create">
                {filteredCreate.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.href}
                      value={`create-${item.href}`}
                      onSelect={() => go(item.href)}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
