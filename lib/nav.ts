import {
  BarChart3,
  BookA,
  Boxes,
  Braces,
  Brain,
  FileText,
  FlaskConical,
  FolderGit2,
  LayoutDashboard,
  Layers,
  Network,
  Route,
  Scale,
  Settings,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        description: 'Progress, scores, and what to study next',
      },
    ],
  },
  {
    label: 'Learn',
    items: [
      {
        title: 'Concept Map',
        href: '/concept-map',
        icon: Network,
        description: 'Visual knowledge map with prerequisites',
      },
      {
        title: 'Concepts',
        href: '/concepts',
        icon: Boxes,
        description: 'The concept library',
      },
      {
        title: 'Learning Paths',
        href: '/modules',
        icon: Route,
        description: 'Structured modules and paths',
      },
      {
        title: 'Lessons',
        href: '/lessons',
        icon: FileText,
        description: 'Focused written lessons',
      },
    ],
  },
  {
    label: 'Practice',
    items: [
      {
        title: 'Labs',
        href: '/labs',
        icon: FlaskConical,
        description: 'Hands-on backend exercises',
      },
      {
        title: 'System Design',
        href: '/case-studies',
        icon: Layers,
        description: 'System design case studies',
      },
      {
        title: 'Diagrams',
        href: '/diagrams',
        icon: Workflow,
        description: 'Architecture diagram gallery',
      },
      {
        title: 'Snippets',
        href: '/snippets',
        icon: Braces,
        description: 'Reusable backend code snippets',
      },
      {
        title: 'Decision Guides',
        href: '/decision-guides',
        icon: Scale,
        description: 'Choose between backend options',
      },
    ],
  },
  {
    label: 'Apply & Review',
    items: [
      {
        title: 'Projects',
        href: '/projects',
        icon: FolderGit2,
        description: 'Backend for your real products',
      },
      {
        title: 'Review Center',
        href: '/reviews',
        icon: Brain,
        description: 'Spaced repetition and self-review',
      },
      {
        title: 'Glossary',
        href: '/glossary',
        icon: BookA,
        description: 'Backend terms and definitions',
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        description: 'Weekly reviews and readiness reports',
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Data, taxonomy, and scoring weights',
      },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);

/** Resolve the best-matching nav item for the current pathname. */
export function activeNavItem(pathname: string): NavItem | undefined {
  if (pathname === '/') return allNavItems.find((i) => i.href === '/');
  const matches = allNavItems
    .filter((i) => i.href !== '/' && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0];
}
