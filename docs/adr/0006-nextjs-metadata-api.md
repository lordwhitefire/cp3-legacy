# ADR-0006: Adopt Next.js Metadata API

## Status

Accepted

## Date

2026-06-30

## Context

CP3 Legacy needs a consistent approach to SEO metadata — title tags, meta descriptions, Open Graph cards, Twitter cards, canonical URLs, robots directives, and sitemaps.

The Next.js Metadata API (stable since Next.js 14) provides a TypeScript-native way to declare all of these via `export const metadata` (static) or `generateMetadata` (dynamic). It automatically deduplicates tags, merges parent layout metadata with child pages, and injects the correct `<head>` elements at build time.

## Decision

We will use the Next.js Metadata API as the single standard for all SEO metadata.

Implementation:
- `layout.tsx` exports base metadata (title, description, Open Graph defaults, icons)
- `robots.ts` exports crawler rules (allow all, disallow `/api/*`, reference sitemap)
- `sitemap.ts` exports the sitemap with all public URLs
- JSON-LD structured data (Organization, WebSite schemas) is injected via `<script>` tag in `page.tsx`
- `public/llms.txt` provides AI crawler guidance

## Alternatives Considered

- **next-seo package**: Would add an external dependency for metadata that the Metadata API now handles natively. Not needed.
- **Manual `<head>` tags**: Would work but lacks automatic deduplication and type safety. Prone to conflicts.
- **No structured metadata**: Would hurt SEO discoverability for the hire-me funnel.

## Consequences

Positive:
- TypeScript-native with full autocompletion — reduces errors
- Automatic deduplication — prevents conflicting tags
- Parent layout merges with child pages automatically
- Zero-cost — no external dependencies
- JSON-LD is inline in page.tsx — no extra fetch needed

Negative:
- JSON-LD injection requires `dangerouslySetInnerHTML` — a minor maintenance concern
- Metadata is tied to Next.js — migrating frameworks means rewriting it
