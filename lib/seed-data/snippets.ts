import type { SnippetSeed } from './types';

export const snippetSeeds: SnippetSeed[] = [
  {
    title: 'Next.js route handler with validation',
    language: 'typescript',
    category: 'api',
    conceptSlug: 'api-validation',
    tags: ['zod', 'route-handler'],
    useCase: 'Validate an untrusted request body and return typed data or a 400.',
    explanation:
      'Parse at the boundary with Zod; on failure return a field-level 400, on success work with a fully typed object.',
    code: `import { z } from 'zod';

const Body = z.object({
  title: z.string().min(1).max(160),
  amount: z.number().int().positive(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: { code: 'invalid_body', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }
  const { title, amount } = parsed.data; // typed + trusted
  // ... mutate, then:
  return Response.json({ ok: true }, { status: 201 });
}`,
  },
  {
    title: 'Drizzle transaction example',
    language: 'typescript',
    category: 'database',
    conceptSlug: 'transactions',
    tags: ['drizzle', 'transaction'],
    useCase: 'Atomically debit one account and credit another with a ledger entry.',
    explanation:
      'All three writes commit together or roll back together. Arithmetic is done in SQL to avoid lost updates.',
    code: `await db.transaction(async (tx) => {
  await tx
    .update(accounts)
    .set({ balance: sql\`balance - \${amount}\` })
    .where(and(eq(accounts.id, from), gte(accounts.balance, amount)));

  await tx
    .update(accounts)
    .set({ balance: sql\`balance + \${amount}\` })
    .where(eq(accounts.id, to));

  await tx.insert(ledger).values({ from, to, amount });
});`,
  },
  {
    title: 'Idempotency key handling',
    language: 'typescript',
    category: 'api',
    conceptSlug: 'idempotency',
    tags: ['idempotency', 'payments'],
    useCase: 'Make a create endpoint safe to retry without duplicating the effect.',
    explanation:
      'Store the key and the result inside the same transaction as the effect. A repeat returns the stored result.',
    code: `const key = req.headers.get('Idempotency-Key');

const existing = await db.query.idempotencyKeys.findFirst({
  where: eq(idempotencyKeys.key, key),
});
if (existing) return Response.json(existing.result); // replay

await db.transaction(async (tx) => {
  const result = await doTheEffect(tx); // the real work
  await tx.insert(idempotencyKeys).values({ key, result }); // same tx!
});`,
  },
  {
    title: 'Webhook signature verification',
    language: 'pseudo',
    category: 'webhook',
    conceptSlug: 'webhooks',
    tags: ['hmac', 'security'],
    useCase: 'Reject forged webhooks before processing anything.',
    explanation:
      'Compute an HMAC over the raw body with the shared secret and compare in constant time. Never parse before verifying.',
    code: `function verify(rawBody, signatureHeader, secret):
    expected = hmac_sha256(secret, rawBody)
    if not constant_time_equals(expected, signatureHeader):
        reject(400 "bad signature")
    # also check timestamp to prevent replay
    if now() - parse_timestamp(signatureHeader) > 5min:
        reject(400 "stale")
    return parse_json(rawBody)`,
  },
  {
    title: 'Rate limiter (token bucket) pseudo-code',
    language: 'pseudo',
    category: 'rate-limit',
    conceptSlug: 'rate-limiting',
    labSlug: 'implement-a-rate-limiter',
    tags: ['token-bucket', 'redis'],
    useCase: 'Allow bursts up to a cap while enforcing an average rate, atomically.',
    explanation:
      'Refill tokens based on elapsed time, then try to spend one. In production run this as a Redis Lua script so it is atomic across instances.',
    code: `limit(key, capacity, refillPerSec):
    now = clock()
    bucket = store.get(key) or { tokens: capacity, ts: now }
    bucket.tokens = min(capacity, bucket.tokens + (now - bucket.ts) * refillPerSec)
    bucket.ts = now
    if bucket.tokens >= 1:
        bucket.tokens -= 1
        store.set(key, bucket)
        return ALLOW(remaining = floor(bucket.tokens))
    store.set(key, bucket)
    return DENY(retryAfter = (1 - bucket.tokens) / refillPerSec)`,
  },
  {
    title: 'Retry with exponential backoff + jitter',
    language: 'typescript',
    category: 'queue',
    conceptSlug: 'retry-strategy',
    tags: ['backoff', 'jitter'],
    useCase: 'Retry a flaky call without creating a thundering herd.',
    explanation:
      'Only retry transient errors; back off exponentially with full jitter; cap attempts.',
    code: `async function withRetry<T>(fn: () => Promise<T>, max = 5): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= max || !isTransient(err)) throw err;
      const cap = Math.min(30_000, 200 * 2 ** attempt);
      await sleep(Math.random() * cap); // full jitter
    }
  }
}`,
  },
  {
    title: 'Queue worker loop pseudo-code',
    language: 'pseudo',
    category: 'queue',
    conceptSlug: 'queues',
    tags: ['worker', 'dlq'],
    useCase: 'Drain a queue with at-least-once semantics and a dead-letter path.',
    explanation:
      'Acknowledge only after success. Idempotent handlers make redelivery safe; exhausted messages go to the DLQ.',
    code: `loop:
    msg = queue.receive(visibilityTimeout = 30s)
    if not msg: continue
    try:
        handle(msg)        # MUST be idempotent
        queue.ack(msg)
    except TransientError:
        if msg.attempts >= MAX:
            dlq.send(msg); queue.ack(msg)
        # else: let visibility timeout expire -> redelivered with backoff
    except PermanentError:
        dlq.send(msg); queue.ack(msg)`,
  },
  {
    title: 'Cursor-based pagination (SQL)',
    language: 'sql',
    category: 'database',
    conceptSlug: 'pagination',
    labSlug: 'design-cursor-pagination',
    tags: ['cursor', 'index'],
    useCase: 'Stable, fast pagination over a large, append-heavy table.',
    explanation:
      'Filter by the last row’s composite sort key instead of OFFSET; back it with an index on (created_at, id).',
    code: `-- page after the cursor (created_at, id), newest first
SELECT *
FROM events
WHERE (created_at, id) < ($cursor_created_at, $cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT $take;

-- supporting index
CREATE INDEX events_cursor_idx ON events (created_at DESC, id DESC);`,
  },
  {
    title: 'API error response helper',
    language: 'typescript',
    category: 'api',
    conceptSlug: 'api-error-handling',
    tags: ['errors', 'convention'],
    useCase: 'One consistent error envelope and a central mapper.',
    explanation:
      'Throw typed AppErrors; map them centrally to the envelope; unknown errors become a safe 500.',
    code: `export class AppError extends Error {
  constructor(public code: string, public status = 400, public details?: unknown) {
    super(code);
  }
}

export function toResponse(err: unknown): Response {
  if (err instanceof AppError) {
    return Response.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status },
    );
  }
  console.error(err); // log full detail server-side
  return Response.json({ error: { code: 'internal_error' } }, { status: 500 });
}`,
  },
  {
    title: 'Multi-tenant query guard',
    language: 'typescript',
    category: 'security',
    conceptSlug: 'multi-tenancy',
    tags: ['tenant', 'isolation'],
    useCase: 'Make it structurally hard to forget tenant scoping.',
    explanation:
      'Funnel every read/write through a helper that injects tenant_id. Pair with Postgres RLS as a backstop.',
    code: `function tenantScope(tenantId: string) {
  return {
    list: <T extends { tenantId: string }>(table: PgTable, where?: SQL) =>
      db.select().from(table).where(and(eq(table.tenantId, tenantId), where)),
    // every accessor injects tenantId — callers cannot omit it
  };
}

// Backstop in SQL:
// ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
// CREATE POLICY tenant_isolation ON invoices
//   USING (tenant_id = current_setting('app.tenant_id')::uuid);`,
  },
  {
    title: 'Structured logging helper',
    language: 'typescript',
    category: 'observability',
    conceptSlug: 'logging',
    tags: ['logging', 'correlation-id'],
    useCase: 'Attach request id and tenant to every log line as JSON.',
    explanation:
      'Bind context once per request; emit JSON so logs are queryable. Never log secrets.',
    code: `function createLogger(ctx: { requestId: string; tenantId?: string }) {
  const base = { requestId: ctx.requestId, tenantId: ctx.tenantId };
  const emit = (level: string, msg: string, fields?: object) =>
    console.log(JSON.stringify({ level, msg, ...base, ...fields, ts: Date.now() }));
  return {
    info: (msg: string, f?: object) => emit('info', msg, f),
    error: (msg: string, f?: object) => emit('error', msg, f),
  };
}`,
  },
  {
    title: 'Health check endpoint',
    language: 'typescript',
    category: 'observability',
    conceptSlug: 'health-checks',
    tags: ['health', 'readiness'],
    useCase: 'Readiness probe that fails fast when the database is unreachable.',
    explanation:
      'Liveness is trivial; readiness pings the DB with a short timeout and returns 503 if it is down.',
    code: `export async function GET() {
  try {
    await Promise.race([
      db.execute(sql\`select 1\`),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000)),
    ]);
    return Response.json({ status: 'ready' });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}`,
  },
  {
    title: 'Database migration checklist',
    language: 'pseudo',
    category: 'deployment',
    conceptSlug: 'migrations',
    tags: ['migrations', 'expand-contract'],
    useCase: 'Ship a schema change to a live table without downtime.',
    explanation:
      'Use expand/contract: add the new shape, backfill, switch reads/writes, then remove the old shape in a later deploy.',
    code: `[ ] Generate migration from schema diff (drizzle-kit generate)
[ ] Review SQL — watch for table-rewriting/locking ALTERs
[ ] EXPAND: add new column/table (nullable, no NOT NULL yet)
[ ] Deploy app that writes both old + new
[ ] Backfill existing rows (batched)
[ ] Switch reads to new shape
[ ] Add constraints / NOT NULL once backfilled
[ ] CONTRACT: drop old column in a later migration
[ ] Verify on a restored backup before prod`,
  },
];
