# TelecoSync Deployment Guide

## Local development
1. `cp .env.example .env.local`
2. `npm install`
3. `npm run dev`
4. Optional AI service: `npm run dev:ai`

## Docker compose
1. `docker-compose up --build`
2. Web app: `http://localhost:3000`
3. Admin app: `http://localhost:3001`
4. AI service: `http://localhost:8001/health`

## Production considerations
- Point the Next.js apps to Supabase URL, anon key, and service role key.
- Apply `supabase/migrations/*.sql` to the target Supabase project.
- Move the deterministic demo data layer behind a repository abstraction backed by Supabase queries.
- Deploy the FastAPI service behind an internal service mesh or gateway.
- Apply Kubernetes manifests from `infrastructure/kubernetes`.
