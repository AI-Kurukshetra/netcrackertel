# TelecoSync Architecture

## Topology
- `apps/web` is the primary Next.js 14 App Router application using React Server Components for most pages.
- `apps/admin` is a secondary administrative console.
- `packages/types` defines the canonical telecom domain model.
- `packages/database` owns deterministic demo data, schema metadata, and Supabase-oriented data structures.
- `packages/api` provides API-first RBAC-aware response builders for route handlers.
- `packages/services` contains analytics, orchestration, and AI-facing service functions.
- `services/ai` exposes FastAPI endpoints for predictive models and operational recommendations.

## Runtime modes
- Local demo mode: server components and APIs use the deterministic dataset from `packages/database`.
- Production mode: the same domain model maps onto Supabase tables, row-level security, auth claims, storage buckets, and realtime channels.

## Security model
- Multi-tenant design across all business entities using `tenant_id`.
- RLS in Supabase enforces tenant isolation on reads and writes.
- RBAC maps product roles to resource permissions in the API layer.
- Audit logs and event logs provide operational traceability.

## Observability
- Health endpoints: `/api/dashboard` for web, `/health` for AI service
- CI runs type and dataset checks
- Kubernetes manifests include readiness and liveness probes
