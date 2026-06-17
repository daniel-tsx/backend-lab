'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  Lightbulb,
  Menu,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { openCommandMenu } from '@/components/search/command-menu';
import { activeNavItem } from '@/lib/nav';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = activeNavItem(pathname);
  const title = active?.title ?? 'Backend Lab';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          onClick={openCommandMenu}
          className="hidden h-9 w-56 justify-start gap-2 px-3 text-muted-foreground sm:flex"
        >
          <Search className="size-4" />
          <span className="text-sm">Search…</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={openCommandMenu}
          aria-label="Search"
        >
          <Search className="size-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">Quick capture</span>
                <Plus className="size-4 sm:hidden" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Capture a thought</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push('/logs/new')}>
              <NotebookPen className="size-4" />
              I learned something
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/concepts/new')}>
              <HelpCircle className="size-4" />
              I&apos;m confused about something
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/reviews/new')}>
              <Plus className="size-4" />
              Create a review card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/labs/new')}>
              <Lightbulb className="size-4" />
              Capture a lab idea
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openCommandMenu}>
              <Search className="size-4" />
              Search everything
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
