# TelecoSync Decisions

- [2026-03-14 10:15] Use a deterministic local demo data layer as the default runtime source while keeping Supabase SQL and adapters production-ready. Rationale: the platform must run immediately with `npm run dev` even without hosted infrastructure.
- [2026-03-14 10:27] Drive most product modules from generic server-rendered module pages backed by a shared collection service. Rationale: the platform needs broad functional coverage quickly while preserving a consistent premium UI and API-first data flow.
- [2026-03-14 10:46] Promote high-value modules from generic list pages to dedicated interactive workspaces once the baseline platform is in place. Rationale: CRM onboarding and catalog management are core buying-journey flows and must behave like product features, not demo placeholders.
