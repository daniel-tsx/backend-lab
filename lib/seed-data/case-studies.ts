import type { CaseStudySeed } from './types';

export const caseStudySeeds: CaseStudySeed[] = [
  {
    slug: 'smarttrips-backend',
    title: 'SmartTrips backend architecture',
    domain: 'travel',
    difficulty: 'intermediate',
    status: 'reviewed',
    problemStatement:
      'Design the backend for a trip-planning app that generates itineraries by calling several slow external APIs (flights, hotels, places) and must feel responsive on repeat views.',
    functionalRequirements: [
      'Create a trip from user inputs (dates, destination, budget, preferences).',
      'Generate an itinerary by aggregating external providers.',
      'View, edit, and re-generate parts of a trip.',
      'Share a read-only trip link.',
    ],
    nonFunctionalRequirements: [
      'First plan generation < 8s perceived (progressive); repeat views < 300ms.',
      'Graceful degradation when one provider is slow or down.',
      'Cost-aware external API usage.',
    ],
    constraints: [
      'Solo developer, serverless-first (Vercel + Neon).',
      'External APIs are rate-limited and occasionally flaky.',
    ],
    trafficAssumptions:
      '~2k trips/day, bursty around evenings; ~10 external calls per generation; reads >> writes after generation.',
    dataModel: `\`\`\`
trips(id, user_id, destination, start_date, end_date, budget, status, created_at)
trip_items(id, trip_id, type[flight|hotel|place], payload jsonb, day, order)
plan_cache(trip_hash, payload jsonb, created_at, expires_at)
\`\`\`
\`trip_hash\` is a hash of the inputs that determine a plan, enabling cache reuse across identical requests.`,
    apiDesign: `- \`POST /trips\` → create trip, enqueue generation, return trip with status=generating.
- \`GET /trips/:id\` → trip + items (+ generation progress).
- \`POST /trips/:id/regenerate\` → regenerate a section.
- \`GET /s/:shareId\` → public read-only view.`,
    architecture: `Generation is **asynchronous**: \`POST /trips\` enqueues a job and returns immediately with \`status=generating\`. A worker fans out to providers (with per-provider timeouts and retries), assembles items, and writes them. The client polls or subscribes for progress.

Finished plans are cached by \`trip_hash\`; repeat views and identical inputs hit the cache. Partial provider failure degrades to a partial plan plus a background retry for the missing section.`,
    scalingStrategy:
      'Reads scale via the plan cache + CDN for share links. Writes are bounded by the queue; provider concurrency is capped to respect their rate limits.',
    reliabilityStrategy:
      'Per-provider timeouts + retries with backoff; circuit-break a degraded provider and serve partial results; idempotent generation keyed by trip_hash.',
    securityStrategy:
      'Trips scoped by user_id; share links use an unguessable id with read-only access; provider keys in a secret store.',
    observabilityStrategy:
      'Track generation duration p95, per-provider error rate, cache hit ratio, and queue depth.',
    costConsiderations:
      'External API calls dominate cost — cache aggressively, dedupe identical generations, and cap regenerations.',
    tradeoffs:
      'Async generation adds complexity and eventual consistency but is the only way to stay responsive against slow upstreams. Caching trades freshness for speed/cost — acceptable for itineraries.',
    finalNotes:
      'A modular monolith on serverless + a queue is plenty here. Microservices would be premature.',
    reviewScores: {
      requirementsClarity: 4,
      dataModelQuality: 4,
      apiQuality: 4,
      scalability: 3,
      reliability: 4,
      security: 3,
      simplicity: 5,
      costAwareness: 4,
    },
  },
  {
    slug: 'duekind-reminder-system',
    title: 'DueKind payment reminder system',
    domain: 'freelancer-tools',
    difficulty: 'intermediate',
    status: 'designing',
    problemStatement:
      'Design a system that reminds freelancers’ clients about due/overdue invoices via scheduled, reliable, never-duplicated emails.',
    functionalRequirements: [
      'Schedule reminders relative to invoice due dates.',
      'Send email reminders reliably and exactly once per schedule.',
      'Stop reminders when an invoice is paid.',
      'Let users customize reminder cadence and copy.',
    ],
    nonFunctionalRequirements: [
      'No duplicate emails, ever.',
      'Sends survive provider outages (eventual delivery).',
      'Request path stays fast (no inline sending).',
    ],
    constraints: ['Serverless (Vercel cron), Neon, an email provider with rate limits.'],
    trafficAssumptions:
      'Thousands of reminders/day, highly clustered at business-hour boundaries.',
    dataModel: `\`\`\`
invoices(id, user_id, client_id, amount, due_date, status[open|paid])
reminders(id, invoice_id, scheduled_for, status[pending|sent|skipped], idempotency_key)
\`\`\`
\`idempotency_key = reminder_id + scheduled_for\` guarantees one send per schedule.`,
    apiDesign: `- Cron \`/jobs/find-due-reminders\` → selects due, enqueues send jobs.
- Worker \`send-reminder\` → sends, marks sent in the same transaction as recording success.
- \`POST /invoices/:id/paid\` → cancels pending reminders.`,
    architecture: `**Cron enqueues, it does not send.** A scheduled function finds reminders whose \`scheduled_for <= now\` and \`status = pending\`, enqueues one job each, and exits fast. A worker sends via the email provider with retries + DLQ, and marks the reminder \`sent\` transactionally. Idempotency key prevents duplicates even if the cron double-fires or a job retries.`,
    scalingStrategy:
      'The queue absorbs the business-hour spike; worker concurrency is capped to the provider’s rate limit.',
    reliabilityStrategy:
      'Backoff + DLQ on send failure; idempotency key for exactly-once-perceived sends; cancel-on-paid prevents wrong sends.',
    securityStrategy: 'Reminders scoped per user; email provider key in a vault.',
    observabilityStrategy:
      'Alert on DLQ depth, sends/min vs. provider limit, and reminders stuck in pending.',
    costConsiderations: 'Email volume is the main cost; suppress reminders on paid invoices promptly.',
    tradeoffs:
      'A queue adds infra but is the difference between “reliable” and “sometimes double-emails clients”. This is the canonical serverless-vs-dedicated decision point.',
    finalNotes:
      'Stay serverless + queue for now; revisit a dedicated worker only at sustained high volume.',
    reviewScores: {
      requirementsClarity: 4,
      dataModelQuality: 3,
      apiQuality: 3,
      scalability: 3,
      reliability: 4,
      security: 3,
      simplicity: 4,
      costAwareness: 3,
    },
  },
  {
    slug: 'burncap-cost-monitoring',
    title: 'BurnCap AI cost monitoring system',
    domain: 'ai-cost-monitoring',
    difficulty: 'advanced',
    status: 'designing',
    problemStatement:
      'Ingest high-volume AI usage events, aggregate per-tenant spend, and alert when a tenant approaches a budget cap.',
    functionalRequirements: [
      'Ingest usage events (tokens, model, cost) at high, spiky volume.',
      'Aggregate spend by tenant, model, and time window.',
      'Show dashboards and projected spend.',
      'Alert (once) when projected spend exceeds a cap.',
    ],
    nonFunctionalRequirements: [
      'Ingestion absorbs spikes without dropping events.',
      'Dashboards read cheaply (no scanning raw events live).',
      'Alerts are idempotent (no spam).',
    ],
    constraints: ['Multi-tenant; cost-sensitive; serverless-first.'],
    trafficAssumptions:
      'Up to millions of events/day in bursts; reads are dashboard-driven and tolerate slight lag.',
    dataModel: `\`\`\`
usage_events(id, tenant_id, model, tokens, cost_cents, recorded_at)  -- append-only, audit
usage_rollups(tenant_id, day, model, total_cost_cents, event_count)   -- pre-aggregated
budgets(tenant_id, monthly_cap_cents)
alerts(tenant_id, period, kind, fired_at)  -- unique(tenant, period, kind) for idempotency
\`\`\``,
    apiDesign: `- \`POST /ingest\` → validate + enqueue (returns 202).
- Worker → append raw event + upsert rollup.
- \`GET /dashboard\` → reads rollups only.
- Evaluator (cron) → compares projected spend to cap, fires idempotent alerts.`,
    architecture: `Ingestion is buffered by a **queue**; a worker writes the raw event (append-only for audit) and upserts the \`(tenant, day, model)\` rollup. Dashboards read rollups, never raw events. A periodic evaluator projects spend and fires alerts guarded by a unique \`(tenant, period, kind)\` constraint so each threshold alerts once. Backpressure (429) protects the worker if ingestion outpaces it.`,
    scalingStrategy:
      'Separate write-heavy ingestion from read-cheap rollups (a CQRS-flavored split). Partition/index by (tenant_id, recorded_at).',
    reliabilityStrategy:
      'At-least-once ingestion + idempotent upserts; DLQ for poison events; alerts idempotent by unique key.',
    securityStrategy: 'Strict tenant isolation on every query; ingestion authenticated per tenant key.',
    observabilityStrategy:
      'Queue depth, ingestion lag, rollup freshness, and alert fire counts.',
    costConsiderations:
      'Storing every raw event is the cost driver — consider retention/rollup-then-archive of raw events.',
    tradeoffs:
      'Pre-aggregation trades some freshness and extra write work for cheap, fast dashboards. Append-only raw events cost storage but enable audit and re-aggregation.',
    finalNotes: 'This is the strongest case for a queue + worker in the user’s portfolio.',
  },
  {
    slug: 'mergeattest-pr-review',
    title: 'MergeAttest PR review system',
    domain: 'developer-tools',
    difficulty: 'advanced',
    status: 'designing',
    problemStatement:
      'Ingest GitHub PR webhooks, run checks/attestations, and post results back — reliably and idempotently.',
    functionalRequirements: [
      'Receive GitHub webhooks for PR events.',
      'Run attestation checks asynchronously.',
      'Post status/check results back to GitHub.',
      'Show a dashboard of PRs and their attestations.',
    ],
    nonFunctionalRequirements: [
      'At-least-once webhook handling with dedupe.',
      'No duplicate check runs or status posts.',
      'Fast 2xx to GitHub.',
    ],
    constraints: ['GitHub rate limits; webhook secret verification required.'],
    trafficAssumptions: 'Spiky around work hours; many events per PR (open, sync, review).',
    dataModel: `\`\`\`
webhook_events(id, github_delivery_id UNIQUE, type, payload, received_at)
pull_requests(id, repo, number, head_sha, state)
attestations(id, pr_id, head_sha, status, result, UNIQUE(pr_id, head_sha))
\`\`\``,
    apiDesign: `- \`POST /webhooks/github\` → verify signature, dedupe by delivery id, enqueue, 2xx.
- Worker → run attestation (idempotent per head_sha), post status back.
- \`GET /prs\` → dashboard.`,
    architecture:
      'Verify signature → dedupe by GitHub delivery id → enqueue → 2xx fast. Worker runs the attestation keyed by (pr, head_sha) so re-deliveries and re-pushes don’t duplicate work, then posts the check result back to GitHub with retries.',
    scalingStrategy: 'Queue absorbs event bursts; cap GitHub API concurrency to respect rate limits.',
    reliabilityStrategy:
      'Idempotency by delivery id and by (pr, head_sha); retries + DLQ for failed posts.',
    securityStrategy: 'HMAC signature verification; least-privilege GitHub token.',
    observabilityStrategy: 'Webhook lag, attestation duration, GitHub API error rate, DLQ depth.',
    costConsiderations: 'Compute for checks dominates; skip redundant runs for unchanged head_sha.',
    tradeoffs: 'Async processing is mandatory to return 2xx fast; adds eventual consistency on the dashboard.',
    finalNotes: 'Webhook idempotency is the crux — both delivery-id and content-based dedupe matter.',
  },
  {
    slug: 'costtracker-finance',
    title: 'CostTracker internal finance tracker',
    domain: 'finance',
    difficulty: 'beginner',
    status: 'not-started',
    problemStatement:
      'A small internal tool to track expenses and budgets with correct money math and an audit trail.',
    functionalRequirements: [
      'Record expenses with categories.',
      'Track budgets per category and period.',
      'Report spend vs. budget.',
      'Audit who changed what.',
    ],
    nonFunctionalRequirements: [
      'Exact money arithmetic (integer cents).',
      'Auditable changes.',
    ],
    constraints: ['Internal tool, low traffic, single tenant.'],
    trafficAssumptions: 'Tens of writes/day; trivial scale.',
    dataModel: `\`\`\`
expenses(id, category, amount_cents, spent_at, note)
budgets(category, period, cap_cents)
audit_log(id, actor, action, target, before, after, at)
\`\`\``,
    apiDesign: '- CRUD for expenses/budgets; report endpoint aggregates by category/period.',
    architecture: 'A simple layered monolith. No queue, no cache — scale does not warrant them.',
    scalingStrategy: 'None needed; a single Postgres handles this comfortably.',
    reliabilityStrategy: 'Daily backups; transactions for any multi-row update.',
    securityStrategy: 'Internal auth; append-only audit log.',
    observabilityStrategy: 'Basic request logs suffice.',
    costConsiderations: 'Negligible.',
    tradeoffs: 'Deliberately boring — adding infrastructure here would be over-engineering.',
    finalNotes: 'Good example of “the right architecture is the simple one”.',
  },
  {
    slug: 'envvault-env-manager',
    title: 'EnvVault encrypted environment variable manager',
    domain: 'developer-tools',
    difficulty: 'advanced',
    status: 'not-started',
    problemStatement:
      'Store and serve environment variables encrypted at rest, per project and environment, with strict access control and audit.',
    functionalRequirements: [
      'Create projects and environments.',
      'Store secrets encrypted at rest.',
      'Serve secrets to authorized clients only.',
      'Audit every read/write of a secret.',
    ],
    nonFunctionalRequirements: [
      'Secrets never logged or exposed in errors.',
      'Strong tenant/project isolation.',
      'Tamper-evident audit trail.',
    ],
    constraints: ['Security is the dominant concern; multi-tenant.'],
    trafficAssumptions: 'Low write volume, read on deploy; correctness >> throughput.',
    dataModel: `\`\`\`
projects(id, tenant_id, name)
environments(id, project_id, name)
secrets(id, environment_id, key, ciphertext, nonce, version)
secret_access_log(id, actor, secret_id, action, at)  -- append-only
\`\`\``,
    apiDesign: '- CRUD scoped by tenant/project; envelope-encrypt on write; decrypt on authorized read; every access logged.',
    architecture:
      'Envelope encryption: a per-secret data key encrypts the value; a KMS master key encrypts data keys. App stores only ciphertext. Access is deny-by-default and fully audited.',
    scalingStrategy: 'Trivial scale; focus is correctness and isolation, not throughput.',
    reliabilityStrategy: 'Backups of ciphertext; key rotation via versioned secrets.',
    securityStrategy:
      'Encryption at rest, deny-by-default authz, strict tenant isolation, taint secrets to avoid leaking to clients, append-only audit.',
    observabilityStrategy: 'Audit reads/writes; alert on unusual access patterns.',
    costConsiderations: 'KMS calls per decrypt — cache data keys briefly if needed.',
    tradeoffs: 'Envelope encryption adds complexity but is the standard for secret stores.',
    finalNotes: 'The security strategy is the product here.',
  },
  {
    slug: 'vocabulary-learning-tracker',
    title: 'Vocabulary learning tracker',
    domain: 'other',
    difficulty: 'beginner',
    status: 'not-started',
    problemStatement:
      'Track vocabulary with spaced repetition scheduling and progress over time.',
    functionalRequirements: [
      'Add words with definitions and examples.',
      'Schedule reviews via spaced repetition.',
      'Grade recall and reschedule.',
      'Show progress and streaks.',
    ],
    nonFunctionalRequirements: ['Simple, fast, offline-tolerant reads.'],
    constraints: ['Single user, low scale.'],
    trafficAssumptions: 'Personal use; tiny.',
    dataModel: `\`\`\`
words(id, term, definition, example)
review_cards(id, word_id, interval_days, ease, next_review_at, review_count)
\`\`\``,
    apiDesign: '- CRUD words; due-cards query; grade endpoint applies SM-2 scheduling.',
    architecture: 'A simple monolith with an SM-2 scheduler (exactly like this lab’s review system).',
    scalingStrategy: 'None needed.',
    reliabilityStrategy: 'Backups; idempotent grade application.',
    securityStrategy: 'Single-user auth.',
    observabilityStrategy: 'Minimal.',
    costConsiderations: 'Negligible.',
    tradeoffs: 'Spaced-repetition math is the only real design surface.',
    finalNotes: 'Mirrors the Review Center here — reuse the scheduler.',
  },
  {
    slug: 'multi-tenant-saas-starter',
    title: 'Multi-tenant B2B SaaS starter',
    domain: 'generic-saas',
    difficulty: 'advanced',
    status: 'reviewed',
    problemStatement:
      'Define the baseline backend architecture for a new multi-tenant B2B SaaS: isolation, auth, billing hooks, and observability.',
    functionalRequirements: [
      'Organizations with members and roles.',
      'Strict per-tenant data isolation.',
      'Billing webhooks and plan limits.',
      'Audit logs for sensitive actions.',
    ],
    nonFunctionalRequirements: [
      'No cross-tenant data leakage.',
      'Safe webhook handling.',
      'Operable: logs, metrics, basic SLOs.',
    ],
    constraints: ['Serverless-first; small team.'],
    trafficAssumptions: 'Grows from zero; design must not require a rewrite at 10x.',
    dataModel: `\`\`\`
organizations(id, name, plan)
memberships(id, org_id, user_id, role)
<every domain table>(..., tenant_id = org_id)
audit_log(...), webhook_events(github/stripe delivery id UNIQUE)
\`\`\``,
    apiDesign: '- All endpoints scoped by org; billing webhook endpoint with signature verification + dedupe.',
    architecture:
      'Modular monolith on serverless. Shared schema + tenant_id everywhere, enforced by a guarded query layer and RLS. Billing via verified, idempotent webhooks. Audit log for sensitive actions.',
    scalingStrategy:
      'Index (tenant_id, …); cache reference data; introduce a queue when async work appears. Modular boundaries leave the door open to extract services later.',
    reliabilityStrategy: 'Idempotent webhooks, retries + DLQ, backups, health checks.',
    securityStrategy: 'Deny-by-default authz, tenant isolation + RLS, secrets in a vault, audit log.',
    observabilityStrategy: 'Structured logs with tenant + request id, RED metrics, a few SLOs.',
    costConsiderations: 'Serverless keeps idle cost near zero; watch DB connection usage via pooling.',
    tradeoffs:
      'Modular monolith over microservices: keeps a solo/small team fast while preserving future optionality.',
    finalNotes: 'This is the reusable template behind most of the user’s SaaS ideas.',
    reviewScores: {
      requirementsClarity: 4,
      dataModelQuality: 4,
      apiQuality: 4,
      scalability: 4,
      reliability: 4,
      security: 4,
      simplicity: 4,
      costAwareness: 4,
    },
  },
  {
    slug: 'webhook-heavy-payment-system',
    title: 'Webhook-heavy payment system',
    domain: 'finance',
    difficulty: 'advanced',
    status: 'designing',
    problemStatement:
      'Process payment provider webhooks (Stripe) that drive subscription state, with exactly-once effects on money and entitlements.',
    functionalRequirements: [
      'Handle invoice.paid, subscription.updated, etc.',
      'Update entitlements/subscription state.',
      'Reconcile against the provider as a backstop.',
    ],
    nonFunctionalRequirements: [
      'Exactly-once application of money/entitlement effects.',
      'Out-of-order event tolerance.',
      'Auditable state transitions.',
    ],
    constraints: ['Stripe at-least-once delivery; events can arrive out of order.'],
    trafficAssumptions: 'Bursty around billing cycles.',
    dataModel: `\`\`\`
stripe_events(id UNIQUE, type, created, processed_at)
subscriptions(id, customer_id, status, current_period_end, updated_from_event)
ledger(id, customer_id, amount_cents, event_id, at)  -- append-only
\`\`\``,
    apiDesign: '- \`POST /webhooks/stripe\` verify + dedupe + enqueue. Worker applies effects idempotently and reconciles.',
    architecture:
      'Verify signature → record event.id (unique) → enqueue → 2xx. Worker applies effects in a transaction that also marks the event processed. Out-of-order handled by comparing event \`created\`/version before overwriting subscription state. A periodic reconciliation job fetches provider truth as a backstop.',
    scalingStrategy: 'Queue absorbs cycle bursts; idempotent upserts keep workers stateless.',
    reliabilityStrategy:
      'Idempotency by event id; out-of-order guards; reconciliation catches missed/lost events; DLQ for failures.',
    securityStrategy: 'Signature verification; least-privilege keys; append-only ledger.',
    observabilityStrategy: 'Unprocessed-event age, reconciliation diffs, DLQ depth.',
    costConsiderations: 'Mostly DB + compute; reconciliation frequency is the tunable cost.',
    tradeoffs:
      'Reconciliation adds work but is the safety net for the “lost webhook” case that pure event-handling misses.',
    finalNotes: 'Idempotency + reconciliation together are what make this trustworthy with money.',
  },
  {
    slug: 'content-publishing-system',
    title: 'Content / blog publishing system',
    domain: 'content-platform',
    difficulty: 'intermediate',
    status: 'not-started',
    problemStatement:
      'Design a publishing platform with drafts, scheduled publishing, and fast, cache-friendly public reads.',
    functionalRequirements: [
      'Author drafts; schedule publish times.',
      'Public reading with high cache hit rates.',
      'Tags, search, and related posts.',
    ],
    nonFunctionalRequirements: [
      'Public reads served largely from cache/CDN.',
      'Scheduled publishing fires reliably.',
    ],
    constraints: ['Read-heavy; writes are rare.'],
    trafficAssumptions: 'Reads >> writes; occasional spikes on popular posts.',
    dataModel: `\`\`\`
posts(id, slug, status[draft|scheduled|published], publish_at, body, updated_at)
tags(id, name), post_tags(post_id, tag_id)
\`\`\``,
    apiDesign: '- CRUD for posts; public GET by slug (cached); cron publishes scheduled posts.',
    architecture:
      'Read path is CDN/cache-first keyed by slug, invalidated on publish/edit. A cron flips scheduled→published at publish_at and purges/regenerates cache. Writes are low-volume and simple.',
    scalingStrategy: 'CDN + cache handle read spikes; the DB barely sees public traffic.',
    reliabilityStrategy: 'Idempotent publish job; backups.',
    securityStrategy: 'Author auth; public reads are anonymous and safe.',
    observabilityStrategy: 'Cache hit ratio, publish-job success, origin load.',
    costConsiderations: 'CDN offload keeps origin/database cost minimal.',
    tradeoffs: 'Cache invalidation on publish is the main correctness concern.',
    finalNotes: 'Classic read-heavy caching problem; invalidation strategy is the crux.',
  },
];
