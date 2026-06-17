import type { ReviewCardSeed } from './types';

export const reviewCardSeeds: ReviewCardSeed[] = [
  {
    conceptSlug: 'rate-limiting',
    question: 'Why does an in-memory rate limiter break on serverless?',
    answer:
      'Each instance has its own memory, so counters are not shared. A client hitting different instances bypasses the limit. State must live in a shared store (e.g. Redis) with atomic updates.',
    difficulty: 'medium',
    confidence: 'high',
    dueInDays: 4,
    reviewCount: 3,
  },
  {
    conceptSlug: 'rate-limiting',
    question: 'Token bucket vs fixed window — what does each optimize for?',
    answer:
      'Fixed window is simple but allows double-rate bursts at window edges. Token bucket allows controlled bursts up to a capacity while enforcing an average rate — usually the better API default.',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: -1,
    reviewCount: 2,
  },
  {
    conceptSlug: 'idempotency',
    question: 'Where must the idempotency-key record be written relative to the effect?',
    answer:
      'In the same transaction as the effect. If they are in separate transactions, a crash between them breaks the guarantee (effect without key, or key without effect).',
    difficulty: 'hard',
    confidence: 'low',
    dueInDays: -2,
    reviewCount: 1,
  },
  {
    conceptSlug: 'idempotency',
    question: 'What makes an operation naturally idempotent?',
    answer:
      'Running it twice has the same effect as once — e.g. an upsert, or "set status = paid" (vs. "increment by 1", which is not).',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: 1,
    reviewCount: 2,
  },
  {
    conceptSlug: 'webhooks',
    question: 'Why must you return 2xx quickly from a webhook endpoint?',
    answer:
      'Providers retry on timeout/non-2xx. Slow inline processing causes duplicate deliveries and timeouts. Verify, dedupe, enqueue, return 2xx; process asynchronously.',
    difficulty: 'medium',
    confidence: 'high',
    dueInDays: 6,
    reviewCount: 4,
  },
  {
    conceptSlug: 'webhooks',
    question: 'What three delivery properties must a webhook handler assume?',
    answer: 'At-least-once (duplicates), possibly out-of-order, and untrusted (verify the signature).',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: 0,
    reviewCount: 1,
  },
  {
    conceptSlug: 'transactions',
    question: 'Why should external API calls never happen inside a database transaction?',
    answer:
      'The transaction holds locks until commit. A slow external call extends lock time, starving other writers and risking timeouts. Do external work before/after, with idempotency.',
    difficulty: 'medium',
    confidence: 'high',
    dueInDays: 3,
    reviewCount: 3,
  },
  {
    conceptSlug: 'isolation-levels',
    question: 'Does Read Committed prevent lost updates? How do you fix them?',
    answer:
      'No. Two read-modify-write transactions can clobber each other. Fix by doing arithmetic in SQL (UPDATE ... SET x = x - n), SELECT ... FOR UPDATE, or SERIALIZABLE + retry.',
    difficulty: 'hard',
    confidence: 'low',
    dueInDays: -3,
    reviewCount: 1,
  },
  {
    conceptSlug: 'isolation-levels',
    question: 'What does SERIALIZABLE require from your application code?',
    answer:
      'Retry logic: it can abort transactions with serialization failures, and the app must retry them.',
    difficulty: 'hard',
    confidence: 'low',
    dueInDays: -1,
    reviewCount: 0,
  },
  {
    conceptSlug: 'caching',
    question: 'What is the hardest part of caching, and why?',
    answer:
      'Invalidation — knowing when the cached answer has changed. Caching itself is easy; keeping it correct is the whole problem.',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: 2,
    reviewCount: 2,
  },
  {
    conceptSlug: 'cache-invalidation',
    question: 'Name three cache invalidation strategies and when each fits.',
    answer:
      'TTL (tolerable staleness), write-through/explicit purge (must be fresh on write), and versioned/immutable keys (content-addressed data — never invalidate, change the key).',
    difficulty: 'medium',
    confidence: 'low',
    dueInDays: -1,
    reviewCount: 1,
  },
  {
    conceptSlug: 'queues',
    question: 'Why must queue consumers be idempotent?',
    answer:
      'Queues deliver at-least-once; a message can be processed more than once (timeouts, redelivery). Idempotent handling makes duplicates harmless.',
    difficulty: 'medium',
    confidence: 'high',
    dueInDays: 5,
    reviewCount: 3,
  },
  {
    conceptSlug: 'dead-letter-queue',
    question: 'What problem does a dead-letter queue solve?',
    answer:
      'It isolates poison messages that repeatedly fail so they do not block the queue, and gives you a place to inspect, fix, and replay them. Alert on DLQ depth.',
    difficulty: 'easy',
    confidence: 'medium',
    dueInDays: 0,
    reviewCount: 1,
  },
  {
    conceptSlug: 'retry-strategy',
    question: 'Why add jitter to exponential backoff?',
    answer:
      'Without jitter, many clients retry in sync after an outage (thundering herd). Full jitter randomizes delays so load spreads out as the dependency recovers.',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: 1,
    reviewCount: 2,
  },
  {
    conceptSlug: 'multi-tenancy',
    question: 'In shared-schema multi-tenancy, where must isolation be enforced?',
    answer:
      'Where queries run — a guarded query layer that injects tenant_id, ideally backed by Postgres RLS. UI filtering is not isolation.',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: -2,
    reviewCount: 1,
  },
  {
    conceptSlug: 'pagination',
    question: 'Why is cursor pagination more stable than OFFSET on large tables?',
    answer:
      'OFFSET scans and skips rows (slow at depth) and drifts as rows are inserted (skips/dupes). Cursors filter by the last row’s composite sort key using an index — fast and stable.',
    difficulty: 'medium',
    confidence: 'high',
    dueInDays: 7,
    reviewCount: 4,
  },
  {
    conceptSlug: 'postgresql-indexing',
    question: 'What is the composite index prefix rule?',
    answer:
      'A composite index on (a, b, c) serves filters/sorts using a left-to-right prefix: a, a+b, a+b+c — but not b alone.',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: 2,
    reviewCount: 2,
  },
  {
    conceptSlug: 'connection-pooling',
    question: 'Why is connection pooling critical on serverless + Postgres?',
    answer:
      'Many concurrent function instances each opening connections can exceed Postgres limits. A serverless pooler (PgBouncer/Neon pooler) shares warm connections.',
    difficulty: 'medium',
    confidence: 'high',
    dueInDays: 4,
    reviewCount: 3,
  },
  {
    conceptSlug: 'sli-slo',
    question: 'Define SLI, SLO, and error budget.',
    answer:
      'SLI = a measured indicator (e.g. % requests < 300ms). SLO = the target (99.9%). Error budget = 1 − SLO, the unreliability you may spend.',
    difficulty: 'medium',
    confidence: 'low',
    dueInDays: -1,
    reviewCount: 0,
  },
  {
    conceptSlug: 'observability',
    question: 'What are the three pillars of observability and what does each answer?',
    answer:
      'Logs (what happened — events), metrics (how much/fast — aggregates), traces (where — a request’s journey across services).',
    difficulty: 'easy',
    confidence: 'high',
    dueInDays: 6,
    reviewCount: 3,
  },
  {
    conceptSlug: 'outbox-pattern',
    question: 'What problem does the outbox pattern solve?',
    answer:
      'The dual-write problem: writing state to the DB and publishing an event are not atomic. Writing the event to an outbox table in the same transaction, then relaying it, makes eventing reliable.',
    difficulty: 'hard',
    confidence: 'low',
    dueInDays: 0,
    reviewCount: 0,
  },
  {
    conceptSlug: 'circuit-breaker',
    question: 'What is the single most important companion to a circuit breaker?',
    answer:
      'Timeouts. Without per-call timeouts, slow dependencies hang threads/instances and cascade — the breaker can only react to failures it can detect.',
    difficulty: 'medium',
    confidence: 'low',
    dueInDays: 3,
    reviewCount: 1,
  },
  {
    conceptSlug: 'background-jobs',
    question: 'What is the rule of thumb for moving work to a background job?',
    answer: 'If the user does not need the result right now, do not make them wait — acknowledge fast, work later.',
    difficulty: 'easy',
    confidence: 'high',
    dueInDays: 5,
    reviewCount: 3,
  },
  {
    conceptSlug: 'serverless-functions',
    question: 'Name two pieces of state that silently break on serverless.',
    answer:
      'In-memory caches and in-memory rate limiters — they are per-instance, so they are inconsistent across the many instances serving traffic.',
    difficulty: 'medium',
    confidence: 'medium',
    dueInDays: 1,
    reviewCount: 2,
  },
];
