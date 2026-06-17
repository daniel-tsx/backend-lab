import type { LabSeed } from './types';

export const labSeeds: LabSeed[] = [
  {
    slug: 'implement-a-rate-limiter',
    title: 'Implement fixed-window, sliding-window, and token-bucket rate limiting',
    conceptSlug: 'rate-limiting',
    moduleSlug: 'practical-saas-backend',
    difficulty: 'intermediate',
    labType: 'implement',
    status: 'completed',
    description:
      'Build three rate-limiting algorithms behind a common interface and compare their burst behavior.',
    scenario:
      'Your public API is getting hammered by a few clients. You need a limiter that is correct across serverless instances and returns proper headers.',
    requirements: `- Implement \`fixedWindow\`, \`slidingWindow\`, and \`tokenBucket\` behind a shared \`limit(key): { allowed, remaining, resetAt }\` interface.
- State must be shared (simulate with a Map now, Redis later) — not per-instance.
- Return \`X-RateLimit-Remaining\` and \`Retry-After\` on rejection.
- Make the check atomic (no read-modify-write race).`,
    starterCode: `interface RateLimitResult { allowed: boolean; remaining: number; resetAt: number }
interface Limiter { limit(key: string): Promise<RateLimitResult> }

// TODO: implement the three strategies`,
    expectedSolution: `Token bucket is usually the best default for APIs — it allows controlled bursts while enforcing an average rate.

\`\`\`ts
function tokenBucket(capacity: number, refillPerSec: number): Limiter {
  const buckets = new Map<string, { tokens: number; ts: number }>();
  return {
    async limit(key) {
      const now = Date.now();
      const b = buckets.get(key) ?? { tokens: capacity, ts: now };
      const elapsed = (now - b.ts) / 1000;
      b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
      b.ts = now;
      const allowed = b.tokens >= 1;
      if (allowed) b.tokens -= 1;
      buckets.set(key, b);
      return { allowed, remaining: Math.floor(b.tokens), resetAt: now + 1000 };
    },
  };
}
\`\`\`

In production, move the bucket math into a Redis Lua script so the read-modify-write is atomic across instances.`,
    hints: [
      'Fixed window is a counter per (key, bucket) — watch the edge-burst problem.',
      'Sliding window weights the previous window by how far into the current one you are.',
      'For correctness across instances, the whole check must be atomic.',
    ],
    successCriteria: [
      'All three strategies share one interface.',
      'Token bucket allows a burst up to capacity then throttles to the refill rate.',
      'Rejections include Retry-After.',
      'You can articulate why in-memory state fails on serverless.',
    ],
    timeSpentMinutes: 95,
    confidenceBefore: 4,
    confidenceAfter: 8,
    notes: 'Token bucket clicked once I thought of it as continuous refill, not discrete windows.',
    whatLearned:
      'The edge-burst weakness of fixed windows, and that atomicity is the whole game on serverless.',
    thingsGotWrong:
      'First version did read-then-write non-atomically and overcounted under concurrency.',
  },
  {
    slug: 'idempotent-webhook-handler',
    title: 'Design an idempotent webhook handler',
    conceptSlug: 'webhooks',
    moduleSlug: 'practical-saas-backend',
    difficulty: 'advanced',
    labType: 'design',
    status: 'in-progress',
    description: 'Make a webhook endpoint safe against duplicate, out-of-order, at-least-once delivery.',
    scenario:
      'Stripe sends `invoice.paid`. The same event may arrive twice; a retry may arrive after a later event. You must never double-apply.',
    requirements: `- Verify the signature before any processing.
- Record \`event.id\` with a unique constraint to dedupe.
- Persist the dedupe record and the effect in the **same transaction**.
- Return 2xx within ~1s; do heavy work asynchronously.
- Handle out-of-order events (don't regress newer state with an older event).`,
    starterCode: `export async function POST(req: Request) {
  // TODO verify signature, dedupe by event.id, enqueue, return fast 2xx
}`,
    expectedSolution: `Insert the event id with \`ON CONFLICT DO NOTHING\`; if zero rows inserted, it's a duplicate — return 200 immediately. Otherwise enqueue the work in the same transaction (or via an outbox) and return 200. Guard out-of-order by comparing an event timestamp/version before applying.`,
    hints: [
      'A unique index on event id turns dedupe into a single insert.',
      'The dedupe row and the effect must share one transaction or you can lose the guarantee on a crash.',
      'Returning 2xx fast prevents provider retries.',
    ],
    successCriteria: [
      'Duplicate deliveries cause exactly one effect.',
      'Signature is verified first.',
      '2xx returned quickly; processing is async.',
      'Out-of-order events do not regress state.',
    ],
    timeSpentMinutes: 40,
    confidenceBefore: 5,
    notes: 'Still deciding between inline-transaction enqueue vs. an outbox table.',
  },
  {
    slug: 'queue-retry-strategy',
    title: 'Build a background job retry strategy',
    conceptSlug: 'retry-strategy',
    moduleSlug: 'reliability-observability',
    difficulty: 'intermediate',
    labType: 'implement',
    status: 'not-started',
    description: 'Implement exponential backoff with jitter, max attempts, and a dead-letter path.',
    scenario:
      'A worker calls a flaky third-party API. Naive immediate retries cause a thundering herd during their outages.',
    requirements: `- Exponential backoff with **full jitter**.
- Cap attempts; route exhausted jobs to a DLQ.
- Only retry transient errors (timeouts, 5xx, 429) — not 4xx.
- Ensure the job is idempotent so retries are safe.`,
    starterCode: `function backoffMs(attempt: number): number {
  // TODO exponential + full jitter
  return 0;
}`,
    expectedSolution: `\`\`\`ts
function backoffMs(attempt: number, base = 200, cap = 30_000) {
  const exp = Math.min(cap, base * 2 ** attempt);
  return Math.random() * exp; // full jitter
}
\`\`\`
Classify errors: retry on timeout/5xx/429, fail fast on 4xx. After N attempts, move to the DLQ and alert on DLQ depth.`,
    hints: [
      'Full jitter = random between 0 and the exponential cap.',
      'Distinguish retryable vs. terminal errors.',
      'A retry without idempotency can double an effect.',
    ],
    successCriteria: [
      'Backoff grows exponentially with jitter.',
      'Only transient errors are retried.',
      'Exhausted jobs land in a DLQ with an alert.',
    ],
  },
  {
    slug: 'cache-invalidation-plan',
    title: 'Design a cache invalidation strategy',
    conceptSlug: 'cache-invalidation',
    moduleSlug: 'system-design-foundation',
    difficulty: 'advanced',
    labType: 'design',
    status: 'not-started',
    description: 'Choose TTL vs. write-through vs. tag invalidation for three different data types.',
    scenario:
      'A dashboard caches: (a) public reference data, (b) a per-user computed summary, (c) a billing balance.',
    requirements: `- Pick a strategy per data type and justify staleness tolerance.
- Prevent cache stampede on hot-key expiry.
- Define cache keys (avoid caching per-user data under a shared key).`,
    expectedSolution: `Reference data: long TTL + purge on rare updates. Per-user summary: short TTL keyed by user id, or tag-invalidate on the user's writes. Billing balance: do **not** cache mid-transaction; read from the source of truth. Mitigate stampede with a short lock or stale-while-revalidate.`,
    hints: [
      'Match TTL to how stale each datum may be.',
      'Per-user data must be keyed by user.',
      'Stampede protection: lock or serve-stale-while-revalidating.',
    ],
    successCriteria: [
      'Each data type has a justified strategy.',
      'No per-user data cached under a shared key.',
      'A stampede mitigation is specified.',
    ],
  },
  {
    slug: 'multi-tenant-data-model',
    title: 'Model multi-tenant data in PostgreSQL',
    conceptSlug: 'multi-tenancy',
    moduleSlug: 'database-deep-dive',
    difficulty: 'advanced',
    labType: 'design',
    status: 'in-progress',
    description: 'Design a shared-schema multi-tenant model with enforced isolation and fast queries.',
    scenario: 'A B2B tool will host many organizations. One leak across tenants is unacceptable.',
    requirements: `- Add \`tenant_id\` to every owned table.
- Specify how isolation is enforced where queries run.
- Add composite indexes for tenant-scoped access.
- Decide if/where Row-Level Security applies.`,
    expectedSolution: `Shared schema with \`tenant_id\` everywhere; a guarded query helper injects \`tenant_id\` so it can't be forgotten; RLS as a backstop; composite indexes on \`(tenant_id, created_at, id)\` for list/pagination. Reserve database-per-tenant for strict compliance needs.`,
    hints: [
      'Make forgetting tenant_id structurally impossible.',
      'Index for the tenant-scoped query patterns.',
      'RLS protects you even if app code slips.',
    ],
    successCriteria: [
      'Every owned table carries tenant_id.',
      'Isolation enforced at the query layer (+ optional RLS).',
      'Indexes support tenant-scoped pagination.',
    ],
    timeSpentMinutes: 30,
    confidenceBefore: 5,
    notes: 'Leaning on a guarded repository pattern + RLS as belt-and-suspenders.',
  },
  {
    slug: 'transaction-safe-payment-flow',
    title: 'Debug a race condition in payment processing',
    conceptSlug: 'transactions',
    moduleSlug: 'database-deep-dive',
    difficulty: 'advanced',
    labType: 'debug',
    status: 'completed',
    description: 'Find and fix a lost-update bug in a balance-debit flow under concurrency.',
    scenario:
      'Two concurrent requests debit the same wallet. Occasionally the balance ends up higher than it should — money is being created.',
    requirements: `- Reproduce the lost update with two concurrent transactions.
- Fix it without breaking throughput too much.
- Ensure a retry can't double-debit (idempotency).`,
    starterCode: `// buggy: read, compute, write
const { balance } = await getWallet(id);
await setBalance(id, balance - amount);`,
    expectedSolution: `Do the arithmetic in SQL atomically and guard non-negativity:
\`\`\`sql
UPDATE wallets SET balance = balance - $amount
WHERE id = $id AND balance >= $amount;
\`\`\`
For multi-step logic, \`SELECT ... FOR UPDATE\` the row, or use SERIALIZABLE + retry. Add an idempotency key so a client retry doesn't debit twice.`,
    hints: [
      'Read-modify-write in app code is the bug.',
      'Either lock the row or do the math in the UPDATE.',
      'Retries need an idempotency key.',
    ],
    successCriteria: [
      'The lost update is reproduced, then fixed.',
      'Balance never goes negative.',
      'Retries do not double-debit.',
    ],
    timeSpentMinutes: 70,
    confidenceBefore: 4,
    confidenceAfter: 8,
    whatLearned:
      'Read Committed does NOT stop lost updates; pushing math into SQL is the cleanest fix.',
    thingsGotWrong:
      'I assumed wrapping in a transaction was enough — it is not without locking or atomic SQL.',
  },
  {
    slug: 'design-cursor-pagination',
    title: 'Design cursor pagination for large datasets',
    conceptSlug: 'pagination',
    moduleSlug: 'backend-fundamentals',
    difficulty: 'intermediate',
    labType: 'implement',
    status: 'completed',
    description: 'Replace deep OFFSET pagination with stable, index-backed cursor pagination.',
    scenario: 'A list endpoint scans millions of rows; page 5000 takes seconds and sometimes skips/duplicates rows.',
    requirements: `- Use a stable composite sort key (e.g. created_at, id).
- Encode an opaque cursor; never expose raw offsets.
- Back the query with a matching index.`,
    starterCode: `// slow: OFFSET $skip LIMIT $take on a huge table`,
    expectedSolution: `\`\`\`sql
SELECT * FROM events
WHERE (created_at, id) < ($cursorCreatedAt, $cursorId)
ORDER BY created_at DESC, id DESC
LIMIT $take;
\`\`\`
The cursor encodes the last row's (created_at, id). Index on (created_at, id) makes it O(log n) per page regardless of depth.`,
    hints: [
      'Tie-break the sort key with a unique column (id).',
      'The cursor is the last row’s sort key, base64-encoded.',
      'Confirm the index is used with EXPLAIN.',
    ],
    successCriteria: [
      'Page depth no longer affects latency.',
      'No skipped/duplicated rows under inserts.',
      'Cursors are opaque.',
    ],
    timeSpentMinutes: 55,
    confidenceBefore: 6,
    confidenceAfter: 9,
    whatLearned: 'Tie-breaking on id is what makes cursors stable under inserts.',
  },
  {
    slug: 'health-check-and-logging',
    title: 'Create a health check and logging strategy',
    conceptSlug: 'health-checks',
    moduleSlug: 'reliability-observability',
    difficulty: 'beginner',
    labType: 'implement',
    status: 'not-started',
    description: 'Add liveness/readiness endpoints and structured request logging with correlation ids.',
    scenario: 'During an incident you cannot tell whether instances are healthy or which request failed.',
    requirements: `- /health (liveness) and /ready (readiness with a DB ping + timeout).
- Structured JSON logs with a per-request correlation id and tenant.
- Don't log secrets.`,
    expectedSolution: `Readiness pings the DB with a short timeout and returns 503 if down. A logging helper attaches a request id (from a header or generated) and tenant to every line, emitting JSON. Liveness stays trivial so it never cascades failures.`,
    hints: [
      'Keep liveness trivial; readiness checks dependencies.',
      'Generate a correlation id at the edge and thread it through.',
      'Redact secrets/PII.',
    ],
    successCriteria: [
      'Readiness fails fast when the DB is down.',
      'Every log line carries a correlation id.',
      'No secrets in logs.',
    ],
  },
  {
    slug: 'background-email-reminder-workflow',
    title: 'Design a background email reminder workflow',
    conceptSlug: 'background-jobs',
    moduleSlug: 'practical-saas-backend',
    difficulty: 'intermediate',
    labType: 'design',
    status: 'in-progress',
    description: 'Move reminder sending off the request path with a cron + queue + idempotent worker.',
    scenario:
      'DueKind must email freelancers when invoices are due. Sends should be reliable, not blocking, and never duplicated.',
    requirements: `- A cron finds due reminders and enqueues send jobs (it does not send directly).
- A worker sends emails with retries and a DLQ.
- Sends are idempotent (no duplicate emails on retry).`,
    expectedSolution: `Cron → "find due" → enqueue one job per reminder (keyed by reminder id + scheduled date for idempotency). Worker sends via the email provider, retries transient failures with backoff, and dead-letters after N attempts. Mark the reminder sent in the same transaction as recording success.`,
    hints: [
      'The cron should enqueue, not send.',
      'Idempotency key = reminder id + scheduled date.',
      'Mark-sent and send-success must be consistent.',
    ],
    successCriteria: [
      'No reminder is sent twice.',
      'A provider outage drains to a DLQ, not a crash.',
      'The request/cron path stays fast.',
    ],
    timeSpentMinutes: 25,
    confidenceBefore: 6,
    notes: 'This is the concrete driver for the serverless-vs-dedicated decision below.',
  },
  {
    slug: 'serverless-vs-dedicated-duekind',
    title: 'Compare serverless API route vs long-running worker for DueKind',
    conceptSlug: 'serverless-functions',
    moduleSlug: 'serverless-to-traditional-backend',
    difficulty: 'intermediate',
    labType: 'compare',
    status: 'not-started',
    description: 'Decide whether DueKind’s reminder pipeline should stay serverless or move to a dedicated worker.',
    scenario:
      'Reminder volume is growing. You must decide between Vercel cron + queue + serverless worker vs. a small always-on Node worker.',
    requirements: `- List the constraints serverless imposes on this workload.
- Define the threshold (volume, latency, cost) that justifies a dedicated worker.
- Recommend a path with the trade-off stated.`,
    expectedSolution: `Stay serverless with a queue while volume is bursty and modest: cron enqueues, serverless worker drains. Move to a dedicated always-on worker when throughput is sustained (per-invocation cost flips), you need long-lived connections, or batch sends exceed function timeouts. Recommendation: keep serverless + queue now; revisit at sustained high volume.`,
    hints: [
      'Bursty + modest favors serverless + queue.',
      'Sustained throughput flips the cost equation.',
      'Name the concrete threshold, don’t hand-wave.',
    ],
    successCriteria: [
      'Constraints are enumerated.',
      'A concrete migration threshold is defined.',
      'A recommendation with trade-offs is given.',
    ],
  },
  {
    slug: 'burncap-cost-ingestion-pipeline',
    title: 'Design BurnCap cost ingestion pipeline',
    conceptSlug: 'queues',
    moduleSlug: 'system-design-foundation',
    difficulty: 'advanced',
    labType: 'design',
    status: 'not-started',
    description: 'Ingest high-volume AI usage events and aggregate them into per-tenant cost dashboards.',
    scenario:
      'Providers emit usage events (tokens, model, cost). You must ingest spikes, aggregate, and alert when a tenant nears a budget.',
    requirements: `- Buffer spiky ingestion with a queue (don’t write per-event synchronously to the dashboard).
- Aggregate by tenant + window; keep raw events for audit.
- Alert when projected spend exceeds a cap (idempotent alerts).`,
    expectedSolution: `Ingest → queue → worker writes raw events (append-only) and updates rolled-up aggregates per (tenant, day, model). A separate evaluator checks budgets and fires idempotent alerts. Index (tenant_id, recorded_at). Use backpressure (429) if ingestion outpaces the worker.`,
    hints: [
      'Separate raw events from aggregates.',
      'Aggregate windows make dashboards cheap.',
      'Alerts must be idempotent to avoid spam.',
    ],
    successCriteria: [
      'Spikes are absorbed by the queue.',
      'Dashboards read aggregates, not raw events.',
      'Budget alerts fire once, not repeatedly.',
    ],
  },
  {
    slug: 'smarttrips-trip-planning-flow',
    title: 'Design SmartTrips trip planning backend flow',
    conceptSlug: 'system-design-tradeoffs',
    moduleSlug: 'system-design-foundation',
    difficulty: 'advanced',
    labType: 'design',
    status: 'not-started',
    description: 'Design the backend for generating and caching trip plans that call slow external APIs.',
    scenario:
      'A user requests a trip plan; generation calls several slow external APIs and should feel responsive on repeat views.',
    requirements: `- Keep the request responsive despite slow upstreams.
- Cache generated plans with a sensible invalidation strategy.
- Handle partial upstream failures gracefully.`,
    expectedSolution: `Generate asynchronously (enqueue, show progress) or stream partial results; cache the finished plan keyed by trip inputs with a TTL + explicit invalidation on edits; degrade gracefully when one upstream fails (serve partial plan + retry the missing piece). State the trade-off: freshness vs. responsiveness.`,
    hints: [
      'Don’t block the request on all slow upstreams.',
      'Cache by the inputs that define the plan.',
      'Partial failure should degrade, not fail the whole plan.',
    ],
    successCriteria: [
      'The first view is responsive; repeat views are fast.',
      'Plan cache has a clear invalidation rule.',
      'One failing upstream doesn’t fail everything.',
    ],
  },
];
