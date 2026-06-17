import type { LessonSeed } from './types';

export const lessonSeeds: LessonSeed[] = [
  {
    slug: 'the-http-request-lifecycle',
    moduleSlug: 'backend-fundamentals',
    title: 'The HTTP request lifecycle',
    order: 1,
    status: 'completed',
    summary:
      'Trace a request from the browser to your handler and back, and learn where to put each concern.',
    body: `## Why this matters

You cannot reason about latency, caching, auth, or rate limiting until you know **where** in the request path each thing happens.

## The path of a request

1. **DNS** resolves the hostname to an IP.
2. **TLS** handshake establishes an encrypted connection.
3. The **edge / load balancer** picks an instance (and may serve a cached response).
4. The **framework** parses the request and runs **middleware** (auth, logging, rate limiting).
5. Your **handler** runs business logic and talks to the database.
6. The **response** is serialized with a status code and headers and travels back.

## Where to put concerns

| Concern | Best layer |
| --- | --- |
| Static caching | CDN / edge |
| Auth redirects | edge middleware |
| Rate limiting | edge or app, with shared state |
| Validation | top of the handler |
| Business rules | service layer |
| Data access | repository / query layer |

The big insight: **the handler is the middle of the story, not the whole thing.** Latency and security live at the edges too.`,
    keyTakeaways: [
      'A request passes through DNS → TLS → edge → framework → handler → response.',
      'Each layer can short-circuit, transform, or observe the request.',
      'Choose the layer for each concern: cache at the edge, validate at the handler.',
    ],
    questionsToAnswer: [
      'Where would you enforce auth, and why?',
      'What does the status code + headers contract communicate to clients?',
      'At which layer is rate limiting both correct and cheap?',
    ],
    commonMisconceptions: [
      'The framework handler is the entire request lifecycle.',
      'Headers are an afterthought rather than part of the API contract.',
    ],
    practicalChecklist: [
      'Know which layer serves cached responses in your stack.',
      'Confirm where TLS terminates.',
      'Identify where you currently log requests.',
    ],
    ownWords:
      'A request is a message that flows through layers; my job is to pick the cheapest correct layer for each concern.',
    projectApplication:
      'On Vercel, edge middleware handles auth redirects before my Neon-backed function ever runs.',
  },
  {
    slug: 'designing-rest-resources',
    moduleSlug: 'backend-fundamentals',
    title: 'Designing REST resources',
    order: 2,
    status: 'completed',
    summary: 'Model nouns, use verbs as actions, and keep response shapes predictable.',
    body: `## Resources, not actions

Design around **nouns**. The URL identifies a resource; the HTTP method is the verb.

- \`GET /invoices\` — list
- \`GET /invoices/:id\` — read one
- \`POST /invoices\` — create
- \`PATCH /invoices/:id\` — partial update
- \`DELETE /invoices/:id\` — remove

Avoid \`POST /getInvoice\` or \`POST /invoice/delete\` — the verb belongs in the method.

## Status codes are part of the contract

Return **201** on create, **204** on a body-less delete, **400** for bad input, **401/403** for auth, **404** when missing, **409** for conflicts, **422** for semantic validation errors. Never return **200** with an error body.

## Don't leak your tables

Your API is a contract, not a window into your schema. Shape responses for clients, and version them so you can evolve the database without breaking consumers.`,
    keyTakeaways: [
      'URLs name resources; methods are the actions.',
      'Status codes carry meaning — use them honestly.',
      'The API shape should be decoupled from the database schema.',
    ],
    questionsToAnswer: [
      'When is 422 more appropriate than 400?',
      'How do you evolve a response shape without breaking clients?',
    ],
    commonMisconceptions: [
      'REST requires HATEOAS to be "real" REST.',
      'A 200 with `{ error }` is fine.',
    ],
    practicalChecklist: [
      'No verbs in URLs.',
      'Consistent envelope for collections and errors.',
      'Status codes match outcomes.',
    ],
    projectApplication:
      'Eastbase APIs should expose stable resource shapes, not raw Drizzle rows.',
  },
  {
    slug: 'validation-at-the-boundary',
    moduleSlug: 'backend-fundamentals',
    title: 'Validation at the boundary',
    order: 3,
    status: 'completed',
    summary: 'Validate untrusted input once, at the edge, then trust your types inside.',
    body: `## The gate

Treat the edge of your system as a gate. Outside the gate, data is hostile and untyped. Inside, after validation, types are **guarantees**.

\`\`\`ts
const schema = z.object({
  title: z.string().min(1).max(160),
  amount: z.number().int().positive(),
});

const parsed = schema.safeParse(await req.json());
if (!parsed.success) {
  return Response.json({ error: parsed.error.flatten() }, { status: 400 });
}
// parsed.data is now fully typed and trusted
\`\`\`

## Rules

- Validate **every** external input: bodies, query params, headers, webhooks, uploads.
- **Never** trust client-supplied IDs for ownership — scope by the authenticated actor.
- Reject, don't silently coerce, unless coercion is explicitly intended.`,
    keyTakeaways: [
      'Validate untrusted input once at the boundary.',
      'A typed object after parsing is a contract for the rest of the code.',
      'Client-sent IDs are inputs, not authority.',
    ],
    questionsToAnswer: [
      'Why is UI-only validation insufficient?',
      'What is IDOR and how does validation relate to it?',
    ],
    commonMisconceptions: ['Validation is a UX concern, not a security one.'],
    practicalChecklist: [
      'Schema for every route input.',
      'Field-level 400 errors.',
      'Ownership checks separate from shape validation.',
    ],
  },
  {
    slug: 'an-error-handling-convention',
    moduleSlug: 'backend-fundamentals',
    title: 'An API error-handling convention',
    order: 4,
    status: 'needs-review',
    summary: 'Pick one error envelope and one mapping from exceptions to status codes.',
    body: `## One envelope, everywhere

\`\`\`json
{ "error": { "code": "invoice_not_found", "message": "Invoice not found", "details": null } }
\`\`\`

Clients branch on \`code\`, not on a human \`message\`.

## Map centrally

Define an \`AppError\` with a status and code, and one place that turns thrown errors into responses. Unknown errors become a generic 500 — **never** leak stack traces or internal messages.

## Log with context

When you map an error, log it with the request id, tenant, and route. The client gets a safe message; you get the forensic detail.`,
    keyTakeaways: [
      'A stable error code is part of the API contract.',
      'Centralize exception → response mapping.',
      'Log rich context server-side; return safe messages to clients.',
    ],
    questionsToAnswer: [
      'What belongs in a client-facing error vs. a log?',
      'How do you avoid inconsistent error shapes across 50 endpoints?',
    ],
    commonMisconceptions: [
      'Each endpoint can format errors however is convenient.',
    ],
    practicalChecklist: [
      'Single error envelope.',
      'Central error handler.',
      'No secrets/stack traces to clients.',
    ],
    ownWords:
      'Errors are an API I design on purpose, with stable codes clients can rely on.',
  },
  {
    slug: 'transactions-101',
    moduleSlug: 'backend-fundamentals',
    title: 'Transactions 101',
    order: 5,
    status: 'reading',
    summary: 'Group writes so they all happen or none do, and keep them short.',
    body: `## All or nothing

A transaction makes several statements atomic: on success they commit together; on error they roll back together.

\`\`\`ts
await db.transaction(async (tx) => {
  await tx.update(accounts).set({ balance: sql\`balance - 100\` }).where(eq(accounts.id, from));
  await tx.update(accounts).set({ balance: sql\`balance + 100\` }).where(eq(accounts.id, to));
  await tx.insert(ledger).values({ from, to, amount: 100 });
});
\`\`\`

## Keep them short

Locks are held until commit. **Never** put a slow external API call inside a transaction — you'll hold locks and starve other writers. Do external work before or after, and use idempotency to stay correct.`,
    keyTakeaways: [
      'Transactions give you atomicity across multiple writes.',
      'Hold locks for as little time as possible.',
      'External calls do not belong inside a transaction.',
    ],
    questionsToAnswer: [
      'Why is a long transaction dangerous under concurrency?',
      'Where should the idempotency-key write live relative to the effect?',
    ],
    commonMisconceptions: [
      'The default isolation level prevents lost updates.',
    ],
    practicalChecklist: [
      'Wrap multi-row invariants in a transaction.',
      'No network calls inside transactions.',
      'Combine the effect and its bookkeeping in one transaction.',
    ],
  },
  {
    slug: 'indexing-that-actually-helps',
    moduleSlug: 'database-deep-dive',
    title: 'Indexing that actually helps',
    order: 1,
    status: 'reading',
    summary: 'Use EXPLAIN to confirm an index is used, and order composite columns correctly.',
    body: `## Read the plan

Don't guess — run \`EXPLAIN ANALYZE\`. A sequential scan on a large filtered table is a smell.

## Composite prefix rule

An index on \`(tenant_id, created_at, id)\` can serve filters on \`tenant_id\`, \`tenant_id + created_at\`, and ordering by those — but **not** a filter on \`created_at\` alone. Columns are usable left-to-right.

## The cost

Every index speeds reads but slows writes and uses storage. Index the columns you filter, join, and sort on — and the foreign keys you join.`,
    keyTakeaways: [
      'EXPLAIN ANALYZE tells you whether an index is used.',
      'Composite indexes follow a left-to-right prefix rule.',
      'Indexes trade write cost for read speed.',
    ],
    questionsToAnswer: [
      'Why does (tenant_id, created_at, id) help cursor pagination?',
      'When is adding an index a net negative?',
    ],
    commonMisconceptions: ['More indexes are always better.'],
    practicalChecklist: [
      'Index foreign keys.',
      'Match composite order to query patterns.',
      'Verify with EXPLAIN.',
    ],
    projectApplication:
      'BurnCap usage queries need (tenant_id, recorded_at) to stay fast as events grow.',
  },
  {
    slug: 'isolation-levels-and-lost-updates',
    moduleSlug: 'database-deep-dive',
    title: 'Isolation levels and lost updates',
    order: 2,
    status: 'not-started',
    summary: 'Why read-modify-write breaks under the default isolation level, and how to fix it.',
    body: `## The lost update

Two requests read \`balance = 100\`, each subtract 30, each write \`70\`. The correct answer is \`40\`. Read Committed (Postgres default) does **not** prevent this.

## Fixes

- \`UPDATE ... SET balance = balance - 30\` (do the math in SQL, not the app).
- \`SELECT ... FOR UPDATE\` to lock the row first.
- \`SERIALIZABLE\` isolation + **retry** on serialization failures.

The right tool depends on contention and how much logic sits between read and write.`,
    keyTakeaways: [
      'Read Committed allows lost updates in read-modify-write flows.',
      'Push arithmetic into SQL, lock the row, or use Serializable with retries.',
      'Higher isolation means more aborts to retry.',
    ],
    questionsToAnswer: [
      'Reproduce a lost update with two concurrent transactions.',
      'When would you choose SELECT FOR UPDATE over Serializable?',
    ],
    commonMisconceptions: ['Transactions alone prevent all concurrency anomalies.'],
    practicalChecklist: [
      'Identify read-modify-write hot spots.',
      'Choose a concurrency strategy per hot spot.',
      'Add retry logic for serialization failures.',
    ],
  },
  {
    slug: 'safe-webhook-handling',
    moduleSlug: 'practical-saas-backend',
    title: 'Safe webhook handling',
    order: 1,
    status: 'reading',
    summary: 'Verify, acknowledge fast, dedupe, and process asynchronously.',
    body: `## Treat webhooks as hostile, at-least-once events

1. **Verify the signature** before trusting anything.
2. **Acknowledge fast** — return 2xx immediately so the provider doesn't retry/timeout.
3. **Dedupe** on the event id (idempotency) because delivery is at-least-once and can be out of order.
4. **Process asynchronously** — enqueue the work, don't do it inline.

\`\`\`ts
const event = verifySignature(rawBody, signature, secret); // throws on bad sig
await recordEventIdOnce(event.id); // unique constraint => dedupe
await queue.enqueue('process-webhook', event);
return new Response('ok'); // fast 2xx
\`\`\`

The number one bug is doing heavy work before returning 2xx, which causes duplicate deliveries and timeouts.`,
    keyTakeaways: [
      'Verify signatures before acting.',
      'Return 2xx fast, then work asynchronously.',
      'Dedupe by event id; delivery is at-least-once.',
    ],
    questionsToAnswer: [
      'Why does slow inline processing cause duplicate webhooks?',
      'How do you guarantee an event is processed at most once?',
    ],
    commonMisconceptions: [
      'Webhook delivery is exactly-once and ordered.',
    ],
    practicalChecklist: [
      'Signature verification.',
      'Unique constraint on event id.',
      'Async processing via a queue.',
    ],
    projectApplication:
      'DueKind and MergeAttest both ingest webhooks — store event.id, return 2xx, enqueue.',
  },
  {
    slug: 'multi-tenant-data-modeling',
    moduleSlug: 'practical-saas-backend',
    title: 'Multi-tenant data modeling',
    order: 2,
    status: 'reading',
    summary: 'Put tenant_id on every row and enforce it where queries run.',
    body: `## The shared-schema model

Most SaaS uses a shared schema with a \`tenant_id\` on every tenant-owned row. It is cheap and easy to operate — but **isolation is your code's job**.

## Enforce it where it counts

- Add \`tenant_id\` to every table and every query.
- Centralize it: a guarded query helper that injects \`tenant_id\` so no one forgets.
- Back it with **Postgres Row-Level Security** as a safety net.
- Index \`(tenant_id, ...)\` so tenant-scoped queries stay fast.

The one query that forgets \`tenant_id\` is a cross-tenant data leak. Make "forgetting" structurally hard.`,
    keyTakeaways: [
      'Shared schema + tenant_id is the common, pragmatic default.',
      'Isolation must be enforced at the query layer, not the UI.',
      'RLS is a valuable backstop; composite indexes keep it fast.',
    ],
    questionsToAnswer: [
      'How would you make forgetting tenant_id impossible?',
      'When is database-per-tenant worth the operational cost?',
    ],
    commonMisconceptions: ['Filtering by tenant in the UI is enough.'],
    practicalChecklist: [
      'tenant_id on every owned table.',
      'Guarded query layer.',
      'RLS enabled; (tenant_id, …) indexes.',
    ],
    projectApplication:
      'Any B2B move for Eastbase Studio tools needs this from day one.',
  },
  {
    slug: 'serverless-constraints-and-cold-starts',
    moduleSlug: 'serverless-to-traditional-backend',
    title: 'Serverless constraints and cold starts',
    order: 1,
    status: 'reading',
    summary: 'Know the limits — statelessness, timeouts, cold starts, connections — before you hit them.',
    body: `## What serverless takes away

- **Statelessness**: no shared memory across instances. In-memory caches and rate limiters silently break.
- **Time limits**: long tasks hit execution timeouts — move them to a queue/worker.
- **Cold starts**: the first request after idle pays the boot cost. Keep bundles small and top-level work light.
- **Connections**: many instances can exhaust Postgres connections — use a pooled endpoint.

## When to graduate

Move toward a long-running backend when you need: sustained throughput where per-invocation cost flips, websockets, large warm caches, or genuinely long tasks. Until then, serverless + a queue covers most SaaS.`,
    keyTakeaways: [
      'Serverless forces statelessness and short execution.',
      'Cold starts and connection limits are the usual pain points.',
      'A queue + worker extends serverless a long way before you need a dedicated backend.',
    ],
    questionsToAnswer: [
      'Which symptoms indicate you have outgrown serverless?',
      'Why does an in-memory rate limiter fail on serverless?',
    ],
    commonMisconceptions: [
      'Serverless cannot handle background work at all.',
    ],
    practicalChecklist: [
      'Use a pooled DB connection.',
      'Offload long tasks to a queue.',
      'Measure cold-start latency on key routes.',
    ],
    projectApplication:
      'DueKind reminder sends should be queued, not run inline in a route handler.',
  },
];
