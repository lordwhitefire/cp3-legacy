# ADR-0013: Privacy Policy (GDPR-Compliant)

**Status:** Accepted  
**Date:** 2026-07-01  
**Standard:** Privacy Policy (GDPR-Compliant)  
**Area:** 20 — Legal & Compliance

## Context

CP3 Legacy uses Vercel Analytics (Area 19) which collects anonymized page view and Core Web Vitals data at the CDN level — no cookies, no personal data. Without a privacy policy, visitors have no way to understand what data is collected.

## Decision

Create a GDPR-compliant privacy policy page that:
- Discloses Vercel Analytics data collection (cookie-free, anonymized)
- States that no personal data is collected directly
- Documents no third-party data sharing
- Provides contact for privacy inquiries
- Links from the site footer

No cookie consent banner is needed — Vercel Analytics does not use cookies and collects no personal data, falling outside GDPR cookie consent requirements (Recital 30, ePrivacy Directive).

## Implementation

- Policy at `src/app/privacy/page.tsx` with route `/privacy`
- Link added to Footer.tsx navigation list
- Content covers: data collected, data sharing, user rights, contact

## Alternatives Considered

- **No policy** — rejected; industry standard requires disclosure even for minimal analytics
- **Third-party policy generator** — rejected; too generic, content would need tailoring anyway

## Consequences

- Privacy policy must be updated if contact forms, user accounts, or third-party scripts are added
- Legal liability is minimal — the policy accurately reflects that no personal data is collected
- Footer link provides discoverability and builds trust
