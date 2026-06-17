import type { DecisionGuideSeed } from './types';

export const decisionGuideSeeds: DecisionGuideSeed[] = [
  {
    slug: 'nextjs-api-vs-dedicated-backend',
    title: 'Next.js API routes vs a dedicated backend',
    category: 'architecture',
    question: 'Should I keep my backend in Next.js route handlers or build a separate Node/Python service?',
    shortAnswer:
      'Stay in Next.js route handlers until a concrete constraint forces you out — long-running work, sustained throughput, websockets, or heavy shared in-memory state. Add a queue before you add a backend.',
    options: [
      {
        name: 'Next.js route handlers (serverless)',
        description: 'Backend lives next to the frontend as serverless functions.',
        whenToChoose:
          'Solo/small team, request-scoped work, bursty traffic, fast iteration. Most SaaS at this stage.',
        tradeoffs: 'Zero ops and great DX vs. statelessness, time limits, and cold starts.',
        failureModes: 'Long tasks time out; in-memory caches/limiters break; DB connections exhaust without pooling.',
      },
      {
        name: 'Next.js + queue/worker',
        description: 'Keep the API serverless; offload async work to a queue + serverless worker.',
        whenToChoose: 'You have background work (emails, processing) but not yet sustained high throughput.',
        tradeoffs: 'Extends serverless a long way vs. eventual consistency and a queue to operate.',
        failureModes: 'Non-idempotent workers; no DLQ; unbounded retries.',
      },
      {
        name: 'Dedicated backend (long-running Node/Python)',
        description: 'A separate always-on service you deploy and scale independently.',
        whenToChoose:
          'Sustained throughput where per-invocation cost flips, websockets, large warm caches, or genuinely long tasks.',
        tradeoffs: 'Full control and efficiency at scale vs. real ops burden.',
        failureModes: 'Premature adoption: you pay ops cost for scale you do not have.',
      },
    ],
    comparisonCriteria: ['Ops burden', 'Latency', 'Cost at scale', 'Statefulness', 'Iteration speed'],
    recommendationRules: `- Default to **route handlers**.
- The moment you have async/slow work, add a **queue + worker** — not a new backend.
- Only build a **dedicated backend** when you can name the constraint (throughput, websockets, long tasks) and have measured it.`,
    examples:
      'DueKind: keep serverless + queue for reminders now; revisit a dedicated worker only at sustained high volume.',
    relatedConceptSlugs: ['serverless-functions', 'queues', 'background-jobs', 'connection-pooling'],
    relatedLabSlugs: ['serverless-vs-dedicated-duekind'],
  },
  {
    slug: 'serverless-vs-long-running-server',
    title: 'Serverless vs long-running server',
    category: 'deployment',
    question: 'Should this workload run serverless or on an always-on server?',
    shortAnswer:
      'Serverless for spiky, request-scoped work; long-running for sustained throughput, persistent connections, or in-process state.',
    options: [
      {
        name: 'Serverless',
        description: 'Scale-to-zero functions billed per invocation.',
        whenToChoose: 'Unpredictable/bursty load, request-scoped logic, minimal ops.',
        tradeoffs: 'Elastic + cheap at low/bursty load vs. cold starts and limits.',
        failureModes: 'Cold-start tail latency; connection exhaustion; timeouts on long work.',
      },
      {
        name: 'Long-running server',
        description: 'Always-on process(es) behind a load balancer.',
        whenToChoose: 'Steady high throughput, websockets, warm caches, long tasks.',
        tradeoffs: 'Predictable performance and state vs. paying for idle and managing ops.',
        failureModes: 'Over-provisioning; no autoscaling; single points of failure.',
      },
    ],
    comparisonCriteria: ['Traffic shape', 'Cost model', 'State', 'Cold starts', 'Ops'],
    recommendationRules:
      'Map it to load shape: bursty → serverless; steady-and-high → long-running. When unsure, start serverless.',
    examples: 'A websocket presence service belongs on a long-running server; a REST CRUD API does not.',
    relatedConceptSlugs: ['serverless-functions', 'cold-starts', 'connection-pooling'],
  },
  {
    slug: 'do-i-need-a-queue',
    title: 'Do I need a queue here?',
    category: 'queue',
    question: 'Should this work go through a queue, a cron, or a direct synchronous call?',
    shortAnswer:
      'Use a queue when work is slow/flaky and the user does not need the result now. Use cron for scheduled work. Otherwise just call directly.',
    options: [
      {
        name: 'Direct call',
        description: 'Do the work inline in the request.',
        whenToChoose: 'Fast, reliable, and the user needs the result immediately.',
        tradeoffs: 'Simplest vs. couples user latency to the work and its failures.',
        failureModes: 'Slow third-party call makes your endpoint slow/timeout.',
      },
      {
        name: 'Queue + worker',
        description: 'Enqueue work, return fast, process asynchronously with retries.',
        whenToChoose: 'Slow/flaky work, spikes to smooth, fan-out, or anything retryable.',
        tradeoffs: 'Resilience + decoupling vs. eventual consistency and ops.',
        failureModes: 'Non-idempotent consumers; no DLQ; poison messages.',
      },
      {
        name: 'Cron',
        description: 'Run on a schedule (ideally enqueueing jobs).',
        whenToChoose: 'Time-triggered work: digests, cleanup, polling.',
        tradeoffs: 'Simple scheduling vs. coarse timing and overlap risk.',
        failureModes: 'Heavy work inline in the tick; overlapping runs.',
      },
    ],
    comparisonCriteria: ['User needs result now?', 'Slow/flaky?', 'Time-triggered?', 'Spiky load?'],
    recommendationRules:
      'If the user needs the answer now → direct. If it is slow/flaky/retryable → queue. If it is time-based → cron that enqueues.',
    examples: 'Sending an email after signup → queue. Nightly cleanup → cron. Reading a profile → direct.',
    relatedConceptSlugs: ['queues', 'background-jobs', 'cron-jobs', 'retry-strategy'],
    relatedLabSlugs: ['background-email-reminder-workflow'],
  },
  {
    slug: 'do-i-need-redis',
    title: 'Do I need Redis, or can Postgres handle it?',
    category: 'caching',
    question: 'Should I add Redis, or keep state/caching in PostgreSQL?',
    shortAnswer:
      'Start with Postgres. Add Redis when you have a proven hot path needing sub-ms reads, cross-instance counters (rate limits), or ephemeral data that does not belong in your durable store.',
    options: [
      {
        name: 'Postgres only',
        description: 'Use the database you already have for caching/state.',
        whenToChoose: 'Low/medium scale, no sub-ms requirement, fewer moving parts.',
        tradeoffs: 'One system to operate vs. higher latency and load on the DB.',
        failureModes: 'Hot rows; cache logic bloating the primary DB.',
      },
      {
        name: 'Add Redis',
        description: 'A fast in-memory store for cache, counters, sessions, locks.',
        whenToChoose: 'Proven hot reads, shared rate-limit counters, ephemeral/expiring data.',
        tradeoffs: 'Sub-ms + offload vs. another system, and a cache-consistency problem.',
        failureModes: 'Treating Redis as a source of truth; no eviction policy; stampedes.',
      },
    ],
    comparisonCriteria: ['Latency need', 'Durability need', 'Cross-instance state', 'Ops appetite'],
    recommendationRules:
      'Add Redis to solve a measured problem (latency, shared counters), not preemptively.',
    examples: 'A correct cross-instance rate limiter wants Redis; caching a rarely-changing config can live in Postgres.',
    relatedConceptSlugs: ['caching', 'rate-limiting', 'cache-invalidation'],
  },
  {
    slug: 'cron-vs-queue-vs-direct',
    title: 'When should I use cron jobs?',
    category: 'queue',
    question: 'Is cron the right tool, or do I want events/queues?',
    shortAnswer:
      'Use cron for time-triggered work, and have it enqueue jobs rather than doing heavy work in the tick. Use events/queues for reaction-triggered work.',
    options: [
      {
        name: 'Cron (scheduler)',
        description: 'Fire on a schedule.',
        whenToChoose: 'Digests, cleanup, periodic polling, “find due X”.',
        tradeoffs: 'Dead simple vs. coarse timing, overlap, and missed ticks.',
        failureModes: 'Long work in the tick; overlapping runs; assuming exactly-once firing.',
      },
      {
        name: 'Event/queue driven',
        description: 'React to events as they happen.',
        whenToChoose: 'Work triggered by an action (webhook, user event), not the clock.',
        tradeoffs: 'Timely + decoupled vs. more infrastructure.',
        failureModes: 'Using cron polling where a webhook/event would be timelier.',
      },
    ],
    comparisonCriteria: ['Trigger: time vs. event', 'Timeliness', 'Overlap risk'],
    recommendationRules:
      'Clock-driven → cron (that enqueues). Action-driven → event/queue. Never do heavy work directly in a cron tick.',
    examples: 'DueKind’s “find due reminders” is a cron that enqueues sends.',
    relatedConceptSlugs: ['cron-jobs', 'queues', 'webhooks'],
  },
  {
    slug: 'webhooks-vs-polling',
    title: 'Webhooks vs polling',
    category: 'api',
    question: 'Should I receive webhooks or poll the provider for changes?',
    shortAnswer:
      'Prefer webhooks for timeliness and efficiency, but treat them as at-least-once and add reconciliation/polling as a backstop for missed events.',
    options: [
      {
        name: 'Webhooks (push)',
        description: 'The provider notifies you on events.',
        whenToChoose: 'You need timely reactions and the provider supports them.',
        tradeoffs: 'Timely + efficient vs. you must verify, dedupe, and handle retries/ordering.',
        failureModes: 'No signature check; non-idempotent handling; lost events with no backstop.',
      },
      {
        name: 'Polling (pull)',
        description: 'You periodically ask for changes.',
        whenToChoose: 'No webhook support, or as a reconciliation backstop.',
        tradeoffs: 'Simple + you control timing vs. laggy and wasteful.',
        failureModes: 'Polling too often (cost) or too rarely (staleness).',
      },
    ],
    comparisonCriteria: ['Timeliness', 'Efficiency', 'Reliability', 'Complexity'],
    recommendationRules:
      'Use webhooks as the primary path (verified + idempotent), and a periodic reconciliation poll to catch missed events.',
    examples: 'Stripe: handle webhooks, plus a daily reconciliation against the API for safety.',
    relatedConceptSlugs: ['webhooks', 'idempotency', 'cron-jobs'],
    relatedLabSlugs: ['idempotent-webhook-handler'],
  },
  {
    slug: 'do-i-need-event-driven-architecture',
    title: 'Do I need event-driven architecture?',
    category: 'architecture',
    question: 'Should components communicate via events, or with direct calls?',
    shortAnswer:
      'Reach for events when you need decoupling and fan-out (one fact, many reactions). For simple request/response within one app, direct calls are clearer.',
    options: [
      {
        name: 'Direct calls / in-process',
        description: 'Components call each other directly.',
        whenToChoose: 'A single app, simple flows, strong consistency needs.',
        tradeoffs: 'Simple + debuggable vs. tighter coupling.',
        failureModes: 'Hidden coupling as features grow.',
      },
      {
        name: 'Event-driven',
        description: 'Producers emit events; consumers react independently.',
        whenToChoose: 'Many independent reactions to one fact; decoupling teams/services; audit trails.',
        tradeoffs: 'Loose coupling + extensibility vs. eventual consistency and harder debugging.',
        failureModes: 'Events used as commands; no versioning; ignoring ordering/dedup.',
      },
    ],
    comparisonCriteria: ['Number of reactions', 'Coupling', 'Consistency', 'Debuggability'],
    recommendationRules:
      'Introduce events when fan-out or decoupling is real — not for a single consumer you could call directly.',
    examples: 'BurnCap “UsageRecorded” feeding several aggregators is a fair use of events.',
    relatedConceptSlugs: ['event-driven-architecture', 'queues', 'outbox-pattern'],
  },
  {
    slug: 'monolith-vs-modular-vs-microservices',
    title: 'Monolith vs modular monolith vs microservices',
    category: 'architecture',
    question: 'How should I structure the application as it grows?',
    shortAnswer:
      'Start with a monolith, invest in a modular monolith as it grows, and only split into microservices when independent scaling or team autonomy genuinely demands it.',
    options: [
      {
        name: 'Monolith',
        description: 'One deployable, one database.',
        whenToChoose: 'New products, small teams, almost always at the start.',
        tradeoffs: 'Fastest to build vs. coupling risk at large scale.',
        failureModes: 'Big ball of mud with no internal boundaries.',
      },
      {
        name: 'Modular monolith',
        description: 'One deployable with strong internal module boundaries.',
        whenToChoose: 'Growing product wanting future optionality without distributed pain.',
        tradeoffs: 'Most benefits of services with far less ops vs. discipline to keep boundaries.',
        failureModes: 'Boundaries on paper only; shared tables across modules.',
      },
      {
        name: 'Microservices',
        description: 'Independently deployable services owning their data.',
        whenToChoose: 'Large orgs needing independent deploy/scale per component.',
        tradeoffs: 'Independent scaling/teams vs. distributed-systems complexity.',
        failureModes: 'Distributed monolith; no observability; ignoring partial failure.',
      },
    ],
    comparisonCriteria: ['Team size', 'Scaling needs', 'Ops appetite', 'Coupling'],
    recommendationRules:
      'Monolith → modular monolith → (rarely) microservices. Let pain, not fashion, drive the next step.',
    examples: 'A solo SaaS is a monolith; a maturing platform becomes a modular monolith.',
    relatedConceptSlugs: ['monolith', 'modular-monolith', 'microservices'],
  },
  {
    slug: 'when-to-add-observability',
    title: 'When should I add observability?',
    category: 'observability',
    question: 'How much observability does my project actually need, and when?',
    shortAnswer:
      'Add structured logging and basic metrics as soon as real users depend on the system. Add tracing only when failures cross service boundaries.',
    options: [
      {
        name: 'Minimal (logs)',
        description: 'Structured logs with correlation ids.',
        whenToChoose: 'Early products with users; the baseline for everything.',
        tradeoffs: 'Cheap insight vs. limited aggregate view.',
        failureModes: 'Unstructured console logs; no request ids.',
      },
      {
        name: 'Logs + metrics + SLOs',
        description: 'RED metrics, dashboards, a few SLO alerts.',
        whenToChoose: 'Users care about reliability; you are on-call.',
        tradeoffs: 'Operable system vs. instrumentation effort and cost.',
        failureModes: 'Alerting on causes, not symptoms; vanity metrics.',
      },
      {
        name: '+ Tracing',
        description: 'Distributed tracing across services.',
        whenToChoose: 'Multi-service systems where latency/errors cross boundaries.',
        tradeoffs: 'Pinpoint cross-service insight vs. cost and instrumentation.',
        failureModes: 'Sampling everything (cost) or nothing (blind).',
      },
    ],
    comparisonCriteria: ['User dependence', 'Service count', 'On-call', 'Cost'],
    recommendationRules:
      'Logs from day one with users; metrics + SLOs when on-call; tracing when you have multiple services.',
    examples: 'A solo SaaS: structured logs + a RED dashboard + 2–3 SLO alerts is plenty.',
    relatedConceptSlugs: ['observability', 'logging', 'metrics', 'tracing', 'sli-slo'],
  },
  {
    slug: 'when-to-care-about-slos',
    title: 'When should I care about SLOs?',
    category: 'observability',
    question: 'Are SLOs worth the overhead for my project?',
    shortAnswer:
      'Once you have users who would notice and care about downtime. Before product-market fit, SLOs are premature.',
    options: [
      {
        name: 'No formal SLOs',
        description: 'Watch a few key metrics, no committed targets.',
        whenToChoose: 'Prototypes, pre-PMF, internal tools.',
        tradeoffs: 'No overhead vs. no objective reliability bar.',
        failureModes: 'Flying blind once users actually depend on you.',
      },
      {
        name: 'SLIs + SLOs + error budget',
        description: 'User-centric indicators, targets, and a budget to spend.',
        whenToChoose: 'Real users, reliability matters, balancing velocity vs. stability.',
        tradeoffs: 'Objective trade-offs vs. measurement and discipline.',
        failureModes: '100% targets, vanity SLIs, SLOs nobody acts on.',
      },
    ],
    comparisonCriteria: ['User base', 'Reliability sensitivity', 'Team maturity'],
    recommendationRules:
      'Adopt SLOs when downtime has real cost. Pick 1–2 user-centric SLIs and act on the error budget.',
    examples: '99.9% availability SLO with an alert when the monthly budget burns too fast.',
    relatedConceptSlugs: ['sli-slo', 'error-budget', 'metrics'],
  },
  {
    slug: 'soft-delete-vs-hard-delete',
    title: 'Soft delete vs hard delete',
    category: 'database',
    question: 'Should I mark rows deleted or actually remove them?',
    shortAnswer:
      'Soft delete when you need recovery, audit, or references to survive; hard delete for privacy/compliance (right-to-be-forgotten) and truly disposable data.',
    options: [
      {
        name: 'Soft delete (deleted_at)',
        description: 'Flag rows as deleted; filter them out in queries.',
        whenToChoose: 'Undo, audit trails, preserving foreign-key references.',
        tradeoffs: 'Recoverable + auditable vs. every query must filter and indexes must account for it.',
        failureModes: 'Forgetting the filter (leaking “deleted” data); unbounded growth.',
      },
      {
        name: 'Hard delete',
        description: 'Remove the row permanently.',
        whenToChoose: 'Privacy/compliance erasure, ephemeral data, simplicity.',
        tradeoffs: 'Clean + compliant vs. unrecoverable and can break references.',
        failureModes: 'Cascading deletes that remove more than intended; no audit of what was removed.',
      },
    ],
    comparisonCriteria: ['Recovery need', 'Compliance', 'Reference integrity', 'Query complexity'],
    recommendationRules:
      'Default soft delete for user-facing entities; hard delete (or anonymize) for compliance-driven erasure.',
    examples: 'Soft-delete invoices (audit) but hard-delete/anonymize personal data on account closure.',
    relatedConceptSlugs: ['multi-tenancy', 'audit-logs', 'migrations'],
  },
  {
    slug: 'how-to-design-multi-tenancy',
    title: 'How should I design multi-tenancy?',
    category: 'database',
    question: 'Shared schema, schema-per-tenant, or database-per-tenant?',
    shortAnswer:
      'Default to shared schema with tenant_id enforced at the query layer (and RLS). Move to schema- or DB-per-tenant only for strict isolation/compliance needs.',
    options: [
      {
        name: 'Shared schema + tenant_id',
        description: 'One schema; every row carries tenant_id.',
        whenToChoose: 'Most B2B SaaS; cheapest and easiest to operate.',
        tradeoffs: 'Low ops cost vs. isolation is your code’s responsibility.',
        failureModes: 'One unscoped query = cross-tenant leak.',
      },
      {
        name: 'Schema-per-tenant',
        description: 'A Postgres schema per tenant.',
        whenToChoose: 'Stronger isolation, moderate tenant counts.',
        tradeoffs: 'Better isolation vs. migration fan-out and connection overhead.',
        failureModes: 'Migrations across many schemas; tooling complexity.',
      },
      {
        name: 'Database-per-tenant',
        description: 'A separate database per tenant.',
        whenToChoose: 'Strict compliance / large enterprise isolation.',
        tradeoffs: 'Strongest isolation vs. heaviest ops.',
        failureModes: 'Operational explosion at scale.',
      },
    ],
    comparisonCriteria: ['Isolation strength', 'Ops cost', 'Migration effort', 'Tenant count'],
    recommendationRules:
      'Start shared-schema with a guarded query layer + RLS; escalate isolation only when a real requirement demands it.',
    examples: 'The multi-tenant SaaS starter case study uses shared schema + RLS.',
    relatedConceptSlugs: ['multi-tenancy', 'authorization', 'security', 'postgresql-indexing'],
    relatedLabSlugs: ['multi-tenant-data-model'],
  },
  {
    slug: 'how-to-handle-api-errors',
    title: 'How should I handle API errors?',
    category: 'api',
    question: 'What is a good convention for API error responses?',
    shortAnswer:
      'One error envelope with a stable machine-readable code, a central exception→response mapper, rich server-side logging, and never leaking internals to clients.',
    options: [
      {
        name: 'Stable error envelope + central mapper',
        description: '{ error: { code, message, details } } mapped in one place.',
        whenToChoose: 'Every API — establish it before you have many endpoints.',
        tradeoffs: 'Consistency + client-friendly vs. a small upfront convention to maintain.',
        failureModes: 'Inconsistent shapes; 200-with-error-body; leaking stack traces.',
      },
      {
        name: 'Ad-hoc per-endpoint errors',
        description: 'Each route formats errors however is convenient.',
        whenToChoose: 'Throwaway prototypes only.',
        tradeoffs: 'No upfront thought vs. clients cannot reliably branch on errors.',
        failureModes: 'Every integration breaks differently.',
      },
    ],
    comparisonCriteria: ['Consistency', 'Client ergonomics', 'Security', 'Maintenance'],
    recommendationRules:
      'Define the envelope and status mapping once; clients branch on `code`, not `message`; log full context server-side.',
    examples: 'Stripe-style error objects with type/code/param.',
    relatedConceptSlugs: ['api-error-handling', 'api-validation', 'observability'],
    relatedLabSlugs: ['health-check-and-logging'],
  },
  {
    slug: 'how-to-handle-retries',
    title: 'How should I handle retries?',
    category: 'queue',
    question: 'How do I retry failed operations safely?',
    shortAnswer:
      'Retry only transient errors, with exponential backoff + jitter and a max attempt count, behind an idempotency key, with a dead-letter path for exhaustion.',
    options: [
      {
        name: 'Backoff + jitter + idempotency',
        description: 'Exponential backoff with full jitter, capped attempts, idempotent effects.',
        whenToChoose: 'Any retryable call to flaky dependencies or queue consumers.',
        tradeoffs: 'Resilient without herds vs. needs idempotency to be safe.',
        failureModes: 'Retrying non-idempotent writes; no jitter; unbounded attempts.',
      },
      {
        name: 'Immediate naive retries',
        description: 'Retry right away, fixed count.',
        whenToChoose: 'Almost never in production.',
        tradeoffs: 'Trivial vs. amplifies outages (thundering herd).',
        failureModes: 'Synchronized retries hammer a recovering dependency.',
      },
    ],
    comparisonCriteria: ['Idempotency', 'Error class', 'Backoff', 'Attempt cap'],
    recommendationRules:
      'Classify errors (retry 5xx/429/timeouts, not 4xx); backoff with jitter; cap attempts; DLQ on exhaustion; require idempotency.',
    examples: 'Calling a payment provider: backoff + idempotency key + DLQ.',
    relatedConceptSlugs: ['retry-strategy', 'idempotency', 'dead-letter-queue', 'circuit-breaker'],
    relatedLabSlugs: ['queue-retry-strategy'],
  },
  {
    slug: 'rest-vs-graphql-vs-rpc',
    title: 'REST vs GraphQL vs RPC',
    category: 'api',
    question: 'Which API style fits this project?',
    shortAnswer:
      'REST for resource CRUD and public APIs, GraphQL when clients need flexible nested reads, RPC (tRPC) for tightly-coupled internal TypeScript calls.',
    options: [
      {
        name: 'REST',
        description: 'Resource-oriented HTTP with verbs and status codes.',
        whenToChoose: 'CRUD, public APIs, cache-friendliness, broad tooling.',
        tradeoffs: 'Universal + cacheable vs. over/under-fetching for nested data.',
        failureModes: 'Chatty clients; verbs in URLs; leaking schema.',
      },
      {
        name: 'GraphQL',
        description: 'Clients request exactly the fields they need.',
        whenToChoose: 'Rich, varied client read needs; many related entities.',
        tradeoffs: 'Flexible reads vs. caching/auth complexity and N+1 risk.',
        failureModes: 'Unbounded queries; N+1; weak per-field authz.',
      },
      {
        name: 'RPC (e.g. tRPC)',
        description: 'Call typed server procedures directly from the client.',
        whenToChoose: 'Internal full-stack TypeScript apps with one client.',
        tradeoffs: 'End-to-end types + speed vs. tight coupling, not a public contract.',
        failureModes: 'Using it as a public API; coupling client to server internals.',
      },
    ],
    comparisonCriteria: ['Client variety', 'Caching', 'Coupling', 'Tooling'],
    recommendationRules:
      'Public/CRUD → REST. Flexible nested reads → GraphQL. Internal TS monolith → RPC/tRPC.',
    examples: 'A Next.js app’s internal calls fit tRPC; a public integration API fits REST.',
    relatedConceptSlugs: ['rest-api-design', 'api-validation', 'backend-for-frontend'],
  },
];
