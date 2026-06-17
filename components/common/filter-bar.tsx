'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Option } from '@/components/forms/options';

export interface FilterDef {
  key: string;
  placeholder: string;
  options: Option[];
}

const ALL = '__all__';

export function FilterBar({
  filters = [],
  sort,
  searchKey = 'search',
  searchPlaceholder = 'Search…',
}: {
  filters?: FilterDef[];
  sort?: { options: Option[]; placeholder?: string };
  searchKey?: string;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get(searchKey) ?? '');

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== ALL) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Debounce the search field into the URL.
  useEffect(() => {
    const current = searchParams.get(searchKey) ?? '';
    if (search === current) return;
    const handle = setTimeout(() => setParam(searchKey, search || null), 300);
    return () => clearTimeout(handle);
  }, [search, searchKey, searchParams, setParam]);

  const hasActive =
    filters.some((f) => searchParams.get(f.key)) ||
    Boolean(searchParams.get(searchKey)) ||
    Boolean(sort && searchParams.get('sort'));

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {filters.map((f) => (
        <Select
          key={f.key}
          value={searchParams.get(f.key) ?? ALL}
          onValueChange={(v) => setParam(f.key, v)}
        >
          <SelectTrigger size="sm" className="min-w-[140px]">
            <SelectValue placeholder={f.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{f.placeholder}</SelectItem>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {sort && (
        <Select
          value={searchParams.get('sort') ?? ALL}
          onValueChange={(v) => setParam('sort', v)}
        >
          <SelectTrigger size="sm" className="min-w-[150px]">
            <SelectValue placeholder={sort.placeholder ?? 'Sort'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{sort.placeholder ?? 'Default order'}</SelectItem>
            {sort.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
          className="gap-1"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
