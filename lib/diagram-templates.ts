import type { DiagramType } from '@/types/enums';

export interface DiagramTemplate {
  key: string;
  label: string;
  diagramType: DiagramType;
  code: string;
}

export const diagramTemplates: DiagramTemplate[] = [
  {
    key: 'c4-context',
    label: 'C4 — System context',
    diagramType: 'c4-context',
    code: `flowchart TD
  USER([Customer]) --> SYS[Your System]
  ADMIN([Admin]) --> SYS
  SYS --> EXT1[(Payment provider)]
  SYS --> EXT2[(Email provider)]
  EXT1 -->|webhooks| SYS`,
  },
  {
    key: 'c4-container',
    label: 'C4 — Containers',
    diagramType: 'c4-container',
    code: `flowchart TD
  U[User] --> WEB[Web app]
  WEB --> API[API / route handlers]
  API --> DB[(Postgres)]
  API --> CACHE[(Cache)]
  API --> Q[(Queue)]
  Q --> WK[Worker]`,
  },
  {
    key: 'sequence-webhook',
    label: 'Sequence — Webhook flow',
    diagramType: 'sequence',
    code: `sequenceDiagram
  participant P as Provider
  participant W as Webhook endpoint
  participant Q as Queue
  participant Wk as Worker
  P->>W: signed event
  W->>W: verify + dedupe
  W->>Q: enqueue
  W-->>P: 200 OK
  Q->>Wk: process idempotently`,
  },
  {
    key: 'queue-processing',
    label: 'Queue processing',
    diagramType: 'queue-flow',
    code: `flowchart LR
  P[Producer] --> Q[(Queue)]
  Q --> C[Consumer]
  C -->|ok| Done([Done])
  C -->|fail| R{Retry?}
  R -->|yes| Q
  R -->|no| DLQ[(DLQ)]`,
  },
  {
    key: 'api-lifecycle',
    label: 'API request lifecycle',
    diagramType: 'sequence',
    code: `sequenceDiagram
  participant C as Client
  participant E as Edge
  participant F as Handler
  participant DB as Database
  C->>E: request
  E->>F: forward
  F->>DB: query
  DB-->>F: rows
  F-->>C: response`,
  },
  {
    key: 'multi-tenant',
    label: 'Multi-tenant SaaS',
    diagramType: 'c4-container',
    code: `flowchart TD
  U[Org user] --> APP[App]
  APP --> GQ[Guarded query layer]
  GQ --> DB[(Postgres + RLS)]
  APP --> CACHE[(Cache)]`,
  },
  {
    key: 'serverless-saas',
    label: 'Serverless SaaS',
    diagramType: 'deployment',
    code: `flowchart TD
  U[User] --> CDN[Edge/CDN]
  CDN --> FN[Serverless functions]
  FN --> POOL[Pooled Postgres]
  CRON[Cron] --> Q[(Queue)]
  Q --> WK[Worker]`,
  },
  {
    key: 'traditional-backend',
    label: 'Traditional backend',
    diagramType: 'deployment',
    code: `flowchart TD
  U[User] --> LB[Load balancer]
  LB --> A1[App 1]
  LB --> A2[App 2]
  A1 --> DB[(Postgres)]
  A2 --> DB
  A1 --> R[(Redis)]`,
  },
  {
    key: 'observability-pipeline',
    label: 'Observability pipeline',
    diagramType: 'data-flow',
    code: `flowchart LR
  APP[App] --> LOGS[(Logs)]
  APP --> MET[(Metrics)]
  APP --> TR[(Traces)]
  MET --> ALERT{SLO burn?}
  ALERT -->|yes| PAGE[Page]`,
  },
  {
    key: 'deployment-flow',
    label: 'Deployment flow',
    diagramType: 'deployment',
    code: `flowchart LR
  C[Commit] --> CI[CI]
  CI --> MIG[Migrate]
  MIG --> D[Deploy]
  D --> S{Healthy?}
  S -->|yes| LIVE[Live]
  S -->|no| RB[Rollback]`,
  },
];

export const blankDiagram = `graph TD
  A[Start] --> B[Next]`;
