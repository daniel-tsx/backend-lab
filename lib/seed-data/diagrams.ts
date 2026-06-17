import type { DiagramSeed } from './types';

export const diagramSeeds: DiagramSeed[] = [
  {
    title: 'API request lifecycle',
    description: 'A request from browser to handler and back, through edge and middleware.',
    diagramType: 'sequence',
    conceptSlug: 'http-request-lifecycle',
    mermaidCode: `sequenceDiagram
  participant C as Client
  participant E as Edge / CDN
  participant F as Function (handler)
  participant DB as Postgres
  C->>E: HTTPS request
  E->>E: TLS, cache check, auth redirect
  E->>F: forward (cache miss)
  F->>F: validate input, authz
  F->>DB: query (pooled)
  DB-->>F: rows
  F-->>C: JSON + status + headers`,
  },
  {
    title: 'Webhook handling sequence',
    description: 'Verify, acknowledge fast, dedupe, and process asynchronously.',
    diagramType: 'sequence',
    conceptSlug: 'webhooks',
    mermaidCode: `sequenceDiagram
  participant P as Provider (Stripe)
  participant W as Webhook endpoint
  participant Q as Queue
  participant Wk as Worker
  P->>W: POST signed event
  W->>W: verify signature
  W->>W: insert event.id (dedupe)
  W->>Q: enqueue work
  W-->>P: 200 OK (fast)
  Q->>Wk: deliver
  Wk->>Wk: process idempotently`,
  },
  {
    title: 'Queue processing with retries and DLQ',
    description: 'Producers, broker, consumers, retries, and a dead-letter queue.',
    diagramType: 'queue-flow',
    conceptSlug: 'queues',
    mermaidCode: `flowchart LR
  P[Producer] --> Q[(Queue)]
  Q --> C[Consumer / Worker]
  C -->|success: ack| Done([Done])
  C -->|transient error| R{Retry < N?}
  R -->|yes: backoff+jitter| Q
  R -->|no| DLQ[(Dead Letter Queue)]
  DLQ --> A[[Alert + manual replay]]`,
  },
  {
    title: 'Multi-tenant SaaS architecture',
    description: 'Shared-schema multi-tenancy with a guarded query layer and RLS.',
    diagramType: 'c4-container',
    conceptSlug: 'multi-tenancy',
    mermaidCode: `flowchart TD
  U[Org user] --> APP[Next.js App + Route Handlers]
  APP --> AUTH[Auth / session]
  APP --> GQ[Guarded query layer\\ninjects tenant_id]
  GQ --> DB[(Postgres\\nshared schema + RLS)]
  APP --> CACHE[(Cache)]
  subgraph Tenant isolation
    GQ
    DB
  end`,
  },
  {
    title: 'Serverless SaaS architecture',
    description: 'Vercel functions + Neon + queue + object storage.',
    diagramType: 'deployment',
    mermaidCode: `flowchart TD
  U[User] --> CDN[Vercel Edge / CDN]
  CDN --> FN[Serverless Route Handlers]
  FN --> POOL[Neon pooled endpoint]
  POOL --> PG[(Neon Postgres)]
  FN --> R2[(Cloudflare R2)]
  CRON[Vercel Cron] --> QUEUE[(Queue)]
  QUEUE --> WORKER[Serverless worker]
  WORKER --> POOL`,
  },
  {
    title: 'Traditional backend architecture',
    description: 'Long-running Node/Python service behind a load balancer.',
    diagramType: 'deployment',
    mermaidCode: `flowchart TD
  U[User] --> LB[Load Balancer]
  LB --> API1[App instance 1]
  LB --> API2[App instance 2]
  API1 --> PG[(Postgres)]
  API2 --> PG
  API1 --> REDIS[(Redis)]
  WK[Always-on worker] --> Q[(Queue)]
  Q --> WK
  WK --> PG`,
  },
  {
    title: 'Observability pipeline',
    description: 'Logs, metrics, and traces flowing to dashboards and alerts.',
    diagramType: 'data-flow',
    conceptSlug: 'observability',
    mermaidCode: `flowchart LR
  APP[Application] -->|structured logs| LOGS[(Log store)]
  APP -->|metrics| MET[(Metrics TSDB)]
  APP -->|trace spans| TR[(Tracing)]
  LOGS --> DASH[Dashboards]
  MET --> DASH
  TR --> DASH
  MET --> ALERT{SLO burn?}
  ALERT -->|yes| PAGE[Page on-call]`,
  },
  {
    title: 'Deployment flow',
    description: 'From commit to production with migrations.',
    diagramType: 'deployment',
    mermaidCode: `flowchart LR
  DEV[Commit] --> CI[CI: typecheck + build]
  CI --> MIG[Run migrations\\nexpand]
  MIG --> DEPLOY[Deploy app]
  DEPLOY --> SMOKE[Health/smoke checks]
  SMOKE -->|ok| LIVE[Live]
  SMOKE -->|fail| ROLLBACK[Rollback]`,
  },
  {
    title: 'SaaS system context',
    description: 'The system and its external actors and dependencies.',
    diagramType: 'c4-context',
    mermaidCode: `flowchart TD
  USER([Customer]) --> SYS[Your SaaS]
  ADMIN([Admin]) --> SYS
  SYS --> STRIPE[(Stripe)]
  SYS --> EMAIL[(Email provider)]
  SYS --> STORAGE[(Object storage)]
  STRIPE -->|webhooks| SYS`,
  },
  {
    title: 'DueKind reminder flow',
    description: 'Cron enqueues; an idempotent worker sends reminders.',
    diagramType: 'queue-flow',
    caseStudySlug: 'duekind-reminder-system',
    mermaidCode: `flowchart LR
  CRON[Cron: find due] --> Q[(Queue)]
  Q --> W[Worker: send email]
  W -->|sent| MARK[Mark reminder sent]
  W -->|fail| RETRY{Retry < N?}
  RETRY -->|yes| Q
  RETRY -->|no| DLQ[(DLQ + alert)]
  PAID[Invoice paid] --> CANCEL[Cancel pending reminders]`,
  },
  {
    title: 'BurnCap ingestion pipeline',
    description: 'Buffered ingestion, append-only events, and rollups.',
    diagramType: 'data-flow',
    caseStudySlug: 'burncap-cost-monitoring',
    mermaidCode: `flowchart LR
  SRC[Usage events] --> IN[/POST /ingest 202/]
  IN --> Q[(Queue)]
  Q --> W[Worker]
  W --> RAW[(usage_events append-only)]
  W --> ROLL[(usage_rollups)]
  ROLL --> DASH[Dashboard]
  EVAL[Budget evaluator] --> ROLL
  EVAL -->|cap exceeded| ALERT[Idempotent alert]`,
  },
  {
    title: 'Idempotent webhook ER',
    description: 'Tables that make webhook processing exactly-once.',
    diagramType: 'entity-relationship',
    conceptSlug: 'idempotency',
    mermaidCode: `erDiagram
  WEBHOOK_EVENTS ||--o{ EFFECTS : "drives"
  WEBHOOK_EVENTS {
    string id PK
    string delivery_id UK
    string type
    timestamp processed_at
  }
  EFFECTS {
    string id PK
    string event_id FK
    string kind
    timestamp at
  }`,
  },
];
