# ADR-0012: Vercel Git-Based Auto-Deployment

**Status:** Accepted  
**Date:** 2026-07-01  
**Standard:** Vercel Git-Based Auto-Deployment  
**Area:** 18 — Deployment & DevOps

## Context

CP3 Legacy is a Next.js static site that needs automatic deployment to production when code is pushed to the main branch. Manual deployment is error-prone and creates friction.

## Decision

Adopt Vercel Git-Based Auto-Deployment with the following configuration:

- Git repo connected to Vercel project
- `main` branch set as Production Branch — every push triggers a production deploy
- Environment Variables configured in Vercel dashboard (matching `.env.local` / `.env.example`)
- Build command: Next.js default (detected automatically by Vercel)
- Preview deployments enabled for all non-main branches

## Implementation

- Vercel project connected at `https://cp3-legacy.vercel.app`
- Environment variables set in Vercel dashboard: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `REVALIDATE_SECRET`, `SANITY_API_WRITE_TOKEN`, `GROQ_API_KEY`
- `vercel.json` provides security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- GitHub Actions (daily-refresh) generates fresh `data.json` and triggers Vercel deploy hook

## Alternatives Considered

- **Manual deploy via `vercel deploy` CLI** — rejected because it requires developer to remember to deploy after every change; no integration with GitHub
- **Vercel CLI in CI** — rejected in favor of Git auto-deploy which is simpler and provides preview deployments automatically
- **Other platforms (Netlify, Railway)** — rejected because Vercel is already the platform of choice for Next.js and provides the tightest integration

## Consequences

- Every push to `main` deploys instantly to production
- Preview deployments enable testing before merge
- Daily-refresh GHA workflow runs scrapers and triggers a production redeploy via webhook
- Platform lock-in: migrating off Vercel requires rebuilding the deployment pipeline
- Build minutes consumed on Vercel's free tier
