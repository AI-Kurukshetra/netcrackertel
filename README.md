# TelecoSync

TelecoSync is a production-oriented OSS/BSS SaaS monorepo for telecom operators. It includes a premium Next.js dashboard, modular APIs, Supabase schema and RLS assets, deterministic demo data, and a FastAPI AI microservice for predictive telecom workflows.

## Local run

```bash
npm install
npm run dev
```

The local app defaults to demo mode, so dashboards render seeded telecom data without requiring a live Supabase instance. Production configuration uses Supabase Postgres, Auth, Storage, Realtime, and Edge Functions through the SQL and service assets in this repository.

## Workspace

- `apps/web`: Primary TelecoSync SaaS dashboard
- `apps/admin`: Admin control surface
- `packages/types`: Shared telecom domain types
- `packages/database`: Schema metadata, SQL generation helpers, demo seed data
- `packages/api`: API-first route and validation layer
- `packages/services`: Analytics, orchestration, and AI gateway services
- `packages/ui`: Reusable UI primitives and dashboard components
- `services/ai`: FastAPI AI microservice
- `supabase/migrations`: Production SQL migrations and RLS policies
- `infrastructure`: Docker, Kubernetes, and CI/CD assets
- `doc`: Product, architecture, schema, decisions, and change tracking
# netcrackertel
