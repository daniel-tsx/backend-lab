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

  // --- Backend Fundamentals (continued) ------------------------------------
  {
    slug: 'authentication-and-sessions',
    moduleSlug: 'backend-fundamentals',
    title: 'Authentication and sessions',
    order: 6,
    summary:
      'Prove who a user is once, then carry that identity safely on every later request.',
    body: `## Authentication vs sessions

Authentication answers *"who are you?"* once (login). A session or token answers *"are you still you?"* on every request after that.

## Two models

- **Server sessions** — store a session row server-side (DB/Redis) and give the client an opaque cookie holding the session id. Revocation is trivial (delete the row), but you need shared session storage.
- **Stateless tokens (JWT)** — sign a token containing claims; the server verifies the signature with no lookup. Scales well, but revocation is hard, so use short lifetimes + refresh tokens.

## Cookies done right

Set \`HttpOnly\` (JS can't read it), \`Secure\` (HTTPS only), and \`SameSite\` (CSRF defense). Keep tokens in cookies, **not** localStorage, so XSS can't steal them.

**Key insight:** prefer short-lived access tokens plus a refresh token (or server sessions) so you can actually revoke access.`,
    keyTakeaways: [
      'Authentication is a one-time identity check; sessions/tokens carry it forward.',
      'Server sessions are easy to revoke; stateless JWTs scale but need short lifetimes.',
      'HttpOnly + Secure + SameSite cookies defend against XSS and CSRF.',
    ],
    questionsToAnswer: [
      'How would you revoke a logged-in user immediately under each model?',
      'Why is localStorage a poor place to keep an auth token?',
    ],
    commonMisconceptions: [
      'JWTs are inherently more secure than sessions (they solve a different problem).',
      'Hashing a password is enough without a slow algorithm and a per-user salt.',
    ],
    practicalChecklist: [
      'Hash passwords with a slow algorithm (bcrypt/argon2) and a unique salt.',
      'Set HttpOnly, Secure, and SameSite on auth cookies.',
      'Have a revocation story: session delete, or short TTL plus refresh.',
    ],
  },
  {
    slug: 'authorization-patterns',
    moduleSlug: 'backend-fundamentals',
    title: 'Authorization patterns',
    order: 7,
    summary:
      'Once you know who the user is, decide what they may do — safely, on every request.',
    body: `## Authorization is not authentication

Authentication is *who you are*; authorization is *what you may do*. It runs server-side on **every** request — the UI is a convenience, never a control.

## Patterns

- **RBAC (role-based)** — assign roles (admin, member); permissions attach to roles. Fits most SaaS.
- **Ownership / ABAC** — decisions depend on attributes: is this row in the user's tenant? is the user the owner?
- **Tenant scoping** — in multi-tenant apps every query must filter by \`tenant_id\`.

## Where to enforce it

At the data-access layer, not just the route. A guarded query helper that always injects \`tenant_id\`/\`owner_id\` prevents the classic **IDOR** bug: changing an id in the URL to read someone else's data.

**Key insight:** the safest check is the one you can't forget — make the secure path the default in your query layer.`,
    keyTakeaways: [
      'Authorization runs server-side on every request; the UI is not a control.',
      'RBAC covers most SaaS; ownership/tenant checks cover row-level access.',
      'Centralize tenant/owner filtering so a missing check cannot leak data.',
    ],
    questionsToAnswer: [
      'What is an IDOR bug and how does a guarded query layer prevent it?',
      'When do simple roles stop being enough and you need ownership checks?',
    ],
    commonMisconceptions: [
      'Hiding a button is access control.',
      'Checking permissions once at login is enough.',
    ],
    practicalChecklist: [
      'Every multi-tenant query filters by tenant_id by default.',
      'Object-level checks confirm the user may access the resource.',
      'Authorization failures return 403 (or 404 to avoid leaking existence).',
    ],
  },
  {
    slug: 'pagination-that-scales',
    moduleSlug: 'backend-fundamentals',
    title: 'Pagination that scales',
    order: 8,
    summary:
      'Why deep offset pagination falls over, and how cursor pagination stays fast and stable.',
    body: `## Offset vs cursor

- **Offset** (\`LIMIT m OFFSET n\`) — easy and supports "jump to page 7", but slow on deep pages (the DB still scans and skips n rows) and drifts when rows are inserted or deleted.
- **Cursor (keyset)** — "give me rows after this marker." Fast and stable because it's an index range scan, not a skip.

## Building a cursor

Sort by a stable, unique key — usually \`(created_at, id)\`. The cursor encodes the last row's key:

\`\`\`sql
WHERE (created_at, id) < (:ts, :id)
ORDER BY created_at DESC, id DESC
LIMIT :m
\`\`\`

The \`id\` tie-breaker prevents skips and duplicates when timestamps collide.

**Key insight:** index the exact columns in your ORDER BY, and always include a unique tie-breaker.`,
    keyTakeaways: [
      'Offset pagination degrades on deep pages and drifts under writes.',
      'Cursor pagination is index-friendly, stable, and ideal for infinite scroll.',
      'A unique tie-breaker (id) in the sort key prevents duplicates and skips.',
    ],
    questionsToAnswer: [
      'Why does a large OFFSET get slow even with an index?',
      'What goes wrong if you sort only by created_at without id?',
    ],
    commonMisconceptions: [
      'Cursors are only worth it for huge datasets.',
      'You can random-access any page with cursors (you cannot — that is offset only).',
    ],
    practicalChecklist: [
      'Add an index covering the ORDER BY columns.',
      'Return an opaque cursor, not a raw DB offset.',
      'Include id as a tie-breaker in the sort.',
    ],
  },

  // --- Practical SaaS Backend (continued) ----------------------------------
  {
    slug: 'idempotency-and-safe-retries',
    moduleSlug: 'practical-saas-backend',
    title: 'Idempotency and safe retries',
    order: 3,
    summary:
      'Make repeated requests safe so a retried payment or webhook never runs twice.',
    body: `## Why retries break things

Networks fail mid-request. Clients and webhook senders retry. Without protection, a retried "create charge" runs twice.

## Idempotency keys

The client sends a unique \`Idempotency-Key\` per logical operation. The first time, the server records the key and the result; on a retry with the same key it returns the **stored** result instead of redoing the work. Stripe works exactly this way.

## Make the write atomic

Insert the idempotency record and perform the effect in the **same transaction**, or put a unique constraint on the key. A naive "check then insert" has a race — two concurrent retries both pass the check.

**Key insight:** idempotency means "same key, same effect, exactly once" — enforced by a unique constraint, not by checking first.`,
    keyTakeaways: [
      'Anything retryable (webhooks, payments) needs idempotency.',
      'Store the key plus its result; replay the stored result on duplicates.',
      'Use a unique constraint/transaction so concurrent retries cannot double-apply.',
    ],
    questionsToAnswer: [
      'Where does a check-then-act idempotency implementation race?',
      'What should the server return on a duplicate idempotency key?',
    ],
    commonMisconceptions: [
      'Retries are rare enough to ignore.',
      'A read check before writing is enough to dedupe.',
    ],
    practicalChecklist: [
      'Accept an Idempotency-Key on unsafe POST endpoints.',
      'Enforce uniqueness in the database, not in app code.',
      'Persist and replay the original response.',
    ],
  },
  {
    slug: 'rate-limiting-strategies',
    moduleSlug: 'practical-saas-backend',
    title: 'Rate limiting strategies',
    order: 4,
    summary:
      'Protect your API from abuse and cost blowups with limiters that work across instances.',
    body: `## Why limit

Stop abuse and runaway clients, cap cost, and keep one tenant from starving others.

## Algorithms

- **Fixed window** — count per minute. Simple, but allows a double burst at the window edge.
- **Sliding window** — smooths the edge by weighting the previous window.
- **Token bucket** — tokens refill at a steady rate; each request spends one. Allows controlled bursts; the usual default.

## State must be shared

On multiple instances or serverless, an in-memory counter is wrong. Keep counters in Redis and make the check-and-decrement **atomic** (a Lua script, or INCR with an expiry) so concurrent requests can't over-spend.

**Key insight:** the algorithm matters less than where the counter lives — it must be shared and updated atomically.`,
    keyTakeaways: [
      'Token bucket handles bursts gracefully and is the usual default.',
      'Fixed windows allow a double burst at the boundary.',
      'Counters must be shared and updated atomically across instances.',
    ],
    questionsToAnswer: [
      'Why does an in-memory limiter fail on serverless or multiple instances?',
      'How does token bucket allow bursts that a fixed window does not?',
    ],
    commonMisconceptions: [
      'Rate limiting is only about blocking attackers.',
      'A per-process counter is good enough.',
    ],
    practicalChecklist: [
      'Store counters in shared storage (Redis).',
      'Make the increment-and-check atomic.',
      'Return 429 with a Retry-After header.',
    ],
  },
  {
    slug: 'background-jobs-and-queues',
    moduleSlug: 'practical-saas-backend',
    title: 'Background jobs and queues',
    order: 5,
    summary:
      'Move slow, flaky work out of the request and make it retryable with a queue.',
    body: `## Do not do slow work in the request

Sending email, calling third-party APIs, generating PDFs — push these to a queue and return fast. The request stays snappy and failures become retryable.

## Anatomy of a queue

A producer enqueues a message; a worker pulls and processes it; on failure it retries with backoff; after N failures it lands in a **dead-letter queue (DLQ)** for inspection. Delivery is **at-least-once**, so workers must be **idempotent** — a message can arrive twice.

## Patterns

- A **visibility timeout** so a crashed worker's message reappears.
- **Exponential backoff + jitter** on retries.
- A **DLQ + alert** so a poison message doesn't loop forever.

**Key insight:** queues turn "must succeed now" into "will succeed eventually, with retries and visibility."`,
    keyTakeaways: [
      'Offload slow/unreliable work to a queue and return fast.',
      'Workers must be idempotent because delivery is at-least-once.',
      'Use backoff plus a DLQ so failures are retryable and visible.',
    ],
    questionsToAnswer: [
      'Why must a queue worker be idempotent?',
      'What problem does a dead-letter queue solve?',
    ],
    commonMisconceptions: [
      'A queue guarantees exactly-once delivery.',
      'A failed job should retry immediately and forever.',
    ],
    practicalChecklist: [
      'Enqueue side-effects instead of running them inline.',
      'Add retry with exponential backoff and jitter.',
      'Route repeated failures to a DLQ with an alert.',
    ],
  },

  // --- Database Deep Dive (continued) --------------------------------------
  {
    slug: 'connection-pooling-explained',
    moduleSlug: 'database-deep-dive',
    title: 'Connection pooling explained',
    order: 3,
    summary:
      'Why a connection per request exhausts Postgres, and how poolers fix it on serverless.',
    body: `## Connections are expensive

Each Postgres connection costs memory and a backend process. Opening one per request — especially on serverless, where instances multiply — exhausts the database fast.

## Pooling, in two layers

- **App pool** (e.g. \`pg\` Pool) — reuse connections within one long-running process.
- **External pooler** (PgBouncer / the Neon pooled endpoint) — multiplexes many clients onto a few DB connections. Essential for serverless, where each function instance would otherwise hold its own connection.

## Transaction vs session mode

Transaction-mode pooling lends a connection only for the duration of a transaction, so session state and some prepared statements don't persist — keep queries stateless.

**Key insight:** on serverless, always use the **pooled** endpoint; the direct endpoint runs out of connections under load.`,
    keyTakeaways: [
      'A connection per request exhausts Postgres, especially on serverless.',
      'Use a pooler (PgBouncer / Neon pooled endpoint) to multiplex clients.',
      'Transaction-mode pooling means no durable session state.',
    ],
    questionsToAnswer: [
      'Why does serverless make connection exhaustion worse?',
      'What breaks under transaction-mode pooling?',
    ],
    commonMisconceptions: [
      'The app pool alone is enough on serverless.',
      'Pooling changes query semantics (it changes connection lifetime, not SQL).',
    ],
    practicalChecklist: [
      'Point serverless at the pooled connection string.',
      'Keep pool sizes small and bounded.',
      'Avoid relying on session-level state.',
    ],
  },
  {
    slug: 'safe-migrations-on-live-tables',
    moduleSlug: 'database-deep-dive',
    title: 'Safe migrations on live tables',
    order: 4,
    summary:
      'Change schema on a busy table without locking yourself into an outage.',
    body: `## The risk

A migration that takes a long lock on a big table blocks all reads and writes — an outage. Adding a NOT NULL column with a default, or building an index without \`CONCURRENTLY\`, can hold that lock.

## Expand / contract

Ship schema changes in backward-compatible phases:

1. **Expand** — add the new (nullable) column/table; deploy code that writes both old and new.
2. **Backfill** — populate the new column in batches.
3. **Contract** — switch reads to the new column, then drop the old one in a later deploy.

## Postgres specifics

- \`CREATE INDEX CONCURRENTLY\` to avoid locking writes.
- Add columns nullable first, backfill, then add the NOT NULL constraint validated.
- Keep each migration small and reversible.

**Key insight:** never do a destructive, long-locking change in one step on a live table — expand, backfill, contract.`,
    keyTakeaways: [
      'Long locks on big tables cause outages.',
      'Expand → backfill → contract keeps every step backward-compatible.',
      'CREATE INDEX CONCURRENTLY and nullable-then-backfill avoid blocking writes.',
    ],
    questionsToAnswer: [
      'Why can adding a NOT NULL column with a default be dangerous on a huge table?',
      'How does expand/contract let you deploy code and schema independently?',
    ],
    commonMisconceptions: [
      'Migrations are safe because they ran fast on a small dev table.',
      'Schema and code must change in the same deploy.',
    ],
    practicalChecklist: [
      'Add columns nullable, then backfill in batches.',
      'Build indexes CONCURRENTLY.',
      'Keep migrations small and reversible.',
    ],
  },

  // --- Reliability & Observability -----------------------------------------
  {
    slug: 'logs-metrics-and-traces',
    moduleSlug: 'reliability-observability',
    title: 'Logs, metrics, and traces',
    order: 1,
    summary:
      'The three pillars of observability and how they answer different questions in an incident.',
    body: `## The three pillars

- **Logs** — discrete events with context ("order 123 failed: card declined"). Best for the specific; emit them as structured JSON so they're queryable.
- **Metrics** — numeric time series (request rate, error rate, p95 latency). Cheap to store; great for dashboards and alerts.
- **Traces** — the path of one request across services/functions, showing where the time went.

## Use them together

Metrics tell you *something* is wrong (error rate spiked); traces tell you *where* (the payment call is slow); logs tell you *why* (a downstream 503).

## Make logs useful

Structured JSON, a correlation/request id threaded through every line, no secrets, and consistent levels.

**Key insight:** instrument for the question you'll ask at 2am — "what changed, where, and why?"`,
    keyTakeaways: [
      'Logs are events, metrics are trends, traces are request paths — you need all three.',
      'Thread a correlation id so logs and traces line up.',
      'Structured logs are queryable; free-text logs are not.',
    ],
    questionsToAnswer: [
      'Which pillar tells you something is wrong vs where it is wrong?',
      'Why attach a request id to every log line?',
    ],
    commonMisconceptions: [
      'More logging is always better (cost and noise are real).',
      'Metrics can replace traces.',
    ],
    practicalChecklist: [
      'Emit structured JSON logs with a request id.',
      'Track RED metrics: Rate, Errors, Duration.',
      'Never log secrets or full PII.',
    ],
  },
  {
    slug: 'slos-and-error-budgets',
    moduleSlug: 'reliability-observability',
    title: 'SLOs and error budgets',
    order: 2,
    summary:
      'Turn "is it reliable enough?" into a number that governs how fast you ship.',
    body: `## SLI, SLO, SLA

- **SLI** (indicator) — a measured number, e.g. the percent of requests under 300ms.
- **SLO** (objective) — your target, e.g. 99.9% of requests succeed over 30 days.
- **SLA** — a contractual promise (often with penalties), usually looser than your SLO.

## Error budget

100% reliability is the wrong target — impossible and ruinously expensive. An SLO of 99.9% gives a **0.1% error budget**. Spend it shipping features; if you blow it, freeze risky changes and focus on reliability.

**Key insight:** the error budget turns reliability from a feeling into a number that arbitrates features vs hardening.`,
    keyTakeaways: [
      'SLI is measured, SLO is your target, SLA is the contract.',
      'Error budget = 100% minus the SLO, and it is meant to be spent.',
      'Blowing the budget should change behavior: slow down and harden.',
    ],
    questionsToAnswer: [
      'Why is 100% reliability the wrong goal?',
      'How does an error budget arbitrate features vs reliability?',
    ],
    commonMisconceptions: [
      'A higher SLO is always better.',
      'SLOs are only for big companies.',
    ],
    practicalChecklist: [
      'Pick one or two user-facing SLIs (latency, availability).',
      'Set a realistic SLO and compute the budget.',
      'Define what happens when the budget is exhausted.',
    ],
  },
  {
    slug: 'retries-timeouts-and-circuit-breakers',
    moduleSlug: 'reliability-observability',
    title: 'Retries, timeouts, and circuit breakers',
    order: 3,
    summary:
      'Contain other systems’ failures so a slow dependency does not take you down too.',
    body: `## Failures cascade

A slow dependency without a timeout ties up your threads and connections until you fall over too. Reliability is mostly about containing other people's failures.

## The toolkit

- **Timeouts** — never wait forever; bound every network call.
- **Retries with backoff + jitter** — retry transient failures, but space them out and randomize so you don't stampede the dependency.
- **Circuit breaker** — after repeated failures, "open" the circuit and fail fast for a cooldown instead of hammering a dead service; periodically test for recovery.
- **Idempotency** — required, because retries can duplicate effects.

**Key insight:** retries without timeouts and a breaker amplify outages instead of surviving them.`,
    keyTakeaways: [
      'Bound every external call with a timeout.',
      'Retry transient errors with exponential backoff and jitter.',
      'A circuit breaker fails fast to protect both you and the dependency.',
    ],
    questionsToAnswer: [
      'How can naive retries make an outage worse?',
      'What does opening a circuit breaker protect against?',
    ],
    commonMisconceptions: [
      'Retrying more aggressively improves reliability.',
      'Timeouts are optional if a dependency is usually fast.',
    ],
    practicalChecklist: [
      'Set timeouts on all I/O.',
      'Add jittered backoff to retries.',
      'Wrap flaky dependencies in a breaker and keep operations idempotent.',
    ],
  },

  // --- Architecture Patterns -----------------------------------------------
  {
    slug: 'monolith-to-microservices',
    moduleSlug: 'architecture-patterns',
    title: 'Monolith to microservices',
    order: 1,
    summary:
      'Start with a modular monolith and split only when something real forces you to.',
    body: `## Start with a modular monolith

One deployable, clear internal module boundaries, one database. You get simple deploys, easy transactions, and refactorable seams — most products never need more.

## When microservices earn their cost

Split only with a real forcing function: independent scaling, independent deploy cadence, team autonomy, or fault isolation. The cost is high — network calls, distributed transactions, eventual consistency, and operational overhead.

## Cut along the right seams

Split by **business capability** (billing, notifications), not by technical layer. Each service owns its data; no shared database.

**Key insight:** microservices trade in-process simplicity for organizational scalability — pay only when the org or scale demands it.`,
    keyTakeaways: [
      'A modular monolith gets most benefits without distributed-systems pain.',
      'Split for scaling, team autonomy, or fault isolation — not fashion.',
      'Services own their data and are split by business capability.',
    ],
    questionsToAnswer: [
      'What forcing functions actually justify microservices?',
      'Why is splitting by technical layer a trap?',
    ],
    commonMisconceptions: [
      'Microservices are the mature, default choice.',
      'You can keep a shared database across services.',
    ],
    practicalChecklist: [
      'Enforce module boundaries inside the monolith first.',
      'Name a concrete reason before extracting a service.',
      'Give each extracted service its own data store.',
    ],
  },
  {
    slug: 'event-driven-and-the-outbox-pattern',
    moduleSlug: 'architecture-patterns',
    title: 'Event-driven design and the outbox pattern',
    order: 2,
    summary:
      'Decouple systems with events, and emit them reliably without the dual-write trap.',
    body: `## Events decouple producers from consumers

Instead of calling every downstream system inline, emit an event ("InvoicePaid") and let consumers react. Teams decouple and spikes get absorbed by a queue.

## The dual-write problem

You must update your DB **and** publish an event. Write the row then crash before publishing (or vice versa) and the two diverge — you can't atomically write to a database and a message broker.

## The outbox pattern

In the **same transaction** that changes your data, insert an "outbox" row describing the event. A separate relay polls the outbox and publishes, marking rows sent. Now the event is emitted if and only if the data change committed.

**Key insight:** the outbox makes "change data + emit event" atomic by keeping the event inside the same database transaction.`,
    keyTakeaways: [
      'Event-driven design decouples producers and consumers.',
      'Dual writes (DB plus broker) can diverge on failure.',
      'The outbox pattern makes the data change and the event atomic.',
    ],
    questionsToAnswer: [
      'Why can you not just write the row then publish the event?',
      'What does the outbox relay process do?',
    ],
    commonMisconceptions: [
      'A try/catch around publish is good enough.',
      'Events make systems simpler (they add eventual consistency).',
    ],
    practicalChecklist: [
      'Write events to an outbox table in the same transaction.',
      'Relay and publish from the outbox asynchronously.',
      'Make consumers idempotent.',
    ],
  },

  // --- System Design Foundation --------------------------------------------
  {
    slug: 'a-repeatable-system-design-method',
    moduleSlug: 'system-design-foundation',
    title: 'A repeatable system design method',
    order: 1,
    summary:
      'A fixed sequence of steps so you never freeze on a design problem.',
    body: `## A method beats memorized answers

Use the same steps every time:

1. **Requirements** — functional (what it does) and non-functional (scale, latency, consistency).
2. **Estimate** — rough QPS, data size, read/write ratio. Order-of-magnitude only.
3. **API + data model** — the contract and the core entities/tables.
4. **High-level design** — clients → API → services → data stores → async workers.
5. **Scale the bottleneck** — cache hot reads, replicate/shard, queue writes.
6. **Trade-offs** — name what you gave up (consistency, cost, complexity).

**Key insight:** real designs and interviews reward a clear method and explicit trade-offs over a "perfect" answer.`,
    keyTakeaways: [
      'Always start from requirements and a rough estimate.',
      'Design the API and data model before the boxes and arrows.',
      'Scale the actual bottleneck and state the trade-offs you accept.',
    ],
    questionsToAnswer: [
      'Why estimate scale before choosing a design?',
      'What is the difference between functional and non-functional requirements?',
    ],
    commonMisconceptions: [
      'There is one correct architecture.',
      'You should jump straight to databases and caches.',
    ],
    practicalChecklist: [
      'Write functional and non-functional requirements first.',
      'Do a back-of-the-envelope estimate.',
      'End by naming the trade-offs.',
    ],
  },
  {
    slug: 'caching-strategies-and-pitfalls',
    moduleSlug: 'system-design-foundation',
    title: 'Caching strategies and pitfalls',
    order: 2,
    summary:
      'Cut latency and DB load with caching — and survive the invalidation problems it creates.',
    body: `## Why cache

Move hot data closer and faster to cut latency and database load. The cost is the hardest problem in computing: invalidation.

## Patterns

- **Cache-aside (lazy)** — app checks the cache; on a miss it reads the DB and populates the cache. The common default.
- **Write-through** — write to cache and DB together: fresher reads, slower writes.
- **TTL** — expire entries after a time; simple, but can serve stale data.

## Pitfalls

- **Stale data** — invalidate or version keys on write.
- **Thundering herd** — when a hot key expires, many misses hit the DB at once; use a lock or staggered TTLs.
- **Cache penetration** — cache "not found" too, so missing keys don't hammer the DB.

**Key insight:** caching is choosing how wrong you're willing to be, and for how long — set a staleness budget per key.`,
    keyTakeaways: [
      'Cache-aside is the default; write-through trades write speed for freshness.',
      'Invalidation and stale data are the real cost of caching.',
      'Guard against thundering herd and cache penetration.',
    ],
    questionsToAnswer: [
      'What is the thundering-herd problem and how do you mitigate it?',
      'When is serving slightly stale data acceptable?',
    ],
    commonMisconceptions: [
      'Caching is free, correctness-wise.',
      'A longer TTL is always better.',
    ],
    practicalChecklist: [
      'Pick a staleness budget per cached key.',
      'Invalidate or version keys on write.',
      'Protect hot-key expiry with a lock or jittered TTL.',
    ],
  },

  // --- Serverless to Traditional Backend (continued) -----------------------
  {
    slug: 'when-to-leave-serverless',
    moduleSlug: 'serverless-to-traditional-backend',
    title: 'When to leave serverless',
    order: 2,
    summary:
      'The concrete signals that a workload has outgrown serverless — and why a hybrid usually beats a rewrite.',
    body: `## Serverless is great until it is not

Serverless (Vercel functions, Lambda) gives zero-ops scaling and pay-per-use. You outgrow it when its constraints cost more than a server would.

## Signals to graduate

- **Long-running or streaming work** that exceeds function timeouts.
- **Steady high traffic** where always-on is cheaper than per-invocation.
- **Connection limits** — even with pooling, very high concurrency strains the DB.
- **Stateful needs** — in-memory caches, websockets, long-lived loops.
- **Cold starts** hurting latency-sensitive paths.

## The middle path

Often you keep serverless for the API and add a small long-running **worker** (a queue consumer on a container) for the heavy parts — instead of migrating everything.

**Key insight:** migrate the workload that fights serverless, not the whole app.`,
    keyTakeaways: [
      'Serverless trades ops for constraints: timeouts, cold starts, connections, no state.',
      'Move to a long-running backend when those constraints dominate.',
      'A hybrid (serverless API plus a worker) usually beats a full rewrite.',
    ],
    questionsToAnswer: [
      'Which workloads fight serverless the hardest?',
      'Why is a hybrid often better than migrating everything?',
    ],
    commonMisconceptions: [
      'Serverless cannot scale for real products.',
      'Leaving serverless means rewriting the whole app.',
    ],
    practicalChecklist: [
      'Identify the specific workload hitting limits.',
      'Move just that part to a container or worker.',
      'Keep using a connection pooler regardless.',
    ],
  },
];
