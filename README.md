# Backend Architecture Lab

A personal **backend learning cockpit** — not a note-taking app. It combines a
concept library, concept map, learning paths, hands-on labs, system-design
casebook, architecture diagrams, decision guides, project applications, a
spaced-repetition review center, a glossary, reports, and a learning journal,
so you can understand backend concepts deeply: how they work, when to use them,
when *not* to, and how they map to real SaaS products.

> Status: **current**. Dark "engineering cockpit" UI, desktop-first.

## Daily workflow

The library is wired into a daily loop so you always know what to do next:

- **`/today`** — one focused study session: due reviews, a recommended lesson
  and lab, your weakest concepts/areas, and the next backend action per project.
- **Completion flows** — finishing a lesson or lab opens a capture dialog
  (own-words, project application / what-went-wrong + learned, optional review
  cards, status), so learning is recorded without editing the whole record.
- **Lab runner** — work a lab in place: a persisted success-criteria checklist,
  a timer + manual time logging, and a working-notes scratchpad.
- **Project backlog** — each project page computes the next backend steps,
  concepts to learn (with status), and suggested labs/decision guides.
- **Weekly review** — `/reports` shows what improved, what's stale/overdue,
  blockers from your logs, and a suggested focus for next week.
- Learning logs link to **real** concepts and labs (not free text), and global
  search reaches your projects, logs, lab notebooks, and lesson notes.

## Stack

- **Next.js 16** (App Router, Server Actions) · React 19 · TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (Base UI + Lucide)
- **Drizzle ORM** on **PostgreSQL** (Neon-ready, via `pg`)
- **React Hook Form** + **Zod v4** · **Recharts** · **Mermaid** ·
  **react-markdown** · **date-fns**

## Getting started

You need a PostgreSQL database. Neon (or any Postgres) works — point
`DATABASE_URL` at it.

```bash
pnpm install
cp .env.example .env          # then edit DATABASE_URL
pnpm db:push                  # create tables from the Drizzle schema
pnpm db:seed                  # load realistic seed content
pnpm dev                      # http://localhost:3000
```

No local Postgres? Spin one up with Docker:

```bash
docker run --name backend-lab-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=backend_lab -p 5432:5432 -d postgres:16
# .env: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/backend_lab"
```

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` | Generate a migration from the schema |
| `pnpm db:push` | Push the schema to the database |
| `pnpm db:migrate` | Apply generated migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Reset + load seed data |

## Architecture

```
app/                 Routes (one folder per area) + per-area server actions
  api/export/        JSON + Markdown download route handlers
components/
  ui/                shadcn/ui primitives
  common/ layout/ charts/ forms/ markdown/ diagrams/ ...
db/
  schema.ts          Drizzle schema (14 tables)
  queries/           All database access lives here
  migrations/        Generated SQL
lib/
  validations/       Zod form schemas
  scoring/           Calculated metrics (progress, confidence, readiness…)
  review-scheduler/  SM-2 spaced-repetition logic
  export/            JSON + Markdown export/import
  seed-data/         Seed content (slug-referenced)
seed/                Seed runner (pnpm db:seed)
types/               Enums (taxonomy) + inferred entity types
```

Principles:

- **All DB access goes through `db/queries`**; mutations are Server Actions
  that revalidate. Pages are server components and render on request
  (`force-dynamic`).
- **Taxonomy lives in `types/enums.ts`** as plain unions, not Postgres enums —
  adding a category never needs a migration.
- **Scoring and scheduling are pure functions** (`lib/scoring`,
  `lib/review-scheduler`), unit-testable and reused across dashboard/reports.

## Built to extend

- **Auth (BetterAuth):** because every read/write funnels through `db/queries`
  and server actions, adding a `userId` column + session checks is additive.
- **AI explanations:** concept fields are structured (mental model, how it
  works, trade-offs, …) so a future generator can fill them with no schema
  change.

## Data

Back up, restore, and export from **Settings**: full JSON backup/restore,
Markdown export of concepts / decision guides / case studies, and a
reset-to-seed action.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
