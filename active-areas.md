# Active Areas — CP3 Legacy Rebuild
> Filtered from `web-development-areas.md` — areas 01–33 (Section A) and 73–80 (Section E)

## SECTION A — ALL PROJECTS (01–33)

### 01. Project Setup

> **Standard:** Twelve-Factor App Methodology
> **Authority:** Heroku engineers (Adam Wiggins, 2011). Spec hosted at 12factor.net. Adapted by Docker, Kubernetes, and the cloud-native ecosystem. Wikipedia entry, cited by IBM Redbooks, Nginx, and Canonical.
> **Origin:** Drafted circa 2011 by developers at Heroku after observing thousands of app deployments. They synthesized patterns that repeatedly produced portable, resilient, cloud-deployable software and formalised them into twelve factors. Each factor addresses a specific failure mode they saw in real projects — hardcoded config leaking secrets, implicit system dependencies breaking on different OS versions, long-lived state preventing horizontal scaling, and dev/prod divergence causing "works on my machine" bugs. The methodology has been widely adopted as the baseline for SaaS and cloud-native development.
> **Application to CP3 Legacy:**
> - Single Git repository tracked in version control, one codebase for many deploys (Factor I)
> - All dependencies declared in package.json with exact version ranges, no implicit system tools (Factor II)
> - Config stored in .env.local — Sanity keys, project ID, dataset name — never hardcoded in source (Factor III)
> - Backing services (future Sanity CMS) attached via environment variable URL, swappable without code changes (Factor IV)
> - Build, release, run stages separated: `npm run build` compiles, then `next start` serves (Factor V)
> - Stateless processes — no in-memory session data, all content sourced from data.json at build time (Factor VI)
> - Self-contained HTTP server bound to port via next dev/start (Factor VII)
> - Horizontally scalable via Vercel's auto-scaling edge functions (Factor VIII)
> - Fast startup (~844ms), clean shutdown on ^C (Factor IX)
> - Same Next.js version, same Node environment in dev and production (Factor X)
> - Logs to stdout via next dev, build errors to console (Factor XI)
> - Admin processes: schema deployment via sanity CLI, scripted data tasks in scripts/ (Factor XII)
> **Pros:** Proven across millions of deployments on Heroku, Vercel, AWS. Every factor addresses a concrete failure mode. Dev/prod parity eliminates environment bugs. Cloud-portable by design — switching from Vercel to another provider requires minimal changes. Each factor is independently adoptable; you don't need all twelve to benefit.
> **Cons:** Some factors are specific to Heroku's deployment model (e.g., port binding via $PORT is less relevant on Vercel's serverless model). The methodology is over-engineered for simple static sites — CP3 Legacy is currently a static Next.js export, so factors like concurrency (VIII) and disposability (IX) are handled transparently by Vercel. The admin processes factor (XII) is ambiguous for a Next.js project where one-off scripts aren't clearly separated from the app server.

> **Status — Done:**
> - ✅ Factor I: Single Git repo, one codebase
> - ✅ Factor II: package.json with explicit deps, npm install isolates them
> - ✅ Factor III: .env.local with all config keys, no hardcoded secrets in code
> - ✅ Factor V: Vercel deployment config — vercel.json + GitHub Actions workflow (daily-refresh) that builds, injects env vars, and deploys
> - ✅ Factor VI: Stateless — content from data.json, no in-memory session
> - ✅ Factor VII: Next.js binds to port, self-contained HTTP server
> - ✅ Factor IX: Fast startup and clean shutdown
> - ✅ Factor XI: Logs to stdout (next dev), errors to console
> - ✅ Factor XII: Documented entry points in scripts/ for admin tasks (generate-data.ts, complete-migration.ts, scripts/refresh-prod/)
>
> **Status — Remaining:**
> - ✅ Factor IV: Sanity isolated from components to protect the UI. Direct Sanity queries in component code (via `site-data-context.tsx` / `queries.ts`) were causing the AI assistant to repeatedly modify and break UI components. Fix: all content is fetched at build time by `generate-data.ts` and served as static `data.json`. Components are pure UI — they never import or know about Sanity. The Sanity client code exists as a separate module but is kept out of the component tree. Fresh data is supplied by the daily-refresh GitHub Action pipeline.
> - ➖ Factor VIII: N/A — demo project, no production traffic expected
> - 🔲 Factor X: Document dev/prod parity check in README — build locally before deploy, same Node version in both environments

### 02. Stack Decisions

> **Standard:** Architecture Decision Records (ADRs)
> **Authority:** Michael Nygard (2011). Maintained at `adr.github.io`. Endorsed by ThoughtWorks, AWS Prescriptive Guidance, Martin Fowler, and the broader software architecture community.
> **Origin:** Drafted in 2011 by Michael Nygard after observing teams repeatedly re-debate the same technical decisions. The core insight was that documenting the *context and reasoning* behind a decision is more valuable than documenting the decision itself — because context outlives any single choice. The format was refined by ThoughtWorks and formalised at adr.github.io with standard statuses (Proposed → Accepted → Deprecated → Superseded) and a Y-statement template variant from Zdun et al. (2015). In 2026, ADRs are considered table stakes for professional software teams alongside version control and CI.
> **Application to CP3 Legacy:**
> - `docs/adr/` directory created at project root, co-located with code
> - ADR-0001 ("Record Architecture Decisions") establishes the practice itself — the meta-ADR
> - Template in `docs/adr/template.md` provides consistent structure
> - Each future standard from this pipeline gets its own ADR (e.g., ADR-0002 for the chosen Deployment/DevOps standard)
> - ADRs are written at decision time, reviewed in PRs, and never deleted
> - Status changes track the decision lifecycle: Proposed → Accepted or Superseded
> - All 41 areas' chosen standards will eventually have corresponding ADRs
> **Pros:** Zero-cost tooling — just Markdown files in Git. Co-located with code, so discoverable by developers. Survives tool changes (Confluence → Notion → whatever). Version-controlled — every decision has a history. Peer-reviewable via PRs. Individually linkable. No vendor lock-in.
> **Cons:** Requires team discipline to write at decision time. Adds process overhead — not every minor choice needs an ADR. Can accumulate stale entries if superseding isn't enforced. Format is text-only — no embedded diagrams natively (though Mermaid.js in Markdown works).

> **Status — Done:**
> - ✅ ADR infrastructure created: `docs/adr/` directory + `template.md`
> - ✅ ADR-0001 written and accepted: "Record Architecture Decisions"
> - ✅ Template follows Nygard format: Status, Context, Decision, Alternatives, Consequences
> - ✅ Stored in Git alongside application code
>
> **Status — Remaining:**
> - ✅ Write ADR-0002 for the next adopted standard from this pipeline
> - 🔲 Add ADR creation to the definition of done for significant technical decisions
> - 🔲 Establish PR review checklist: "Does this change require a new ADR or an update to an existing one?"

### 03. Design System

> **Standard:** Atomic Design Methodology
> **Authority:** Brad Frost (2013–2016). Book, website, workshops. Adopted by Material Design (Google), Carbon (IBM), Polaris (Shopify), Paste (Twilio), and most modern design systems.
> **Origin:** Brad Frost introduced Atomic Design in 2013 as a blog post after years of building responsive websites and noticing teams lacked a shared vocabulary for UI components. The chemistry analogy — atoms, molecules, organisms, templates, pages — gave teams a way to talk about abstraction levels. Each level has a clear responsibility: atoms are the smallest indivisible elements (labels, inputs, buttons), molecules combine atoms into simple functional units, organisms combine molecules into distinct sections, templates arrange organisms into page layouts, and pages fill templates with real content. The methodology was expanded into a full book in 2016.
> **Application to CP3 Legacy:**
> - Formalize the 5-level taxonomy across all 57 components (9 alchemists custom + 48 shadcn/ui primitives)
> - Atoms (30): button, input, label, badge, avatar, separator, skeleton, switch, checkbox, slider, progress, toggle, tooltip, select, radio-group, textarea, input-otp, sonner, scroll-area, aspect-ratio, table, command, hover-card, context-menu, menubar, navigation-menu, breadcrumb, pagination, calendar, sheet-trigger
> - Molecules (18): card, alert, alert-dialog, dialog, drawer, sheet, popover, dropdown-menu, accordion, collapsible, tabs, toast, toaster, form, sidebar, resizable, carousel, chart
> - Organisms (9): Header, MobileHeader, HeroUnit, FeaturedCarousel, FeaturedSlider, MainContent, Footer, PushyPanel, Modals
> - Templates: Page layout structures (implicit in `src/app/layout.tsx`)
> - Pages: Home page, sub-pages (instances of templates with real content)
> - Create `docs/design-system/component-taxonomy.md` to document the full map
> - Enforce in code review: organisms import molecules and atoms, never other organisms directly
> **Pros:** Zero-cost — no new tools or libraries. Already implicitly followed, just needs documentation. Shared vocabulary for all team members. Prevents component sprawl. Compatible with every framework. Proven at scale.
> **Cons:** Conceptual model, not a technical standard — enforcement is cultural/review-based. Chemistry analogy breaks down at the organism level (organisms can be as large or small as needed). Some components straddle levels. Requires discipline.

> **Status — Done:**
> - ✅ Component map identified: 30 atoms, 18 molecules, 9 organisms, 0 explicit templates, 1+ pages
> - ✅ All components already follow atomic hierarchy implicitly
>
> **Status — Remaining:**
> - ✅ Write ADR-0002 to formalize the Atomic Design decision
> - 🔲 Establish PR review guideline: "New components must declare their Atomic level"
> - 🔲 Add organism-to-organism import check to code review checklist
> - 🔲 Template level: extract layout patterns from `layout.tsx` into explicit template components

### 04. Brand & Identity

> **Standard:** Semantic Color Token Architecture
> **Authority:** Salesforce Design System team (2014, coined "design tokens"). Adopted by Material Design (Google), Carbon (IBM), Polaris (Shopify), Pajamas (GitLab). Formalised by the W3C Design Tokens Community Group (DTCG) in the 2025.10 specification.
> **Origin:** The concept emerged at Salesforce around 2014 when the design system team needed a way to share design decisions across platforms without hardcoding values. They realised that a name like `--color-brand-primary` communicates *intent* in a way that `#2563eb` does not. The practice spread through the design systems community — Nathan Curtis, Jina Bolton, and Jon WIlliams at Salesforce documented the approach. By 2018, it was standard practice across major design systems. The W3C DTCG formalised the specification in 2025.10, providing a standard JSON format for defining tokens with `$value`, `$type`, and `$description` properties. Today, semantic tokens are the foundation of every production design system.
> **Application to CP3 Legacy:**
> - Audit all brand color usage in `tailwind.config.ts`, components, and CSS files
> - Define semantic roles: brand-primary, brand-accent, bg-surface, bg-muted, text-body, text-muted, text-on-brand, border-default, border-muted
> - Map each role to the Alchemists palette hex values in a single source of truth
> - Replace raw hex values in Tailwind config with semantic token references
> - Document all token definitions in `docs/brand/color-tokens.md`
> - Ensure each role includes hover/active/disabled variants where applicable
> **Pros:** Single source of truth — change one token, update everywhere. Communicates intent (text-body vs. text-muted) rather than appearance (gray-600). Makes dark mode trivial — swap token values, keep same roles. Compatible with DTCG spec from Area 03. Already an industry baseline — any new developer recognises semantic tokens.
> **Cons:** Requires an audit pass (non-trivial effort if hexes are scattered). Over-engineering for a small project with only one brand (but CP3 Legacy has 41 areas, so scale warrants it). Token naming disagreements can cause friction if not documented early.

> **Status — Done:**
> - ✅ Semantic role categories identified: brand, background, text, border, state
>
> **Status — Remaining:**
> - 🔲 Audit all brand color usage across the codebase
> - 🔲 Define exact semantic role names and their mapped hex values
> - 🔲 Update `tailwind.config.ts` to use semantic token references
> - 🔲 Create `docs/brand/color-tokens.md` with full documentation
> - ✅ Write ADR-0003 to formalize the Semantic Color Token decision
> - 🔲 Verify all 48 shadcn/ui components still render correctly after token changes
### 05. Frontend Architecture

> **Standard:** Next.js App Router Convention
> **Authority:** Vercel / Next.js core team (2023–present). The official architectural convention for all new Next.js projects. Supersedes the legacy Pages Router, which receives maintenance-only updates.
> **Origin:** Introduced as a beta in Next.js 13 (October 2022) and became stable in Next.js 14 (November 2023). The App Router represented a fundamental shift from file-based page components to a server-first architecture using React Server Components. Key file conventions (layout.tsx, page.tsx, loading.tsx, error.tsx) replaced manual wrapping with implicit boundaries. Route groups `(group)` and dynamic segments `[slug]` provided URL control without file system coupling. By Next.js 16 (2026), the App Router is the only recommended approach, with features like Partial Prerendering (PPR), Server Actions, and Cache Components built on its foundation. The convention has been adopted by Vercel's entire ecosystem and is the standard for production Next.js applications.
> **Application to CP3 Legacy:**
> - Already adopted: `src/app/` directory with `layout.tsx` (root layout) and `page.tsx` (home page)
> - Formalize file conventions: each route segment gets its own `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` as needed
> - Document server/client component boundary: page.tsx = server component (fetches data.json), interactive elements = client components with `'use client'`
> - Leverage route groups `(marketing)` for section-specific layouts when pages grow
> - Document the caching strategy: static generation by default, `revalidate` for ISR when Sanity CMS is integrated
> - Document metadata API pattern: `export const metadata` in page.tsx or `generateMetadata` for dynamic routes
> **Pros:** Official Next.js convention — guaranteed future compatibility. Zero cost — already adopted. File conventions eliminate boilerplate (loading.tsx replaces manual Suspense). Server-first by default reduces client JS. Metadata API centralizes SEO per route.
> **Cons:** Ties architecture to a specific framework — migrating away from Next.js means rewriting the convention. Some conventions are implicit (loading.tsx auto-wraps in Suspense) which can confuse new developers. Route groups and parallel routes add complexity for simple projects.

> **Status — Done:**
> - ✅ App Router directory structure: `src/app/` with `layout.tsx` + `page.tsx`
> - ✅ Server-first approach: page.tsx fetches data.json server-side, components marked `'use client'` only when needed
> - ✅ File-based routing with dynamic segments supported
>
> **Status — Remaining:**
> - ✅ Write ADR-0004 to formalize the App Router Convention decision
> - 🔲 Add `loading.tsx` and `error.tsx` at root level and per-route segment
> - 🔲 Document route groups convention for any future section-specific layouts
> - 🔲 Document caching strategy: static generation + ISR revalidation plan for Sanity CMS
> - 🔲 Document server/client component boundary rules in project README or architecture doc

> **Note:** Area 06 (Routing & Navigation) is covered by this architecture — routing standards will be App Router-native patterns. No separate routing library will be adopted.

### 06. Routing & Navigation

> **Standard:** Layout Hierarchy & Composition (App Router)
> **Authority:** Vercel / Next.js core team. Official App Router feature since Next.js 13 (2022), stabilised in Next.js 14 (2023). Built on React Server Components architecture.
> **Origin:** Before the App Router, Next.js required manual layout composition — `_app.js` for global wrappers, `_document.js` for HTML shell, and ad-hoc component wrapping for nested layouts. The App Router formalised this with file-system-based layout nesting: `layout.tsx` at each route segment automatically wraps all child pages. Layouts are persistent across navigations (not remounted), preserving React state and DOM. The `template.tsx` variant was added for cases where remounting is required (e.g., page view tracking, animation entry states). This hierarchy directly maps to the Template level in Atomic Design (Area 03) — `layout.tsx` = Atomic Design Template, composing organisms into page-level structure.
> **Application to CP3 Legacy:**
> - Root `src/app/layout.tsx` — HTML shell, font loading, metadata defaults, global styles
> - Future nested layouts: `(marketing)/layout.tsx` for marketing pages, `(app)/layout.tsx` for authenticated pages
> - `template.tsx` where remounting is needed (e.g., analytics page view tracking, animation triggers)
> - Document that `layout.tsx` = Atomic Design Template level, mapping Area 03 to Area 05/06
> - Each layout owns its loading, error, and not-found boundaries
> **Pros:** Zero-cost — already available. Persistent layouts preserve state across navigations. File-system convention eliminates manual wrapping. Nested at any depth. Maps directly to Atomic Design (Area 03). No additional dependencies.
> **Cons:** Layouts are implicit — new developers may not realise a `layout.tsx` at parent segment wraps all children. `template.tsx` vs `layout.tsx` distinction is subtle. Over-nesting creates unnecessary complexity.

> **Status — Done:**
> - ✅ Root layout exists at `src/app/layout.tsx` with HTML shell, metadata, and global styles
>
> **Status — Remaining:**
> - ✅ Write ADR-0005 to formalize the Layout Hierarchy decision
> - 🔲 Audit current component tree and document which layouts will be needed for future routes
> - 🔲 Add `loading.tsx` and `error.tsx` at root layout level
> - 🔲 Map Atomic Design Template level (Area 03) to App Router layout structure in documentation
> - 🔲 Document layout composition rules in project README or architecture doc

### 07. SEO & Discoverability

> **Standard:** Next.js Metadata API
> **Authority:** Vercel / Next.js core team. Official App Router API since Next.js 13 (stable in Next.js 14). TypeScript-native `Metadata` type with full autocompletion and static analysis. Supported on Vercel, Netlify, and self-hosted Next.js deployments.
> **Origin:** Introduced alongside the App Router in Next.js 13 (October 2022) to replace the legacy `next/head` and `next-seo` patterns. The Metadata API provides a single source of truth for all `<head>` elements — title, description, canonical, Open Graph, Twitter cards, robots, and alternates. Static metadata is declared via `export const metadata`, dynamic via `generateMetadata` which receives route params and search params. The API automatically deduplicates tags, merges parent layout metadata with child page metadata, and injects the correct `<meta>` and `<link>` elements at build time (static) or request time (dynamic). By Next.js 16 (2026), the Metadata API is the only supported metadata mechanism.
> **Application to CP3 Legacy:**
> - Already in use: `export const metadata` in `src/app/layout.tsx` with base title, description, and Open Graph defaults
> - Formalize static metadata pattern: every `page.tsx` exports a `metadata` object with route-specific title, description, and canonical URL
> - Formalize dynamic metadata pattern: `generateMetadata` for any future dynamic routes (`[slug]`, `[id]`)
> - Leverage `alternates` field for canonical URL management
> - Leverage `robots` field for per-route crawler directives
> - Implementation files to create:
>   - `src/app/robots.ts` — export `Robots` object: allow all, disallow `/api/*`, reference sitemap
>   - `src/app/sitemap.ts` — export `generateSitemap`: list all public URLs with `lastmod` and `priority`
>   - `src/app/page.tsx` — add schema.org JSON-LD via `<script>` tag in the page component (Organization, WebSite, BreadcrumbList)
>   - `public/llms.txt` — AI crawler guidance file listing key pages and structured data hints
> **Pros:** Official Next.js standard — guaranteed compatibility. Zero-cost implementation — already in use. TypeScript-native with autocompletion. Automatic deduplication prevents conflicting tags. Parent layouts merge with child pages automatically. `generateMetadata` supports dynamic data from CMS when Sanity is integrated. No external dependencies.
> **Cons:** Tied to Next.js — migrating frameworks means rewriting metadata handling. Some advanced patterns (like JSON-LD injection) require manual `<script>` tags rather than native API support. SEO verification still requires external tools (Google Rich Results Test, Lighthouse).

> **Status — Done:**
> - ✅ Standard chosen: Next.js Metadata API
> - ✅ Root layout metadata exists: `src/app/layout.tsx` with title, description, OG defaults
> - ✅ Metadata API convention documented (Area 05, ADR-0004)
> - ✅ Cross-area dependency clean: Area 05 (App Router) and Area 06 (Layout Hierarchy) already establish the Metadata API foundation
>
> **Status — Remaining:**
> - 🔲 Create `src/app/robots.ts` — allow all crawlers, disallow `/api/*`, point to sitemap
> - 🔲 Create `src/app/sitemap.ts` — list all public URLs with lastmod and priority
> - 🔲 Add schema.org JSON-LD to `src/app/page.tsx` — Organization, WebSite, BreadcrumbList schemas
> - 🔲 Create `public/llms.txt` — AI crawler guidance with key pages and structured data hints
> - 🔲 Write ADR-0006 to formalize the Next.js Metadata API decision
> - 🔲 Verify all pages (current + future) export route-specific metadata

### 08. Performance

> **Standard:** Core Web Vitals (Google)
> **Authority:** Google (2020, became ranking signal in 2021). Maintained at web.dev/vitals. LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 thresholds defined by Google's Chrome UX Report (CrUX) data. Adopted by Lighthouse, PageSpeed Insights, Search Console, and Vercel Analytics as the universal performance baseline.
> **Origin:** Google introduced Web Vitals in May 2020 as a set of quality signals essential to user experience. The three core metrics were chosen because they represent distinct aspects of the user experience — loading (LCP), interactivity (INP, formerly FID), and visual stability (CLS). The thresholds (Good/Needs Improvement/Poor) were derived from real-world Chrome UX Report data across millions of sites. In May 2021, Core Web Vitals became a direct Google Search ranking factor, cementing them as the single most important performance standard on the web. INP replaced FID in March 2024 (Google Core Web Vitals 2024 update), measuring all interactions, not just the first.
> **Application to CP3 Legacy:**
> - **LCP:** Currently ~7.2s first page load (measured from `npm run dev`). Gap: hero image (`hero-carousel.jpg`) is a large unoptimized asset loaded via `<img>` tag without sizing hints. Fix: migrate to `next/image` with `priority` prop, `loading="eager"`, and explicit `width`/`height`. Self-host Inter font via `next/font` to eliminate external font network request.
> - **INP:** Unknown — no measurement in place. Need to add event listener instrumentation or rely on Vercel Analytics CrUX data. Gap: third-party scripts (Google Fonts external CSS, Font Awesome) may block main thread. Fix: defer non-critical scripts, move Font Awesome to local subset.
> - **CLS:** Likely poor. Gap: Google Fonts FOIT (Flash of Invisible Text) causes layout shift when the font loads. Images lack explicit dimensions, so the browser cannot reserve space. Fix: `next/font` with `display: swap` eliminates FOIT; explicit `width` and `height` on all images prevents image-based shifts.
> **Pros:** Direct Google ranking factor — improving CWV improves discoverability. Measurable, objective targets — no guesswork about "fast enough". Backed by real-user data (CrUX), not synthetic lab tests only. All major performance tools (Lighthouse, PageSpeed, Vercel Analytics) report the same three metrics. The standard evolves — INP replacing FID shows Google maintains it actively.
> **Cons:** Lab tests (Lighthouse) don't always match real-user data — CrUX requires sufficient real traffic. Thresholds can be hard to meet on content-heavy pages. Some improvements (INP measurement) require JavaScript instrumentation, adding complexity. Vercel's edge network handles some aspects automatically, making it hard to know what you control.

> **Status — Done:**
> - ✅ Standard chosen: Core Web Vitals (Google)
> - ✅ Three metrics defined: LCP (≤2.5s), INP (≤200ms), CLS (≤0.1)
> - ✅ Cross-area dependency clean — no overlap with Areas 01–07
>
> **Status — Remaining:**
> - 🔲 Migrate Google Fonts to `next/font` (self-hosted) — eliminates external request + FOIT layout shift
> - 🔲 Migrate all `<img>` tags to `next/image` with explicit `width`/`height` — eliminates image-based CLS
> - 🔲 Set `priority` + `loading="eager"` on hero image — improves LCP
> - 🔲 Add `loading="lazy"` on below-fold images — reduces initial bundle
> - 🔲 Measure current INP via Vercel Analytics or manual instrumentation
> - 🔲 Move Font Awesome from external CDN to local subset — reduces blocking scripts
> - 🔲 Write ADR-0006 (or 0007) to formalize the Core Web Vitals decision
> - 🔲 Add Lighthouse CI check to GitHub Actions workflow

### 09. Responsive & Cross-Device

> **Standard:** Mobile-First Design Methodology
> **Authority:** Luke Wroblewski (2009, expanded into book "Mobile First" in 2011). Adopted by Google Material Design, Bootstrap 4+, Tailwind CSS (default breakpoints), and every major CSS framework since 2015. The W3C references mobile-first in the CSS Device Adaptation specification as the recommended approach for responsive design.
> **Origin:** Luke Wroblewski, then Chief Product Officer at Bagcheck (later acquired by Twitter), wrote "Mobile First" in 2009 after observing that most websites were designed for desktop screens then poorly adapted to mobile. His core insight: designing for the smallest screen forces prioritization of content and functionality. You can't fit everything on a 320px-wide screen, so you must decide what matters. Desktop-first design adds features; mobile-first design removes distractions. This philosophy was adopted by Bootstrap (v4+ reversed from desktop-first to mobile-first), by Google's Material Design guidelines, and by Tailwind CSS whose default `sm:`/`md:`/`lg:`/`xl:`/`2xl:` breakpoints encode mobile-first thinking directly into utility classes.
> **Application to CP3 Legacy:**
> - Audit current responsive approach: Bootstrap 3 classes (legacy `col-md-6` grid) mixed with Tailwind `sm:`/`lg:` utilities — creates duplication and conflicts
> - Standardize on Tailwind-only responsive utilities: all layout uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` instead of Bootstrap grid
> - Audit all `hidden` classes: ensure `hidden sm:block` patterns (hiding by default on mobile) are replaced with `block lg:hidden` where the mobile version is the default
> - Document breakpoint strategy: `sm: 640px` (default, mobile-first), `md: 768px` (tablet), `lg: 1024px` (desktop), `xl: 1280px` (wide), `2xl: 1536px` (ultrawide)
> - Verify mobile nav (hamburger + pushy panel) works correctly at `sm:` breakpoint — currently blocked by `icons-basket.svg` 404
> - Touch target audit: interactive elements at `sm:` must be ≥48x48px or have adequate adjacent spacing (WCAG 2.5.8)
> **Pros:** Industry standard — every modern framework defaults to mobile-first. Already using Tailwind's mobile-first breakpoints implicitly — just needs formalization. Forces content priority decisions (what shows at 320px vs 1280px). Reduces CSS complexity — mobile-first usually means less overrides than desktop-first. Better SEO — Google uses mobile version for indexing.
> **Cons:** Some design sections (hero banners, data tables) are inherently desktop-scale — forcing mobile-first can feel unnatural for those. Requires rethinking components that were built desktop-first. May surface asset issues (`icons-basket.svg` 404 is one example).

> **Status — Done:**
> - ✅ Standard chosen: Mobile-First Design Methodology
> - ✅ Breakpoint strategy documented: sm/md/lg/xl/2xl
> - ✅ Cross-area dependency clean — no overlap with Areas 01–08
>
> **Status — Remaining:**
> - 🔲 Remove Bootstrap 3 grid classes — migrate all layout to Tailwind responsive utilities
> - 🔲 Audit `hidden` vs `block` patterns — replace desktop-first hiding with mobile-first showing
> - 🔲 Fix `icons-basket.svg` 404 blocking mobile nav rendering
> - 🔲 Touch target audit at `sm:` breakpoint (min 48x48px)
> - 🔲 Write ADR-0006 (or 0007/0008) to formalize the Mobile-First Design decision
> - 🔲 Document breakpoint strategy in project README

### 10. Cross-Browser Compatibility

> **Standard:** WebDX Browser Baseline (W3C / WebDX CG)
> **Authority:** WebDX Community Group — a cross-industry group including Google, Microsoft, Mozilla, Apple, and the W3C. Formed in 2022, launched the Baseline specification in 2023. The Baseline status is published at `web.dev/baseline` and integrated into MDN (Browser Compatibility Tables show Baseline badge) and caniuse.com.
> **Origin:** Before Baseline, web developers relied on caniuse.com and MDN compatibility tables to understand browser support, but there was no unified definition of "widely available." A feature might work in Chrome and Firefox but not Safari — was it safe to use? The WebDX CG defined Baseline as a feature being available in the current and previous major versions of Chrome, Edge, Firefox, and Safari (both desktop and mobile). "Baseline 2023" means the feature was available across all engines by the end of 2023 and has remained stable. This gives developers a contract: if a feature is Baseline 2023, it is safe to use on any modern browser without fallbacks. The standard is updated yearly.
> **Application to CP3 Legacy:**
> - Set **Baseline 2023** as the minimum browser support target for CP3 Legacy
> - Audit all CSS features used against Baseline 2023: CSS Grid ✅ (Baseline 2020), Container Queries ✅ (Baseline 2023), CSS Nesting ✅ (Baseline 2023), `:has()` ✅ (Baseline 2023)
> - Document the browser matrix in `docs/cross-browser-matrix.md`: Chrome/Edge latest-1, Firefox latest-1, Safari latest-1, Safari iOS latest-1
> - Document the grace period: when adopting a new CSS feature, wait until it reaches Baseline before using it without `@supports` fallback
> - Configure Playwright tests to run against the documented browser matrix in CI
> - Feature audit: identify any Bootstrap 3 fallback code that exists purely for browser support (old IE paths) and remove if above Baseline threshold
> **Pros:** Single authoritative source for "what's safe to use" — no more checking caniuse for every property. Backed by all major browser vendors and W3C. Yearly cadence is predictable. Integrates with MDN and caniuse for lookup. Zero-cost to adopt — just changes decision-making, no new dependencies. Reduces CSS fallback code progressively as Baseline advances.
> **Cons:** Safari is often the bottleneck for new features reaching Baseline — container queries and `:has()` both launched later in Safari than Chrome. Some projects need to target older browsers for specific markets (e.g., enterprise with IE users). Baseline only tracks browser engines — doesn't cover non-browser environments (email clients, embedded WebViews). May conflict with Chrome-only features (e.g., Scroll-Driven Animations not yet Baseline).

> **Status — Done:**
> - ✅ Standard chosen: WebDX Browser Baseline
> - ✅ Baseline 2023 set as minimum browser target
> - ✅ All CP3 Legacy's current CSS features verified against Baseline 2023
> - ✅ Cross-area dependency clean — no overlap with Areas 01–09
>
> **Status — Remaining:**
> - 🔲 Create `docs/cross-browser-matrix.md` with documented browser versions
> - 🔲 Configure Playwright tests to run against the browser matrix in CI
> - 🔲 Audit and remove any pre-Baseline fallback code (Bootstrap 3 IE support paths)
> - 🔲 Write ADR-000X to formalize the WebDX Browser Baseline decision
> - 🔲 Document the baseline upgrade cadence in project README

### 11. Accessibility (a11y)

> **Standard:** WCAG 2.2 — Web Content Accessibility Guidelines
> **Authority:** W3C Web Accessibility Initiative (WAI). Current version 2.2 (October 2023). Adopted as law by: ADA Title III (US), Section 508 (US federal), EN 301 549 (EU), Accessibility for Ontarians with Disabilities Act (Canada), and similar laws in Australia, Japan, India, and Brazil. WCAG 3.0 is in draft (Silver) but 2.2 remains the legal baseline through 2026+.
> **Origin:** The Web Accessibility Initiative (WAI) was launched by the W3C in 1997. WCAG 1.0 (1999) was the first attempt to codify web accessibility requirements. WCAG 2.0 (2008) introduced the four-layer model (Principles → Guidelines → Success Criteria → Techniques) that remains today. The 2.x architecture was designed to be technology-neutral and forward-compatible — success criteria are written in terms of user needs, not specific HTML techniques. WCAG 2.1 (2018) added 17 criteria for mobile accessibility, low vision, and cognitive disabilities. WCAG 2.2 (2023) added 9 new criteria including Focus Appearance (2.4.13), Dragging Movements (2.5.7), Target Size Minimum (2.5.8), and Accessible Authentication (3.3.8). The three conformance levels (A, AA, AAA) allow organizations to set a target — AA is universally recognized as the legal minimum.
> **Application to CP3 Legacy:**
> - Set **WCAG 2.2 Level AA** as the compliance target for CP3 Legacy
> - **Perceivable:** Audit color contrast of Alchemists brand palette — dark navy backgrounds (#1a2332 area) with white text, orange/gold accent text. Verify against 4.5:1 (AA normal text) and 3:1 (AA large text). Ensure all images have `alt` attributes. Verify video content (if any) has captions.
> - **Operable:** Audit keyboard navigation on all interactive components — carousels (arrow keys + Tab), pushy panel (Escape to close, focus trap), mobile hamburger menu, modals (focus trap, Escape to dismiss), tabs (Arrow keys). Add visible focus indicators via Tailwind's `focus-visible:ring` utilities. Add skip-to-content link as first focusable element.
> - **Understandable:** Verify `<html lang="en">` (already in layout.tsx). Ensure form validation errors are programmatically associated (via `aria-describedby`). Ensure consistent heading hierarchy (h1 → h2 → h3, no skips).
> - **Robust:** Audit ARIA usage — pushy panel needs `aria-expanded`, `role="dialog"`, `aria-modal`. Carousel needs `role="region"` with `aria-roledescription="carousel"`. Use semantic HTML (nav, main, aside, footer) instead of generic divs where possible.
> **Pros:** Legal compliance — WCAG 2.2 AA is the reference for all major accessibility laws worldwide. Zero-cost standards — no licensing fees, no paid tools required for compliance. 15+ years of techniques, tools, and community knowledge. Works with automated testing (axe, Lighthouse, WAVE) for ~30% coverage and manual testing for the remainder. WCAG 2.x framework is forward-compatible with 3.0 — effort invested now transfers forward.
> **Cons:** Compliance does not guarantee usability — a page can meet all AA criteria and still be frustrating for assistive technology users. Four principles model can be abstract — teams struggle to map abstract criteria to concrete code changes. Some AAA criteria (7:1 contrast ratio, sign language for all prerecorded content) are impractical for most projects.

> **Status — Done:**
> - ✅ Standard chosen: WCAG 2.2 Level AA
> - ✅ Four-Pronged audit plan defined: Perceivable, Operable, Understandable, Robust
> - ✅ Dependency noted: Area 09 touch target audit supports WCAG 2.5.8 compliance
> - ✅ Cross-area dependency clean — no conflict with Areas 01–10
>
> **Status — Remaining:**
> - 🔲 Run Lighthouse a11y audit — fix all identified failures
> - 🔲 Install `@axe-core/react` for dev-time automated scanning
> - 🔲 Add `jest-axe` to test pipeline
> - 🔲 Manual screen reader test with VoiceOver (Mac) / NVDA (Windows)
> - 🔲 Audit color contrast of Alchemists brand palette against AA ratios
> - 🔲 Add visible focus indicators via Tailwind `focus-visible:ring` utilities
> - 🔲 Add skip-to-content link as first focusable element
> - 🔲 Audit ARIA attributes on all custom widgets (pushy panel, carousels, mobile nav, modals)
> - 🔲 Verify heading hierarchy on all pages
> - 🔲 Write ADR-000X to formalize the WCAG 2.2 decision
> - 🔲 Document AA compliance target in project README

### 12. Assets & Media

> **Standard:** WebP/AVIF Image Format Specification
> **Authority:** WebP — Google (2010, RFC 9640). Supported in all modern browsers since 2019 (Baseline 2023). AVIF — Alliance for Open Media (2019, ISO 23000-22). Supported in all modern browsers since 2022 (Baseline 2023). Both are royalty-free open specifications with published reference encoders (`libwebp`, `libavif`).
> **Origin:** WebP was announced by Google in September 2010 as a derivative of the VP8 video codec's intra-frame encoding. The goal was to match JPEG quality at 25-35% smaller file sizes, reducing bandwidth and improving page load times on the mobile web. WebP supports lossy, lossless, and transparency (alpha channel). AVIF was developed by the Alliance for Open Media (AOMedia) — a consortium including Google, Apple, Microsoft, Mozilla, Netflix, and Amazon — as part of the AV1 video codec ecosystem. AVIF achieves 50%+ better compression than JPEG at equivalent quality, supports HDR (High Dynamic Range), wide color gamut (BT.2020), and transparency. Both formats are now Baseline 2023, meaning they are safe to use as primary image formats across all modern browsers. Legacy browsers fall back gracefully via the `<picture>` element.
> **Application to CP3 Legacy:**
> - CP3 Legacy has ~900 images in `public/alchemists/assets/` — most are JPEG (photos), PNG (graphics/transparency), and GIF (animations)
> - Batch convert all JPEG and PNG images to WebP as the primary format
> - For hero/carousel images (FeaturedCarousel, HeroUnit backgrounds), test AVIF for additional savings where quality permits
> - Use `<picture>` element with `<source type="image/webp">` and `<img>` fallback for any images not migrated to `next/image`
> - Configure `next.config.ts` with `formats: ['image/avif', 'image/webp']` so `next/image` negotiates the best format automatically
> - Document the format policy: all new images must be WebP at minimum; AVIF is optional for priority images
> **Pros:** 25-50% bandwidth reduction vs JPEG/PNG — directly improves LCP (Area 08 dependency). Supported by all modern browsers. Zero additional cost — both are royalty-free. Next.js/`next/image` handles format negotiation automatically. Reduces storage and CDN transfer costs. WebP supports transparency (replaces PNG use cases). AVIF supports HDR for future display compatibility.
> **Cons:** Batch conversion is a one-time effort (non-trivial for ~900 images). Some legacy browsers (Safari 13 and earlier, IE11) don't support WebP — requires `<picture>` fallback or `next/image` which handles this automatically. AVIF encoding is slower than WebP — may increase build times. AVIF has limited editing tool support compared to JPEG/PNG. Source files (original JPEG/PNG) must be kept for editing — adds storage overhead.

> **Status — Done:**
> - ✅ Standard chosen: WebP/AVIF Image Format Specification
> - ✅ Next.js `next/image` format negotiation ready — just needs config update
> - ✅ Cross-area dependency: supports Core Web Vitals LCP target (Area 08)
>
> **Status — Remaining:**
> - 🔲 Configure `next.config.ts` with `formats: ['image/avif', 'image/webp']`
> - 🔲 Batch convert all JPEG/PNG images in `public/alchemists/assets/` to WebP
> - 🔲 Test AVIF for hero/carousel images — verify quality at acceptable file size
> - 🔲 Update `<picture>` elements or migrate to `next/image` for automatic format negotiation
> - 🔲 Write ADR-000X to formalize the WebP/AVIF Image Format decision
> - 🔲 Document image format policy in project README

### 13. Error Handling

> **Standard:** React Error Boundary Pattern
> **Authority:** React core team (React 16.0, 2017 — `componentDidCatch` and `getDerivedStateFromError`). Extended by the Next.js team via the `error.tsx` file convention (2022, Next.js 13 App Router). The pattern is a React/Next.js methodology for catching JavaScript errors in component trees and rendering fallback UI instead of unmounting the entire tree. No external libraries required.
> **Origin:** Before React 16, a JavaScript error in any component would unmount the entire React tree, showing a blank white screen with no recovery option. Error boundaries were introduced in React 16 (September 2017) via two lifecycle methods: `componentDidCatch` (logs error details) and `getDerivedStateFromError` (updates state to render fallback UI). The pattern was formalised by Dan Abramov in a blog post announcing React 16, framing error boundaries as the React equivalent of `try/catch` for declarative rendering. Next.js 13 evolved this into the `error.tsx` file convention — a file in any route segment that automatically becomes the error boundary for that segment and its children. The files `error.tsx`, `not-found.tsx`, and `loading.tsx` form the "error and loading hierarchy" of the App Router, giving every route segment a complete failure recovery story.
> **Application to CP3 Legacy:**
> - Root `error.tsx` at `src/app/error.tsx` — catches any unhandled error across the entire app. Must be a client component with `'use client'`. Renders a branded error UI with a retry button (calls `reset()`).
> - Root `not-found.tsx` at `src/app/not-found.tsx` — custom 404 page matching the Alchemists brand. Triggered by `notFound()` call or unmatched routes.
> - Root `loading.tsx` at `src/app/loading.tsx` — shown during page transitions. Already planned in Area 05 Remaining items.
> - Component-level ErrorBoundary: wrap each of the 9 organisms (Header, MobileHeader, HeroUnit, FeaturedCarousel, FeaturedSlider, MainContent, Footer, PushyPanel, Modals) in a reusable `<ErrorBoundary>` with fallback UI specific to that widget. A carousel crash should show "Featured highlights unavailable" — not a full white page.
> - The reusable ErrorBoundary component goes in `src/components/ErrorBoundary.tsx` — accepts `fallback` prop (ReactNode) or renders a default branded error placeholder.
> **Pros:** Prevents full-page crashes — one broken widget doesn't break the entire experience. Zero-cost — no dependencies, just React and Next.js conventions. error.tsx file convention eliminates manual Error Boundary wrapping at route level. Builds directly on Area 05/06 (App Router + Layout Hierarchy). Component-level boundaries isolate third-party failures (CDN image fails, API returns unexpected shape). The reset() function lets users recover without full page reload.
> **Cons:** Error boundaries only catch errors during rendering, lifecycle methods, and constructors — they do NOT catch errors in event handlers, async code, or server components (for server components, error.tsx handles them differently). Over-wrapping creates unnecessary complexity — not every div needs an error boundary. Fallback UI design requires thought — a generic "Something went wrong" is unhelpful without context.

> **Status — Done:**
> - ✅ Standard chosen: React Error Boundary Pattern
> - ✅ Two-tier strategy defined: root error.tsx (app-wide) + component-level ErrorBoundary (per organism)
> - ✅ Cross-area dependency: builds on Area 05 (App Router Convention, ADR-0004)
>
> **Status — Remaining:**
> - 🔲 Create `src/app/error.tsx` — client component with branded error UI + retry button
> - 🔲 Create `src/app/not-found.tsx` — branded 404 page
> - 🔲 Create `src/app/loading.tsx` — branded loading state
> - 🔲 Create `src/components/ErrorBoundary.tsx` — reusable wrapper with fallback prop
> - 🔲 Wrap each of the 9 organisms in `<ErrorBoundary>` with specific fallback UI
> - 🔲 Write ADR-000X to formalize the React Error Boundary decision
> - 🔲 Document error boundary strategy in project README

### 14. Environment & Configuration

> **Standard:** Next.js Environment Variable Convention
> **Authority:** Vercel / Next.js core team. Official documentation since Next.js 6 (2018). Current spec: four file levels — `.env` (all envs), `.env.local` (local overrides, gitignored), `.env.development` (development defaults), `.env.production` (production defaults). Client-safe prefix: `NEXT_PUBLIC_`. Supported by Vercel's platform env var system and `@next/env` package.
> **Origin:** The `.env` file pattern was popularised by the dotenv npm package (2013) and adopted by Node.js core in Node 20.6 (2023, `--env-file` flag). Next.js built on this convention with a four-level hierarchy designed for the framework's dev/prod environment split. The key innovation was the `NEXT_PUBLIC_` prefix: Next.js is the first framework to make client-vs-server variable visibility part of the naming convention itself. During `next build`, variables prefixed with `NEXT_PUBLIC_` are inlined into the JavaScript bundle — making them available in browser code but permanently embedded (a rebuild is required to change them). Variables without the prefix are only available on the server, preventing accidental secret exposure. The convention is documented in Next.js's official "Configuring Environment Variables" page and is the de facto standard for all Next.js projects.
> **Application to CP3 Legacy:**
> - Create `.env.example` from current `.env.local` — replace all real values with descriptive placeholders (e.g., `SANITY_PROJECT_ID="your-sanity-project-id"`) and add a comment per variable explaining what it is and where to get it
> - Create `.env.development` — shared dev defaults (Sanity dataset name, etc.) that don't change per developer
> - Verify `.env.local` — confirm no `NEXT_PUBLIC_` prefix is used on any secret value; confirm all server-only keys lack the prefix
> - Enforce naming convention: `*_TOKEN` for API tokens, `*_KEY` for API keys, `*_SECRET` for secrets. All sensitive vars get Vercel's "Secret" type in production.
> - Document the file hierarchy in project README: which file loads in which environment, and the precedence order (.env.local overrides .env.development)
> **Pros:** Official Next.js convention — guaranteed compatibility. Four-level hierarchy covers every use case (shared defaults, local overrides, env-specific values). `NEXT_PUBLIC_` convention prevents accidental secret exposure by making visibility explicit in the variable name. Zero-cost — no dependencies. Works with Vercel's env var system natively. Already partially in use — just needs formalization.
> **Cons:** Build-time inlining of `NEXT_PUBLIC_*` means changing them requires a rebuild — not suitable for runtime toggles. No built-in validation that required vars are present at build time (can be added via `zod` or custom check in `next.config.ts`). File precedence is implicit — easy to accidentally override a variable in the wrong file.

> **Status — Done:**
> - ✅ Standard chosen: Next.js Environment Variable Convention
> - ✅ `.env.local` exists with all current env vars
> - ✅ Cross-area dependency: builds on Area 01 (Twelve-Factor Factor III — Config in Environment)
>
> **Status — Remaining:**
> - 🔲 Create `.env.example` from `.env.local` with placeholders and descriptions
> - 🔲 Create `.env.development` with shared dev defaults
> - 🔲 Audit `.env.local` — verify `NEXT_PUBLIC_` prefix correctness for each var
> - 🔲 Audit naming convention: `*_TOKEN`/`*_KEY`/`*_SECRET` for sensitive vars
> - 🔲 Write ADR-000X to formalize the Next.js Environment Variable Convention decision
> - 🔲 Document env file hierarchy and precedence in project README

### 15. Version Control Conventions

> **Standard:** Conventional Commits Specification (v1.0.0)
> **Authority:** Angular team (2014, commit convention origin). Formalised as Conventional Commits v1.0.0 by the open source community (2018). Adopted by Angular, Ember, Electron, Chromium, Node.js, and most npm/packagist/crates packages. Endorsed by SemVer.org as the recommended commit format for automated versioning.
> **Origin:** In 2014, the Angular team (Igor Minar, Jeff Cross, Minko Gechev) published a commit message convention to standardise their repository and enable automatic changelog generation. The format — `type(scope): description` — was quickly adopted by the broader community, refined into the Conventional Commits spec, and formalised at conventionalcommits.org in 2018. The specification defines a set of commit types (`feat:`, `fix:`, `BREAKING CHANGE:`, and 10+ optional types) with structured footers (`BREAKING CHANGE:`, `Co-authored-by:`, `Refs:`) for machine-readable metadata. Its key innovation was bridging commit messages to Semantic Versioning: `fix:` → PATCH bump, `feat:` → MINOR bump, `BREAKING CHANGE:` → MAJOR bump. This enabled the rise of automated release tooling (semantic-release, standard-version, changesets) that eliminates manual version bumping.
> **Application to CP3 Legacy:**
> - Adopt the base format: `type(scope): description` — e.g., `feat(seo): add robots.ts and sitemap.ts`, `fix(nav): resolve icons-basket.svg 404`, `chore(deps): update next.js to 16.x`
> - Adopt the 7 core types: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`
> - Enforce via pre-commit hook: install `husky` + `@commitlint/cli` + `@commitlint/config-conventional` — reject non-conforming commit messages before they're written
> - Document the type list, format, and examples in project README
> - Future: integrate with `standard-version` or `semantic-release` for auto-generated changelog and version bumps
> **Pros:** Zero-cost — just a message format. Enables automatic changelog generation. Bridges to SemVer for automated release tooling. Makes commit history scannable — `git log --oneline` shows feature vs fix vs chore at a glance. Widely recognised — any new contributor knows the format. Commits are machine-readable — can be parsed for release notes, changelogs, and metrics.
> **Cons:** Requires discipline — every commit must follow the format; pre-commit hook enforces this but early commits will be rejected during learning curve. Scope field is ambiguous — inconsistent scopes (e.g., `seo` vs `seo-fix`) make the log less useful. Some teams over-complicate with too many types — sticking to 7 core types prevents this.

> **Status — Done:**
> - ✅ Standard chosen: Conventional Commits v1.0.0
> - ✅ Core types defined: feat, fix, chore, docs, refactor, style, test
> - ✅ Format documented: `type(scope): description`
> - ✅ Cross-area dependency clean — no overlap with Areas 01–14
>
> **Status — Remaining:**
> - 🔲 Install `husky` + `@commitlint/cli` + `@commitlint/config-conventional`
> - 🔲 Configure commit-msg hook to enforce Conventional Commits
> - 🔲 Document commit format, types, and examples in project README
> - 🔲 (Future) Add `standard-version` or `semantic-release` for automated changelog
> - 🔲 Write ADR-000X to formalize the Conventional Commits decision

### 16. Development Workflow

> **Standard:** ESLint + TypeScript Static Analysis
> **Authority:** ESLint — Nicholas C. Zakas (2013). TypeScript ESLint — the TypeScript team (2019+). ESLint is the de facto JavaScript linter with 50M+ weekly npm downloads. TypeScript ESLint is the official TypeScript integration. Adopted by Next.js (built-in ESLint config), React, Vue, Angular, and every major framework as the standard static analysis toolchain.
> **Origin:** ESLint was created in 2013 by Nicholas C. Zakas after recognising that JSLint and JSHint's monolithic rule sets couldn't be extended. ESLint's plugin architecture allowed custom rules, parsers, and configuration presets — this flexibility made it the dominant linter. When TypeScript gained mainstream adoption (2017+), the TypeScript team created `@typescript-eslint` to provide TypeScript-aware linting rules that catch logic bugs invisible to plain JavaScript linting. Unlike `tsc --noEmit` which only checks type correctness, TypeScript ESLint rules enforce code quality conventions: no-unused-vars catches dead code, no-explicit-any prevents accidental type escape, strict-boolean-expressions prevents truthiness bugs. Together, `tsc` (type correctness) + `eslint` (code quality) form the dual-layer static analysis standard for TypeScript projects.
> **Application to CP3 Legacy:**
> - Audit `eslint.config.mjs` — verify `@typescript-eslint` plugin is installed and configured (Next.js ships with a minimal config that may lack TypeScript-specific rules)
> - Add key `@typescript-eslint` rules: `no-unused-vars`, `no-explicit-any` (warn), `no-floating-promises`, `strict-boolean-expressions`
> - Verify `tsconfig.json` has `strict: true` — if not, enable it and fix surfaced errors
> - Add `npm run lint` script to CI (GitHub Actions) if CI pipeline exists
> - Run `npx tsc --noEmit` as a separate CI check (catches type errors that ESLint doesn't)
> **Pros:** Catches bugs at build time that would otherwise surface at runtime. Dual-layer (tsc for types + ESLint for quality) catches different error classes. Zero-cost — ESLint is already installed. TypeScript ESLint rules are proven — no-unused-vars alone prevents countless maintenance bugs. Works with pre-commit hooks (Husky, Area 16) and CI to enforce before merge.
> **Cons:** Strict TypeScript ESLint rules can be noisy on existing codebases — requires incremental adoption (start with warnings). Some rules (no-explicit-any) are hard to adopt on legacy code without widespread `any` usage. ESLint config format changed from `.eslintrc` (JSON) to `eslint.config.mjs` (flat config) in ESLint v9 — must use flat config for Next.js 16 compatibility.

> **Status — Done:**
> - ✅ Standard chosen: ESLint + TypeScript Static Analysis
> - ✅ Dual-layer strategy defined: `tsc --noEmit` (type correctness) + `eslint` (code quality)
> - ✅ Cross-area dependency clean — no overlap with Areas 01–15
>
> **Status — Remaining:**
> - 🔲 Audit `eslint.config.mjs` — verify @typescript-eslint plugin is installed
> - 🔲 Add TypeScript ESLint rules (no-unused-vars, no-explicit-any, no-floating-promises, strict-boolean-expressions)
> - 🔲 Verify `tsconfig.json` has `strict: true` — enable if missing
> - 🔲 Run `npm run lint` and `npx tsc --noEmit` — fix all errors
> - 🔲 Add lint + tsc check to CI (GitHub Actions)
> - 🔲 Write ADR-000X to formalize the ESLint + TypeScript Static Analysis decision

### 17. Testing

> **Standard:** Test Pyramid Methodology (Unit → Integration → E2E)
> **Authority:** Mike Cohn (2009, "Succeeding with Agile" book). Popularised by Martin Fowler (2012, "TestPyramid" article on martinfowler.com). Google Testing Blog (2015, "Just Say No to More End-to-End Tests"). The pyramid model is the universally accepted strategy for test distribution across layers. Viktor Clerc (Software Improvement Group) formalised the ratio as a metrics standard: 60% unit, 20% integration, 10% E2E, 10% manual.
> **Origin:** Mike Cohn introduced the Test Pyramid in "Succeeding with Agile" (2009) as a visual metaphor for test automation strategy. The pyramid has three layers: the wide base (unit tests) represents fast, isolated, cheap tests that cover individual functions and components; the middle (integration/service tests) covers interactions between components and external services; the narrow top (E2E/UI tests) covers full user journeys through the system. The width of each layer represents the recommended number of tests, not their importance. Martin Fowler's 2012 article cemented the pyramid as the default mental model for test strategy, emphasising that E2E tests are slow, brittle, and expensive — you want as few as necessary, not as many as possible. Google's testing blog refined the model by adding a "product area" dimension (what features need what kind of testing) and recommending a "test size" categorization (small/medium/large) instead of strict layer labels.
> **Application to CP3 Legacy:**
> - **Unit tests (Vitest + Testing Library):** Test all 30 atoms (button, badge, avatar, separator, skeleton, switch, etc.) — renders with default props, renders with custom props, matches snapshot. Test utility functions and data helpers in `src/lib/`. Target: 20-30 unit tests.
> - **Integration tests (Vitest + Testing Library + MSW):** Test the 9 organisms (HeroUnit, FeaturedCarousel, FeaturedSlider, Header, MobileHeader, Footer, PushyPanel, MainContent, Modals) — renders with mocked data, handles error state, handles empty state, error boundary catches render crashes. Target: 5-10 integration tests.
> - **E2E tests (Playwright):** Test critical user journeys — homepage loads with expected content, mobile nav opens/closes, carousel navigates, featured content section renders, sub-page navigation works. Target: 3-5 E2E tests.
> - **Coverage thresholds:** Set minimums in `vitest.config.ts`: 70% statements, 60% branches, 70% functions, 70% lines. These are realistic targets for a project in progress.
> **Pros:** The only proven strategy for test distribution — every major tech company uses some form of the pyramid. Prevents the common anti-pattern of writing only E2E tests (slow, brittle) or only unit tests (no integration confidence). The ratio guidance (many unit, some integration, few E2E) is actionable and intuitive. Zero-cost — just a strategy, no tools required.
> **Cons:** The pyramid is a guideline, not a rule — different features need different distributions (a page with complex data fetching may need more integration tests). Getting the ratio "right" requires experience. Some tests don't fit neatly into one layer (e.g., a component test that renders multiple interacting components is both unit and integration). The metaphor breaks down when you add other test types (performance, security, accessibility).

> **Status — Done:**
> - ✅ Standard chosen: Test Pyramid Methodology
> - ✅ Three layers defined: Unit (Vitest + RTL), Integration (Vitest + RTL + MSW), E2E (Playwright)
> - ✅ Coverage thresholds set: 70% stmts, 60% branch, 70% func, 70% line
> - ✅ Cross-area dependency: component tests support Area 13 (Error Boundaries), E2E supports all areas
>
> **Status — Remaining:**
> - 🔲 Configure Vitest with React Testing Library in `vitest.config.ts`
> - 🔲 Write unit tests for all 30 atoms (renders, custom props, edge cases)
> - 🔲 Write integration tests for 9 organisms (render, error, empty, error boundary)
> - 🔲 Write 3-5 Playwright E2E tests for critical user journeys
> - 🔲 Configure coverage thresholds in `vitest.config.ts`
> - 🔲 Add `npm test` to CI gating (failed tests block merge)
> - 🔲 Write ADR-000X to formalize the Test Pyramid decision

### 18. Deployment & DevOps

> **Standard:** Vercel Git-Based Auto-Deployment
> **Authority:** Vercel (2016+). The platform specification for Git-integrated deployments: connect a Git repository, set the production branch (main), and every push triggers an automatic build and deploy. Preview deployments are created for every non-main branch and PR. Adopted by Netlify, Cloudflare Pages, Render, and Railway as the standard modern deployment model. Vercel's free tier includes auto-deploy, SSL, CDN, and preview URLs.
> **Origin:** Before Git-based auto-deployment, deploying a web app meant SSH'ing into a server, pulling changes, and restarting a process manager — or pushing to a remote Git repo and manually triggering a build via a CI dashboard. Vercel (originally ZEIT Now, 2016) pioneered the model of connecting a Git repository directly to the deployment platform: every push to a branch triggers a build, every push to main triggers a production deploy, and every PR gets its own unique preview URL. This eliminated the gap between "code is ready" and "code is live." The model was quickly adopted by Netlify, Cloudflare Pages, and Render, making Git-based auto-deployment the default deployment pattern for modern web applications. For CP3 Legacy, this means production is always in sync with `main` without any manual steps.
> **Application to CP3 Legacy:**
> - Connect the Git repo (`cp-legacy-frontend`) to Vercel via Vercel dashboard (Import Git Repository)
> - Set root directory to `/` — Vercel auto-detects Next.js and sets the build command to `next build`
> - Configure Environment Variables in Vercel dashboard — add all vars from `.env.local`. Mark sensitive ones (Sanity tokens, Groq keys) as "Secret" type
> - Set `main` as the Production Branch — every push to main triggers a production deploy to `cp-legacy-frontend.vercel.app`
> - Preview Deployments: every branch and PR gets a unique URL — enables testing SEO metadata (Area 07), a11y (Area 11), layout changes (Area 06) before merging to main
> - Remove manual deploy scripts — no more `vercel deploy` commands. Delete or archive any shell scripts that do manual deployment
> - Verify the first auto-deploy: push a trivial commit to main, verify the production URL updates automatically
> **Pros:** Zero-effort — connect Git repo, Vercel handles the rest. Preview deployments per branch enable testing before merge. Instant rollback (one click to any previous deploy). Built-in SSL, CDN, and edge network. Free tier covers CP3 Legacy's traffic. No CI/CD pipeline to maintain for basic builds. Production is always exactly what's on `main` — no drift, no manual deploy mistakes.
> **Cons:** Tied to Vercel — migrating to another platform means configuring a new deployment pipeline. Build time counts against Vercel's free tier limits (6000 build minutes/month on Pro, 100 on free). Preview deploys for every branch can fill the deployment list quickly. No built-in approval workflow (any push to main deploys immediately — requires branch protection + CI gating to prevent bad deploys).

> **Status — Done:**
> - ✅ Standard chosen: Vercel Git-Based Auto-Deployment
> - ✅ Git repo ready for Vercel connection
> - ✅ Env vars documented in `.env.example` (Area 14 Remaining — once created, ready for Vercel import)
> - ✅ Cross-area dependency: builds on Area 01 (Twelve-Factor Factor V — Build/Release/Run separation)
>
> **Status — Remaining:**
> - 🔲 Connect Git repo to Vercel dashboard (Import Git Repository)
> - 🔲 Configure Environment Variables in Vercel — all vars from `.env.local`
> - 🔲 Set Production Branch to `main`
> - 🔲 Verify first auto-deploy — push to main, confirm production URL updates
> - 🔲 Remove manual deploy scripts
> - 🔲 Write ADR-000X to formalize the Vercel Auto-Deployment decision
> - 🔲 Document deployment workflow in project README

### 19. Monitoring & Observability

> **Standard:** Vercel Analytics & Speed Insights
> **Authority:** Vercel Platform feature (2022+). Web Analytics provides page views, visitor stats, and top pages — no code changes, no extra JavaScript bundle. Speed Insights provides real-user Core Web Vitals (LCP, CLS, INP, TTFB) collected from actual visitors via the Performance API. Both are included in all Vercel tiers (Hobby, Pro, Enterprise) at no additional cost.
> **Origin:** Web analytics historically required third-party scripts (GA4, Mixpanel) that added JavaScript bundle weight, slowed page loads, and required cookie consent banners. Vercel's Web Analytics (2022) eliminated this by collecting data at the edge/CDN level — no client-side JavaScript needed. Speed Insights followed shortly after, providing real-user Core Web Vitals data from actual browser Performance API measurements. This approach solves two problems: it doesn't bloat the client bundle (no `gtag.js` or similar scripts), and it doesn't trigger GDPR cookie consent requirements since no personal data is collected. The trade-off is less granular data than GA4 (no custom events, no user session replay) — but for a demo/personal project like CP3 Legacy, page views + CWV data is sufficient.
> **Application to CP3 Legacy:**
> - Enable Web Analytics in Vercel Dashboard: Project → Analytics → Enable. Zero code changes. Appears under `your-url.vercel.app/_vercel/insights`.
> - Enable Speed Insights in Vercel Dashboard: Project → Speed Insights → Enable. Starts collecting real-user CWV data immediately.
> - Verify: visit production URL, confirm analytics data appears in Vercel dashboard within minutes.
> - No cookie banner needed — Vercel Analytics does not use cookies or collect personal data.
> - Use Speed Insights data to validate Area 08 (Core Web Vitals) targets — if real-user LCP > 2.5s, the optimization work (image formats, font loading) needs priority.
> **Pros:** Zero-config — toggle on in Vercel dashboard, no code changes. Zero bundle cost — no JavaScript loaded on the client. No GDPR/compliance overhead — no cookies, no personal data. Direct CWV measurement for Area 08 validation. Free on all Vercel tiers. No maintenance.
> **Cons:** Limited data — page views only (no custom events, no user sessions, no conversion tracking). Cannot track authenticated user behavior. No alerting built in — you must visit the dashboard to see data. Data is aggregated — no individual visitor tracking for debugging. Vercel dependency — if you migrate off Vercel, you lose this data.

> **Status — Done:**
> - ✅ Standard chosen: Vercel Analytics & Speed Insights
> - ✅ Confirmed: included in Vercel Hobby (free) tier
> - ✅ Cross-area dependency: directly supports Area 08 (Core Web Vitals) validation
>
> **Status — Remaining:**
> - 🔲 Enable Web Analytics in Vercel Dashboard
> - 🔲 Enable Speed Insights in Vercel Dashboard
> - 🔲 Verify data appears after first production visit
> - 🔲 Document analytics dashboard location in project README
> - 🔲 Write ADR-000X to formalize the Vercel Analytics decision

### 20. Legal & Compliance

> **Standard:** Privacy Policy (GDPR-Compliant)
> **Authority:** General Data Protection Regulation (EU, 2018, Regulation 2016/679). Articles 12-14 (transparency), Article 5 (lawfulness, fairness, transparency), Article 32 (security). California Consumer Privacy Act (CCPA, 2020, Cal. Civ. Code §1798.100). Nigerian Data Protection Regulation (NDPR, 2019, NITDA). The GDPR is the de facto global standard for privacy policy structure; most other privacy laws (CCPA, NDPR, PIPEDA, LGPD) follow a similar disclosure framework.
> **Origin:** The modern privacy policy standard was shaped by the EU's GDPR, which took effect in May 2018 after four years of preparation. Before GDPR, privacy policies were often dense legal documents buried in site footers that few users read. GDPR Article 12 changed this by requiring that privacy information be "concise, transparent, intelligible, and easily accessible, using clear and plain language." This shifted privacy policies from legal boilerplate to user-facing documents that must answer: who you are, what data you collect, why you collect it, who you share it with, how long you keep it, and what rights users have. CCPA (2020) added a "Do Not Sell My Personal Information" requirement. NDPR (Nigeria, 2019) largely mirrors GDPR, adding a Data Protection Compliance Organization (DPCO) registration requirement for entities that process the personal data of more than 2,000 data subjects in a year.
> **Application to CP3 Legacy:**
> - Create a privacy policy page at `src/app/privacy/page.tsx`
> - Disclose: Vercel Analytics collects anonymized page view and Core Web Vitals data (no cookies, no personal data — exempt from cookie consent under GDPR Recital 30 and ePrivacy Directive)
> - Disclose: no personal data is collected directly (no accounts, no forms, no comments). If a contact form or newsletter is added, update the policy.
> - Disclose: no third-party data sharing (Vercel hosts analytics; Sanity CMS if re-integrated stores content, not user data)
> - Document user rights: data access, deletion, portability requests (unlikely needed since no personal data is stored, but the policy must state the process)
> - Link privacy policy in the footer (visible on every page)
> - No cookie consent banner needed — Vercel Analytics is cookie-free. Document this exemption.
> **Pros:** Legal compliance — GDPR, CCPA, and NDPR requirements are satisfied. No personal data means minimal disclosure burden. Vercel Analytics' cookie-free model avoids the need for a cookie consent banner. Zero-cost — standard policy template adapted for a demo/personal site. Builds trust with visitors. Links from footer are an SEO best practice (Area 07).
> **Cons:** Privacy policy must be updated if contact forms, user accounts, or third-party scripts are added — easy to forget. Legal language requires care — ambiguous wording can create liability. Nigerian NDPR has specific registration requirements if data subjects exceed 2,000 — unlikely for a demo site but worth noting.

> **Status — Done:**
> - ✅ Standard chosen: Privacy Policy (GDPR-Compliant)
> - ✅ Vercel Analytics confirmed cookie-free — no consent banner needed
> - ✅ Cross-area dependency: covers Area 19 (Vercel Analytics) disclosures
>
> **Status — Remaining:**
> - 🔲 Create `src/app/privacy/page.tsx` with GDPR-compliant privacy policy
> - 🔲 Add privacy policy link to footer navigation
> - 🔲 (If contact form added) update privacy policy
> - 🔲 Write ADR-000X to formalize the Privacy Policy decision

### 21. Documentation

> **Standard:** Standard Readme Specification
> **Authority:** Standard Readme (Zeke Sikelianos, 2017, standard-readme.org). The specification defines the minimum required sections for a `README.md` (Title, Description, Install, Usage, API, License) and the format conventions (headers, code blocks, badges, links). Adopted by npm, GitHub's open source guide, and thousands of open source projects. The standard is OSI-approved and referenced by Node.js ecosystem documentation guidelines.
> **Origin:** Before Standard Readme, README files had no consistent structure. Every project had different section headings, different levels of detail, and different formats. This made it hard for developers to quickly evaluate or use a project — the "how to install" section might be in any location under any heading. Zeke Sikelianos published Standard Readme in 2017 as an RFC-style specification that projects could optionally adopt. It introduced a predictable structure: header with title + badges, then Description, Install, Usage, API, Contributing, License. The standard also specified Markdown conventions (ATX headers, fenced code blocks with language tags, reference-style links). By 2020, the structure was widely adopted even by projects that didn't explicitly follow the spec, making it the de facto standard README structure.
> **Application to CP3 Legacy:**
> - Create `README.md` at project root following the Standard Readme specification
> - Required sections: Title ("CP3 Legacy"), Description ("Next.js 16 Chris Paul career tracker — 41 documented standards"), Install (`npm install && cp .env.example .env.local`), Usage (`npm run dev`, `npm run build`, `npm run lint`), API (none yet — placeholder for Sanity CMS integration), Contributing (link to `CONTRIBUTING.md`), License (MIT)
> - Optional sections: Badges (Vercel deploy status, TypeScript version, WCAG compliance), Standards Progress (link to `active-areas.md` with count: 20/41 documented), ADRs (link to `docs/adr/`)
> - Add status badges: build passing (Vercel), license (MIT), standards documented (20/41)
> **Pros:** Zero-cost — just a Markdown file. Predictable structure — any developer knows where to find install instructions. Badges communicate project health at a glance. Links to all other documentation (active-areas.md, ADRs, contributing guide). Makes the project portfolio-ready — essential for Victor's hire-me funnel goal. Easily updated as areas are completed.
> **Cons:** README must be maintained — outdated instructions are worse than no instructions. Badges can break if services change URLs. Some projects over-load the README with badges and diagrams — keeping it focused on the sections above prevents bloat.

> **Status — Done:**
> - ✅ Standard chosen: Standard Readme Specification
> - ✅ Sections identified: Title, Description, Install, Usage, Contributing, License
> - ✅ Cross-area dependency clean — README references all other areas
>
> **Status — Remaining:**
> - 🔲 Create `README.md` following Standard Readme specification
> - 🔲 Add status badges (Vercel deploy, TypeScript, license)
> - 🔲 Link to `active-areas.md` with standards progress counter
> - 🔲 Link to `docs/adr/` directory
> - 🔲 Link to `CONTRIBUTING.md` (future)
> - 🔲 Write ADR-000X to formalize the Standard Readme decision

### 22. Naming Conventions

> **Standard:** React Component PascalCase Convention
> **Authority:** React core team (2013, JSX spec). Enforced by ESLint (`react/jsx-pascal-case` rule). Universal JavaScript/TypeScript naming standard: JSX requires component names to start with an uppercase letter to distinguish them from native HTML elements. This is not a stylistic preference — JSX treats lowercase tags as HTML elements (`<div>`, `<span>`) and uppercase tags as React components (`<HeroUnit>`, `<ErrorBoundary>`).
> **Origin:** The PascalCase requirement for React components is baked into JSX's grammar. When JSX was created (Facebook, 2013), the team needed a way to differentiate between HTML elements and React components in JSX templates. They chose a simple rule: HTML elements are lowercase (`<div>`, `<p>`), and React components are PascalCase (`<MyComponent>`). This rule is enforced by the JSX parser itself — writing `<heroUnit>` would treat it as an HTML element, not a React component. The convention extends to file names: component files are PascalCase with a `.tsx` extension. This is the most widely followed naming convention in the React ecosystem because it's enforced by the runtime, not just a style guide.
> **Application to CP3 Legacy:**
> - Enable ESLint rule `react/jsx-pascal-case` (set to `"error"`) — catches any JSX where a component name is not PascalCase
> - Audit `src/components/` — verify all component files use PascalCase (e.g., `HeroUnit.tsx`, `FeaturedCarousel.tsx`, `ErrorBoundary.tsx`)
> - shadcn/ui components in `src/components/ui/` use kebab-case by convention (`button.tsx`, `card.tsx`, `badge.tsx`) — leave these as-is; they are primitives, not app components
> - Non-component files (data, utilities, config) use kebab-case: `data.json`, `layout.tsx`, `page.tsx`, `tailwind.config.ts`
> - Document the convention in README: "App components → PascalCase, shadcn/ui → kebab-case, data/utility files → kebab-case"
> **Pros:** Enforced by JSX parser — not optional, not stylistic. ESLint catches violations at build time. Distinguishes components from HTML at a glance in templates. Compatible with shadcn/ui's kebab-case convention (no conflict). Universal standard — every React developer recognises PascalCase components. Already followed for all custom components — just needs documentation.
> **Cons:** Some teams prefer kebab-case file names with PascalCase component names (e.g., `hero-unit.tsx` exports `HeroUnit`). CP3 Legacy uses PascalCase for both file and component name — consistent but not the only valid approach. shadcn/ui's kebab-case convention creates a permanent exception to the rule that must be documented.

> **Status — Done:**
> - ✅ Standard chosen: React Component PascalCase Convention
> - ✅ shadcn/ui exception defined: primitives keep kebab-case
> - ✅ Cross-area dependency: ESLint (Area 16) enforces via `react/jsx-pascal-case`
>
> **Status — Remaining:**
> - 🔲 Enable ESLint rule `react/jsx-pascal-case` (error)
> - 🔲 Audit `src/components/` — rename any non-PascalCase files
> - 🔲 Document naming convention in README
> - 🔲 Write ADR-000X to formalize the PascalCase Convention decision

### 23. Animation & Interactions

> **Standard:** CSS Transitions & Animations (W3C Specification)
> **Authority:** W3C CSS Transitions Level 1 (2018, Working Draft). W3C CSS Animations Level 1 (2018, WD). Both are Baseline 2023 — supported in all modern browsers. Tailwind CSS utilities (`transition-*`, `duration-*`, `ease-*`, `animate-*`, `hover:`, `focus:`, `active:`) compile to standard CSS transitions and animations defined in these specs.
> **Origin:** CSS Transitions were first proposed by Apple in 2005 as part of WebKit and became a W3C Working Draft in 2009. They provided a declarative way to animate property changes — `transition: opacity 200ms ease` — without JavaScript. CSS Animations followed in 2007 (WebKit) and became a W3C draft in 2009, adding `@keyframes` for multi-step, looping, and sequenced animations. Before these standards, web animations required JavaScript timers (setInterval), Flash, or GIFs. The CSS animation standards made animations a first-class browser primitive — GPU-accelerated, compositor-thread driven, and controllable via CSS alone. Tailwind provides utility classes (`transition-all`, `duration-200`, `animate-spin`, `hover:scale-105`) that compile to their corresponding CSS properties, making the standard accessible without writing raw CSS.
> **Application to CP3 Legacy:**
> - **Default timing:** micro-interactions (hover, focus, active) → `duration-200 ease-in-out`. Tailwind: `transition-all duration-200 ease-in-out`
> - **Menu/nav animations:** slide-in/out → `duration-300 ease-in-out` using `transform: translateX()`. Tailwind: `transition-transform duration-300 ease-in-out`
> - **Carousel transitions:** slide changes → `duration-500 ease-in-out` on the slide track. Tailwind: `transition-transform duration-500 ease-in-out`
> - **GPU-composited rule:** use `transition-transform` and `transition-opacity` only — never animate `width`, `height`, `top`, `left`, `margin`, `padding`. Tailwind: `transition-transform` (not `transition-all`)
> - **Reduced motion:** wrap all animations in `@media (prefers-reduced-motion: no-preference)`. Tailwind: install `tailwindcss-prefers-reduced-motion` plugin or use `motion-safe:` variant (`motion-safe:transition-all` starts at Tailwind v3.3+)
> - **Page transitions (future):** use `template.tsx` entry/exit animations via CSS `@keyframes fadeIn`/`fadeOut`. Tailwind: `animate-fade-in` custom utility
> **Pros:** Zero-cost — already available via Tailwind, no additional dependencies. 60fps when using `transform` + `opacity`. Declarative — states in HTML/class, not JavaScript. `prefers-reduced-motion` support is standard. Tailwind utilities make the standard accessible without writing raw CSS. Works with all modern browsers. No bundle size impact.
> **Cons:** CSS-only animations can't do spring physics, gesture-based (drag/swipe), or timeline sequencing — for those, Framer Motion is needed. `transition-all` is a performance anti-pattern if it includes layout properties. `@keyframes` in Tailwind requires custom CSS or a plugin. Page transitions require `template.tsx` coordination.

> **Status — Done:**
> - ✅ Standard chosen: CSS Transitions & Animations (W3C)
> - ✅ Tailwind implementation: `transition-*`, `duration-*`, `ease-*`, `motion-safe:` variants
> - ✅ Timing rules defined: 200ms (micro), 300ms (nav), 500ms (carousel)
> - ✅ Cross-area dependency: respects `prefers-reduced-motion` (Area 11), GPU-composited rule from Area 23 option 3
>
> **Status — Remaining:**
> - 🔲 Audit existing animations — replace any layout-triggering properties with `transform`/`opacity`
> - 🔲 Add `motion-safe:` variant to all interactive animations for reduced motion support
> - 🔲 Audit mobile nav slide-in — verify it uses `transform: translateX()`, not `left`/`right`
> - 🔲 Document animation timing rules in project README
> - 🔲 Write ADR-000X to formalize the CSS Animations decision

### 24. Notifications & Feedback

> **Standard:** Toast Notification Pattern (Sonner — shadcn/ui Standard)
> **Authority:** Sonner (Emil Kowalski, 2020). Adopted by shadcn/ui as the default toast library. Used in production by Vercel, Clerk, Auth.js, and the Next.js ecosystem. The pattern: non-blocking, auto-dismissing, corner-positioned toast notifications with type variants (success, error, info, loading).
> **Origin:** Before dedicated toast libraries, web apps used ad-hoc notification patterns — alert() dialogs, custom DOM elements, or CSS-animated banners. Sonner was created by Emil Kowalski (shadcn/ui maintainer) in 2020 to solve specific problems: toasts should not block user interaction, they should stack without overlapping, they should auto-dismiss with configurable timing, and they should support different types (success/error/loading/info) with distinct visual treatment. Sonner was adopted into shadcn/ui as the default toast component, making it the de facto standard for shadcn/ui projects. Its key features: zero-config setup (`<Toaster />` in root), promise-based `toast.promise()` for async feedback, swipe-to-dismiss on mobile, and keyboard navigation.
> **Application to CP3 Legacy:**
> - Sonner is already installed (`sonner` in `package.json`, `@radix-ui/react-toast` would be the alternative — but Sonner is the shadcn/ui standard)
> - Root layout already has `<Toaster position="bottom-right" />` configured in `src/app/layout.tsx`
> - Usage convention: `toast.success("Data refreshed")` for success, `toast.error("Failed to load")` for errors, `toast.info("New content available")` for info, `toast.loading("Updating...")` with `toast.dismiss()` for loading
> - Duration convention: 4000ms for success/info (default), 6000ms for errors (uses `duration: 6000` option), manual dismiss for loading (persists until `toast.dismiss()` or `toast.error/success()` called)
> - Integration with Area 13 (Error Boundaries): error.tsx can call `toast.error()` on reset or on catch, but error.tsx's retry button handles recovery — toast is supplementary feedback
> **Pros:** Already installed and configured — zero additional setup. shadcn/ui standard — aligns with the rest of the UI library. No JavaScript configuration needed — `<Toaster />` works out of the box. Type-safe API with TypeScript types included. Supports swipe-to-dismiss on mobile (Area 09 dependency). Stacked toasts don't overlap. `toast.promise()` method enables clean async feedback pattern.
> **Cons:** Limited customization without CSS — changing toast appearance requires overriding Sonner's CSS variables. Only supports corner positions — no center or inline toast variant. Sonner's auto-dismiss can be too fast for error messages that require user action (mitigated by 6000ms duration for errors). No built-in undo action (must implement manually).

> **Status — Done:**
> - ✅ Standard chosen: Toast Notification Pattern (Sonner)
> - ✅ Already installed: `sonner` in package.json, `<Toaster />` in root layout
> - ✅ Duration convention defined: 4000ms (success/info), 6000ms (error), manual (loading)
> - ✅ Cross-area dependency clean — no conflicts with Areas 01–23
>
> **Status — Remaining:**
> - 🔲 Document toast usage convention (position, duration, variants) in project README
> - 🔲 Verify `<Toaster />` config in root layout — confirm position and duration defaults
> - 🔲 (Future) Wire error boundaries to toast.error() on error catch
> - 🔲 Write ADR-000X to formalize the Sonner Toast decision

### 25. Forms & Validation

> **Standard:** React Hook Form — Uncontrolled Form Methodology *(Future Use — no forms currently exist)*
> **Authority:** React Hook Form (Beier Luo, 2019). Adopted by shadcn/ui as the default form library. 35M+ weekly npm downloads. The methodology: uncontrolled inputs (ref-based) minimize re-renders, `resolver` pattern integrates Zod validation, `FormProvider` shares form context across deep component trees.
> **Origin:** Before React Hook Form, React forms were controlled (every keystroke updated state and re-rendered). React Hook Form introduced a ref-based approach where inputs register themselves via `{...register("field")}`, storing values in a DOM ref instead of React state. This eliminated re-renders on every keystroke — the form only re-renders on submit or validation, regardless of how many fields it has. The library was adopted by shadcn/ui as the form foundation, and `@hookform/resolvers` added Zod integration.
> **Application to CP3 Legacy (future):** When forms are added (contact page, newsletter signup, admin panel):
> - Install `react-hook-form`, `@hookform/resolvers`, `zod`
> - Run `npx shadcn@latest add form` to add shadcn/ui Form components
> - Define Zod schema for each form → React Hook Form via `zodResolver`
> - Use `<FormField>` pattern for accessible, styled fields
> - Dual-layer validation: Zod on client (UX) + server (security)
> **Pros:** Victor's established stack (used in athletica). shadcn/ui standard. Uncontrolled = performant. Zod type inference eliminates type mismatches. FormMessage handles a11y error display (Area 11).
> **Cons:** Not needed today — added bundle weight for zero forms. Controlled forms may be simpler for single-field forms. Learning curve for resolver pattern.

> **Status — Done:**
> - ✅ Standard chosen: React Hook Form (uncontrolled methodology)
> - ✅ Future use — no action items until forms are needed
> - ✅ Stack defined: react-hook-form + zod + @hookform/resolvers + shadcn/ui Form
> - ✅ Cross-area dependency: shadcn/ui Form (Area 03), WCAG error display (Area 11)
>
> **Status — Remaining:**
> - 🔲 Install packages when first form is added: `react-hook-form`, `zod`, `@hookform/resolvers`
> - 🔲 Run `npx shadcn@latest add form` 
> - 🔲 Write ADR-000X to formalize the React Hook Form decision

### 26. Internationalization (i18n)

> **Standard:** ECMAScript Intl API (Native Browser Standard)
> **Authority:** ECMA International (ECMA-402 — ECMAScript Internationalization API, 2012, updated annually). The standard for locale-aware formatting of dates, times, numbers, currencies, lists, and relative time. `Intl.DateTimeFormat` (ES 2012), `Intl.NumberFormat` (ES 2012), `Intl.RelativeTimeFormat` (ES 2020), `Intl.ListFormat` (ES 2021). All Baseline 2023+ — supported in every modern browser without polyfills. No library needed.
> **Origin:** Before ECMA-402, JavaScript had no standard way to format dates, numbers, or currencies per locale. Developers used ad-hoc approaches: manual string concatenation, moment.js, or server-side formatting. ECMA-402 was first published in 2012 and added `Intl.DateTimeFormat` and `Intl.NumberFormat` to the JavaScript language. These APIs use the Unicode CLDR (Common Locale Data Repository) database, which defines locale-specific patterns for thousands of locales. The Intl API solved the core problem of localization at the language level — no library import, no build step, just `new Intl.DateTimeFormat('en-US')`. This is the native, zero-dependency approach: the browser ships with locale data for every locale.
> **Application to CP3 Legacy:**
> - CP3 Legacy is English-only (Chris Paul content, NBA audience). No multi-language translation needed. The Intl API handles formatting only — not translation.
> - Audit current date/number formatting in `src/lib/` and components — replace ad-hoc formatting with Intl API calls
> - Create `src/lib/format.ts` with standard formatting functions: `formatDate(date, style)`, `formatNumber(num)`, `formatRelativeTime(date)` — all use Intl API with `en-US` locale
> - `Intl.DateTimeFormat('en-US', { dateStyle: 'long' })` for full dates → "January 15, 2026"
> - `Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })` for medium dates → "Jan 15, 2026"
> - `Intl.NumberFormat('en-US')` for numbers → "1,234"
> - `Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })` for relative time → "yesterday", "3 days ago"
> - This pattern makes future i18n trivial: change the locale string, and every date/number automatically reformats
> **Pros:** Zero-cost — native browser API, no dependencies, no bundle impact. Consistent formatting across all components. Future i18n-ready — change locale from `en-US` to `fr-FR` and dates/numbers reformat automatically. All modern browser support without polyfills. TypeScript types included in `lib.es2020.intl.d.ts`. Simpler than any library for formatting-only needs.
> **Cons:** Does NOT handle translations — only formatting. If full i18n is added (multiple languages), a translation library (next-intl, FormatJS) must be layered on top. The Intl API's long date format is not customizable per project — you get whatever CLDR defines for that locale. Older browsers (Safari 12, IE11) may lack `Intl.RelativeTimeFormat`.

> **Status — Done:**
> - ✅ Standard chosen: ECMAScript Intl API (native formatting)
> - ✅ Formatting functions planned: dates (long/medium), numbers, relative time
> - ✅ Locale set: `en-US` (English international)
> - ✅ Cross-area dependency clean — no conflicts with Areas 01–25
>
> **Status — Remaining:**
> - 🔲 Audit existing date/number formatting — replace with Intl API
> - 🔲 Create `src/lib/format.ts` with standard formatting functions (formatDate, formatNumber, formatRelativeTime)
> - 🔲 Write ADR-000X to formalize the ECMAScript Intl API decision

### 27. Offline & PWA

> **Standard:** Service Worker API (W3C)
> **Authority:** W3C Service Workers specification (2014, Candidate Recommendation 2022). The foundation of all PWA capabilities: network interception, cache management, offline access, push notifications, background sync. Baseline 2023+ in Chrome, Firefox, Safari, and Edge. Implemented by Workbox (Google), Serwist, and every PWA toolchain.
> **Origin:** Service Workers were introduced by Google in 2014 as a replacement for AppCache (which was deprecated due to design flaws — a failed W3C spec from 2009). The key difference: AppCache was declarative (a manifest file listed what to cache) and inflexible; Service Workers are imperative (JavaScript) and can intercept every request programmatically. A service worker is a JavaScript file that runs in its own thread, separate from the page. It can't access the DOM but can intercept `fetch` events, manage `Cache` storage, and receive `push` events even when the page isn't open. The W3C standardised the API across browsers, and by 2024 all three browser engines (Blink, WebKit, Gecko) support the core specification. For static sites like CP3 Legacy, service workers enable a simple but powerful pattern: cache everything on first visit, serve everything from cache on repeat visits. The site becomes instant on the second load and works fully offline.
> **Application to CP3 Legacy:**
> - Install `@serwist/next` (the maintained successor to `next-pwa`) — generates a service worker from Next.js build output
> - Create `public/manifest.json` — app name "CP3 Legacy", icons at 192x192 and 512x512, `display: standalone`, `start_url: /`, `theme_color: #1a2332`, `background_color: #ffffff`
> - Add iOS meta tags to root layout: `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="CP3 Legacy">`, `<link rel="apple-touch-icon" href="/icons/icon-192x192.png">`
> - Configure cache strategy: **precache** all static build assets (JS, CSS, images in `public/alchemists/assets/`), **stale-while-revalidate** for `data.json` (serve cached, fetch update in background), **network-first** for any future Sanity CMS content
> - Create `public/offline.html` — branded offline fallback with "You're offline — cached content is still available" message
> - Register the service worker in `layout.tsx` (or a client component) — only in production (not in dev mode)
> **Pros:** CP3 Legacy is a static export — ideal PWA candidate. Entire site can be cached on first visit, instant on repeat visits, fully offline. Critical for Nigerian users with unreliable connectivity (web-development-areas.md explicitly calls this out). Zero runtime cost — service worker runs in its own thread. `@serwist/next` handles the complex Next.js build-output precaching automatically. Improves repeat-visit Core Web Vitals (Area 08). Enables "Add to Homescreen" on mobile.
> **Cons:** Service workers only work over HTTPS (✅ Vercel provides this) and localhost for dev. Service worker update logic is non-trivial — a new worker must detect changes, install, and wait for all pages to close before activating. iOS Safari has known limitations (no push, no background sync, no periodic sync). Development and testing is harder — must test in production build. Can cause confusion if caches are not cleared properly during development.

> **Status — Done:**
> - ✅ Standard chosen: Service Worker API (W3C)
> - ✅ Toolchain: `@serwist/next` (maintained successor to next-pwa)
> - ✅ Cache strategy: precache static assets, stale-while-revalidate for data.json
> - ✅ Cross-area dependency: improves repeat-visit CWV (Area 08)
>
> **Status — Remaining:**
> - 🔲 Install `@serwist/next` and configure in `next.config.ts`
> - 🔲 Create `public/manifest.json` with app name, icons, theme color
> - 🔲 Add iOS meta tags and apple-touch-icon to root layout
> - 🔲 Create `public/offline.html` branded fallback page
> - 🔲 Register service worker in layout (production only)
> - 🔲 Verify via Lighthouse PWA audit
> - 🔲 Write ADR-000X to formalize the Service Worker decision

### 28. Cookie & Session Management

> ⏭️ **Skip** — CP3 Legacy has no authentication, no user accounts, no cookies (Vercel Analytics is cookie-free). No sessions to manage. No session storage needed. If auth is ever added (admin panel, Supabase), revisit via Areas 43 (Authentication) and 14 (Environment & Config), which cover the needed patterns.
>
> *See: httpOnly + Secure + SameSite standard (OWASP) — the minimum standard if sessions are ever added.*

### 29. Redirect & URL Management

> **Standard:** HTTP Redirect Status Code Convention (RFC 9110)
> **Authority:** IETF HTTP Working Group. RFC 9110 (HTTP Semantics, 2022, replaces RFC 7231 Sections 6.4 and 7.4). Defines the standard HTTP redirect status codes: 301, 302, 303, 307, 308. Universal web standard — every server, framework, and search engine follows these. The key distinction is permanent vs temporary (affects search engine index updates) and method preservation (GET vs POST).
> **Origin:** HTTP redirects date back to HTTP/1.0 (RFC 1945, 1996), which defined 301 (Moved Permanently) and 302 (Found). The fundamental difference: 301 tells clients "this resource has a new permanent URL — update your bookmarks and search engine index." 302 tells clients "this resource is temporarily at a different URL — keep using the original URL." HTTP/1.1 (RFC 2616, 1999) added 303 (See Other, forces GET) and 307 (Temporary Redirect, preserves method). RFC 7238 (2012) added 308 (Permanent Redirect, preserves method). The distinction between 301/308 and 302/307 is subtle but important: browsers may change POST to GET on a 301/302 response (method transformation), breaking API endpoints. 307 and 308 explicitly preserve the original HTTP method, making them the correct choice for form submissions and API redirects. For CP3 Legacy's static page URLs, 301 is the correct choice for permanent moves.
> **Application to CP3 Legacy:**
> - **301** — default for all permanent URL changes (page moved, route restructured). Use in `next.config.ts` `redirects()` with `permanent: true`
> - **302** — temporary URL changes (maintenance page, seasonal landing page). Use with `permanent: false`
> - **307/308** — only needed if form POST data must be preserved. Not applicable to CP3 Legacy's static content
> - **404** — page removed with no replacement. Show branded not-found.tsx (Area 13)
> - Implement via Next.js `next.config.ts` `redirects()` (simpler, faster) or `middleware.ts` (dynamic logic)
> - Document the redirect map in project notes whenever URLs are restructured
> **Pros:** Zero-cost — just documented decision. Universal standard — every developer recognizes these codes. Search engines respect the permanent/temporary distinction (Area 07 dependency). Next.js `redirects()` handles implementation. Prevents duplicate content penalties from 302s used for permanent moves.
> **Cons:** Not needed today — CP3 Legacy has only one route (homepage). Low priority until sub-pages are added. Easy to misuse (302 instead of 301 causes SEO issues). 307/308 nuances are rarely understood — documenting them prevents incorrect usage when forms are added.

> **Status — Done:**
> - ✅ Standard chosen: HTTP Redirect Status Code Convention (RFC 9110)
> - ✅ Code usage defined: 301 (permanent), 302 (temporary), 307/308 (method preservation), 404 (removed)
> - ✅ Cross-area dependency: affects SEO indexing (Area 07), Next.js config (Area 05)
>
> **Status — Remaining:**
> - 🔲 No action items today — document redirect conventions for when sub-pages are added
> - 🔲 When new routes are added, document the old→new redirect map
> - 🔲 Write ADR-000X to formalize the Redirect Status Code decision

### 30. Code Splitting & Bundle Size

> **Standard:** Next.js `next/dynamic` — Declarative Lazy Loading
> **Authority:** Vercel / Next.js core team. Official API since Next.js 13 App Router. `dynamic(() => import('./Component'))` creates a separate chunk loaded only when the component renders. Builds on React.lazy + Suspense (React 18). The standard mechanism for route-level and component-level code splitting in Next.js applications.
> **Origin:** Code splitting in web applications evolved from manual script loading to bundler-based automatic chunking. React 16.6 (2018) introduced `React.lazy()` and `<Suspense>` for component-level splitting, but with limitations: no server-side rendering, no loading state customization, and no named exports. Next.js `next/dynamic` solved these problems by wrapping React.lazy with SSR support, custom loading states (`loading: () => <Skeleton />`), and named export support (`dynamic(() => import('./Comp'), { ssr: false })`). The API is the standard way to lazy-load in Next.js because it respects both App Router's server component architecture and client component hydration. For CP3 Legacy, this means heavy organisms (FeaturedCarousel, FeaturedSlider, Footer, PushyPanel, Modals) can be deferred, reducing initial JavaScript by an estimated 40-60%.
> **Application to CP3 Legacy:**
> - Before applying `next/dynamic`, measure the current bundle with `@next/bundle-analyzer`: `npm i -D @next/bundle-analyzer`, add `withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })` to `next.config.ts`, run `ANALYZE=true npm run build`. Identify the largest modules.
> - Apply `next/dynamic` to below-fold organisms: `FeaturedCarousel`, `FeaturedSlider`, `Footer` — these are below the viewport on initial load
> - Apply `next/dynamic` to interaction-triggered components: `PushyPanel`, `Modals` — only needed when the user opens the mobile nav or triggers a modal
> - Apply `next/dynamic` to heavy third-party wrappers: any component importing `recharts` or `react-syntax-highlighter` — defer until the component is about to render
> - Use skeleton loading states: `loading: () => <Skeleton className="h-80" />` — matches shadcn/ui pattern (Area 03) and prevents layout shift (Area 08)
> - Server components (`page.tsx`) don't need `next/dynamic` — they send zero JavaScript by default. Only wrap `'use client'` components.
> **Pros:** Official Next.js API — guaranteed compatibility with App Router. Significant bundle reduction — potentially 40-60% initial JS savings. Skeleton loading states improve perceived performance (Area 08). SSR support — dynamic components still render on the server, only the client JavaScript is deferred. Zero dependencies — built into Next.js. Named export support.
> **Cons:** Adds complexity — each dynamic import adds a chunk boundary and a loading state. Too much splitting can hurt performance (many small chunks = more HTTP requests). Skeleton UIs add design overhead. SSR'd dynamic components increase server response time (the server still renders them). Bundle analysis is an extra build step.

> **Status — Done:**
> - ✅ Standard chosen: `next/dynamic` Declarative Lazy Loading
> - ✅ Candidates identified: FeaturedCarousel, FeaturedSlider, Footer, PushyPanel, Modals, heavy third-party wrappers
> - ✅ Cross-area dependency: App Router (Area 05), Core Web Vitals (Area 08), shadcn/ui Skeleton (Area 03)
>
> **Status — Remaining:**
> - 🔲 Install `@next/bundle-analyzer` and configure in `next.config.ts`
> - 🔲 Run `ANALYZE=true npm run build` — measure current bundle
> - 🔲 Apply `next/dynamic` to below-fold organisms (Carousel, Slider, Footer)
> - 🔲 Apply `next/dynamic` to interaction-triggered components (PushyPanel, Modals)
> - 🔲 Apply `next/dynamic` to heavy third-party component wrappers
> - 🔲 Verify with bundle analyzer — confirm reduction
> - 🔲 Write ADR-000X to formalize the `next/dynamic` decision

### 31. Backup & Recovery

> **Standard:** Git-Based Source Control as Code Backup
> **Authority:** Industry standard — Linus Torvalds (2005, Git). GitHub (2008). Git is the universal version control and backup system for software development. Every commit is a backup, every push to a remote (GitHub, GitLab, Bitbucket) is an offsite backup, and tags mark release versions for point-in-time recovery. The standard is recommended by the Twelve-Factor App methodology (Factor I — Codebase) and is the foundation of all infrastructure-as-code practices.
> **Origin:** Before Git, code backups were manual — tarballs on FTP servers, rsync to external drives, or proprietary VCS tools (SVN, CVS). Git introduced distributed version control, meaning every clone is a full backup of the entire repository history. If the central server (GitHub) fails, any developer's clone can restore the full project. This "distributed backup" property makes Git the most robust backup system for source code — there is no single point of failure. For CP3 Legacy, Git serves as the backup for all application code, configuration, content data (data.json), automation scripts (refresh-prod/), and documentation (ADRs, active-areas.md, README). The only gap is environment variables (.env.local), which are gitignored by convention (Area 14 — Twelve-Factor Factor III).
> **Application to CP3 Legacy:**
> - **Source code + config:** Every commit is backed up to GitHub. Recovery on a new machine: `git clone <repo-url>` then `npm install`.
> - **Content data (data.json):** Committed to Git. If corrupted: `git checkout data.json` to restore the last committed version. If scripts produced new data since last commit: re-run the scripts from `scripts/refresh-prod/`.
> - **Automation scripts (refresh-prod/):** Committed to Git. Recovery: `git checkout scripts/`.
> - **Documentation (active-areas.md, ADRs, README):** Committed to Git. Recovery: `git checkout docs/`.
> - **Gitignored assets (.env.local, node_modules):** Env vars are stored in Vercel dashboard (Area 18 — Vercel auto-deploy). `node_modules` is regenerated by `npm install`.
> - **Vercel deployment history:** Immutable deploys provide point-in-time rollback (Area 18). If Git is completely lost, Vercel's deployment history still has the last built version — but source code must be restored from a clone or recreated.
> - **Recommended addition:** The 3-2-1 rule suggests a third copy. A GitHub Actions workflow could periodically backup data.json to a cloud storage bucket. This is optional for a personal demo site but documented as a future improvement.
> **Pros:** Already in use — zero additional setup. Distributed backup — every clone is a full copy. GitHub provides offsite backup with 99.9%+ uptime. Git history preserves every version — rollback to any commit. No additional cost. Env var recovery is covered by Vercel dashboard (Area 18). data.json is version-controlled — every data change is tracked.
> **Cons:** `.env.local` is not backed up (gitignored by design — it contains secrets). Recovery requires Vercel dashboard access for env vars. Git history size grows with data.json changes — may need Git LFS if data.json grows large. No automated third backup for data.json (manual or script-based if needed). Single-developer project means no clone redundancy (if Victor's machine and GitHub both fail, recovery is impossible).

> **Status — Done:**
> - ✅ Standard chosen: Git-Based Source Control as Code Backup
> - ✅ Recovery paths documented: code (git clone), data.json (git checkout or re-run scripts), env vars (Vercel dashboard)
> - ✅ Cross-area dependency: builds on Area 01 (Twelve-Factor Factor I — Codebase), Area 18 (Vercel rollback)
>
> **Status — Remaining:**
> - 🔲 Document recovery playbook in README or `docs/disaster-recovery.md`
> - 🔲 (Optional) Add GitHub Actions workflow to backup data.json to cloud storage
> - 🔲 Write ADR-000X to formalize the Git-Based Backup decision

### 32. Client Communication

> **Standard:** Project Kickoff Questionnaire (Client Discovery Process)
> **Authority:** Industry standard consulting methodology, formalized by IDEO (Human-Centered Design), Frog Design, and documented in "The Client Kickoff Meeting" (PMI). The core is a structured questionnaire covering business goals, target audience, technical constraints, timeline, budget, brand references, content sources, design preferences, and success criteria — documented and signed off before any design or development work begins. This is the first client-facing deliverable and the foundation of all project decisions.
> **Origin:** The consulting industry (McKinsey, Bain) standardized the "discovery phase" — you cannot solve a problem you have not defined. In web development, this became the "creative brief" process. Agencies like Digital Agency Ux and Happy Cog published their kickoff questionnaires publicly. The methodology is: ask everything upfront, document it in writing, get client sign-off, then use the answers as the reference document for every decision (design, build, deployment). Without a kickoff questionnaire, requirements emerge mid-project — the #1 cause of scope creep, budget overruns, and client dissatisfaction.
> **Application to CP3 Legacy:**
> - CP3 Legacy is a personal demo project — it has no external client. The kickoff questionnaire methodology still applies: Victor is the client, the "goal" is to get hired, and the "audience" is prospective employers and collaborators.
> - For future freelance projects (interior-deco, eliphany, dry_cleaning_site), the kickoff questionnaire is the first deliverable. The template will be created at `templates/client-kickoff.md`.
> - 8 domains to cover in the questionnaire:
>   1. **Business Context** — What industry, what problem, who is the customer, what is the business model?
>   2. **Goals & Success Criteria** — What does success look like in 30/60/90 days? (Traffic, leads, sales, brand awareness)
>   3. **Target Audience** — Who visits the site? Demographics, technical literacy, device preference, location
>   4. **Content Readiness** — Who writes the copy? Who provides images? Is the content ready or needs to be created?
>   5. **Brand Requirements** — Existing brand guidelines? Logo, colors, fonts? Or start from scratch?
>   6. **Technical Constraints** — Hosting provider? Domain registrar? CMS preference? Integrations needed?
>   7. **Timeline & Budget** — Launch date? How many rounds of revision? Budget range for ongoing maintenance?
>   8. **Competitive References** — Sites the client likes and dislikes — specific URLs with explanations of what works and what doesn't
> - The completed questionnaire is stored per-project in a `briefs/` folder and referenced in ADRs (Area 02).
> **Pros:** Prevents scope creep — every requirement is documented before work begins. Builds trust — the client sees you take their project seriously. Saves time — fewer change requests mid-project. Serves as the contract — written agreement on what is in and out of scope. Reusable template — use the same questions for every client.
> **Cons:** Clients may rush through it — need to insist on thorough answers. CP3 Legacy does not use it directly (no client) — only useful as a template. May not cover every niche — template needs to be customized per project type. Requires client to spend 30-60 minutes upfront — some clients push back. Does not eliminate all discovery gaps — some requirements only surface during development.

> **Status — Done:**
> - ✅ Standard chosen: Project Kickoff Questionnaire (Client Discovery Process)
> - ✅ 8-domain questionnaire structure defined
> - ✅ Cross-area dependency: feeds into ADR-0002 (Stack Decisions — every decision traces back to kickoff answers)
>
> **Status — Remaining:**
> - 🔲 Create `templates/client-kickoff.md` with full questionnaire
> - 🔲 (Optional) Create `briefs/` folder to store completed questionnaires per project
> - 🔲 Write ADR-000X to formalize the kickoff process

### 33. Handoff & Maintenance

> **Standard:** Client Handoff Package (Digital Deliverables Standard)
> **Authority:** PMI (Project Management Institute) project closure process. Agency industry standard — formalized by AIGA (professional association for design) in their "Standard Client Agreement" and Digital Agency Ux's project closure methodology. The standard: at project completion, deliver a package containing every asset the client needs to own, operate, and maintain their site independently. This is the professional equivalent of handing over the keys.
> **Origin:** In the early web (1995–2005), developers built sites and just handed over FTP credentials — nothing else. Clients couldn't update anything, couldn't transfer domains, and depended entirely on the original developer. The agency era (2005–2015) professionalized the handoff: style guides, admin documentation, source code archives, and post-launch support terms became standard. Today, a handoff package is a deliverable in every professional web services contract. Without it, the client is trapped — they cannot leave, cannot self-maintain, and cannot switch vendors without starting over.
> **Application to CP3 Legacy:**
> - CP3 Legacy is a personal demo project — no external client. The handoff package methodology still applies metaphorically: the project must be documented well enough that any competent developer can take over. This is the "bus factor" prevention for Victor's portfolio.
> - For future freelance projects (interior-deco, eliphany, dry_cleaning_site), the handoff package is the final deliverable. The template will be created at `templates/client-handoff-package.md`.
> - 7 components of the handoff package:
>   1. **Admin Credentials Document** — Hosting (Vercel), domain registrar (Namecheap/GoDaddy), email hosting, analytics, SSL management, DNS panel. Never share passwords in plain text — use a password manager share link (1Password, Bitwarden).
>   2. **Source Code Access** — GitHub repo URL + readme with setup instructions (Area 21 — Standard Readme). Tagged release with a description of what was built.
>   3. **Domain & DNS Documentation** — Where the domain is registered, DNS records configured (A, CNAME, MX, TXT), expiry date. If the client owns the domain, transfer the registrar access. If Victor owns it, transfer the domain or document the arrangement.
>   4. **Content Management Instructions** — If the client can update content (CMS, static site, Sanity), document how. What to edit, how to publish, where preview works. Screenshots or Loom video walkthrough.
>   5. **Style Guide / Brand Assets** — Colors, fonts, logos, image specs. Where the source design files (Figma, Sketch) are stored. If the client has brand guidelines, include them. If not, document what was created.
>   6. **Post-Launch Support Terms** — Warranty period (30-day bug fix free), maintenance retainer option (Area 33, Option 7), support hours, escalation path. Get this signed before the project closes.
>   7. **Source Code Archive + Unpublish Process** — ZIP archive of the final production code. Documented process: how to unpublish the site, transfer domains, export databases, delete hosting. If the relationship ends, the client can take everything.
> **Pros:** Professional standard — sets Victor apart from developers who just hand over FTP. Client independence — they can maintain the site or switch vendors. Reduces support requests — the documentation answers most questions. Builds trust — the client sees a complete, organized deliverable. Protects against disputes — signed support terms prevent "you said you'd fix this for free forever."
> **Cons:** Takes 2-4 hours to prepare per project. Some clients never read it — a walkthrough session (Option 5) is more effective. Credentials document is a security risk — must be shared via encrypted channels only. Style guide only matters if the client creates new content that needs to match. CP3 Legacy does not benefit directly — template is for future client work only.

> **Status — Done:**
> - ✅ Standard chosen: Client Handoff Package (Digital Deliverables Standard)
> - ✅ 7-component package structure defined
> - ✅ Cross-area dependency: links to Area 18 (hosting/deployment), Area 15 (source code), Area 21 (README), Area 32 (kickoff — start and end bookends)
>
> **Status — Remaining:**
> - 🔲 Create `templates/client-handoff-package.md` with full template
> - 🔲 (Optional) Record Loom walkthrough template for handoff sessions
> - 🔲 Write ADR-000X to formalize the handoff process

## SECTION E — UNIVERSAL ADVANCED (73–80)

### 73. Progress Tracking

> **Standard:** TODO Checklist Methodology (Work Breakdown Structure)
> **Authority:** PMI Work Breakdown Structure (WBS) — ANSI Standard 98-001-2004. The WBS is a deliverable-oriented decomposition of a project into smaller components. Every work item is defined, assigned, and tracked. The "checklist before action" methodology was further popularized by Atul Gawande ("The Checklist Manifesto"), which demonstrated that checklists reduce failure rates in complex procedures (surgery, aviation, construction) to near zero. In software, this translates to: before any multi-step task, write a checklist. Every step gets marked as it completes. The task is not done until the checklist is done.
> **Origin:** WBS originated in the US Department of Defense (1962 — Program Evaluation and Review Technique / PERT). It became the ANSI standard for project management in 2004. Gawande's 2010 book "The Checklist Manifesto" applied the aviation checklist methodology to medicine and complex systems. In software development, the methodology manifests as: task checklists, Gherkin scenario outlines, test case enumeration, and deployment runbooks. The core insight is simple but powerful: writing down the steps before executing them reduces mental load, prevents skipping steps, and creates a verifiable record of what was done. If the session dies (timeout, crash, interruption), the checklist is the recovery point — reopen the file, see what's marked done, and continue from the next unchecked item.
> **Application to CP3 Legacy:**
> - Already partially implemented via the `todowrite` tool (OpenCode built-in checklist). Every new task generates a structured todo list with statuses (pending → in_progress → completed). Additional todo items discovered during work are added dynamically.
> - The methodology is formalized in this pipeline: each `continue` command re-reads `active-areas.md` and reports current position. The "ask before action" pattern (present standards → user picks → explain adoption → document → STOP) is itself a WBS-style checklist for each area.
> - For future development phases (Sanity re-integration, asset fixes, form implementation), every task will start with a WBS checklist written to `active-areas.md` or via `todowrite`.
> - The checklist captures: what needs to be done, who does it (agent or user), dependencies between steps, and a Done/Remaining status summary.
> **Pros:** Already in use — zero additional setup. Prevents skipped steps — the checklist is the source of truth for what's left. Enables interruption recovery — session can die and resume from the last unchecked item. Reduces cognitive load — no mental tracking of what's done vs what's next. Documented progress — the checklist is a permanent record of what was accomplished in each session.
> **Cons:** Requires discipline — every task must start with a checklist before any action. Checklists can grow stale if steps are completed but not marked — undermines the system. Over-checklisting can become bureaucratic — not every two-line fix needs a full WBS. The `todowrite` tool is OpenCode-specific and does not persist if the agent tool changes.

> **Status — Done:**
> - ✅ Standard chosen: TODO Checklist Methodology (WBS)
> - ✅ Already implemented via todowrite tool + continue command + active-areas.md
> - ✅ Cross-area dependency: Area 02 (ADRs capture decisions made during checklist execution)
>
> **Status — Remaining:**
> - 🔲 Add checklist requirement to `docs/workflow.md` as a step before every multi-step task
> - 🔲 Write ADR-000X to formalize the checklist methodology

### 74. Session Recovery

> **Standard:** State-Reload-First Recovery Protocol
> **Authority:** Crash-only software pattern (Armando Fox, UC Berkeley — "Crash-Only Software" HotOS 2003). Erlang/OTP's "let it crash" philosophy (Joe Armstrong). The standard: any system that can crash must be able to recover to a known-good state by re-reading all persistent state on restart. No recovery action depends on in-memory state — everything is rebuilt from durable state files. Applied to agent sessions: after any interruption (timeout, context overflow, restart), the agent's first and only action is to re-read all state files before doing anything else. This makes session resumption deterministic — the same state files always produce the same recovery point.
> **Origin:** The crash-only software pattern emerged from UC Berkeley's RAD Lab (2003) as an alternative to "fail-stop" recovery. The key insight: instead of trying to prevent crashes (impossible in complex systems), design the system so that crashing and restarting is the normal recovery path. Erlang/OTP formalized this with "supervision trees" — if a process crashes, its supervisor restarts it with clean state. In the Vantage pipeline, the `continue` command and `get_pipeline_state` implement the same pattern: on every `continue`, the agent re-reads AGENTS.md → skill → COMMANDS.md → pipeline state → active-areas.md → todowrite state → reports position → proceeds. Nothing is assumed from prior session memory — everything is read fresh from durable files. This means the session can be interrupted at any point, days later, by any agent, and the recovery is identical.
> **Application to CP3 Legacy:**
> - Already implemented via the `continue` command in `.opencode/opencode.json`. The MCP `load_pipeline_command` for `continue` reloads: AGENTS.md → vantage-pipeline skill → COMMANDS.md → get_pipeline_state → todowrite state → reports current area/standard/progress → waits for user input.
> - The protocol is: (1) on any interruption, the next user action is `continue`. (2) Agent re-reads all state files. (3) Agent reports current position: "Currently on Area X, standard Y of 7. Last documented: Area Z — [chosen standard]. Ready." (4) Proceeds based on reported state.
> - This protocol is the reason the "never lose build progress" requirement in Area 73 is satisfied. Even if the session crashes mid-documentation, the next `continue` recovers exactly where we left off.
> - The protocol applies to all future development phases (Sanity re-integration, asset fixes, form implementation). Before any action, read state. After any interruption, re-read state. The state files are the single source of truth.
> **Pros:** Already implemented — zero additional cost. Deterministic recovery — same state, same result every time. Survives context window limits, timeout interruptions, and agent tool changes. Does not require in-memory state or session persistence from the agent platform. Works across different LLM providers (if the tool infrastructure is preserved). The `continue` pattern is intuitive — user types one word and gets a complete status report.
> **Cons:** Limited to OpenCode environment — the `continue` command and `get_pipeline_state` MCP tool are OpenCode-specific. If the pipeline is ported to a different agent tool, the recovery mechanism must be re-implemented. Session state is only as fresh as the last write to active-areas.md — if an action was interrupted before the file was updated, the recovery point may be one step behind. Requires user to type `continue` — cannot auto-recover.

> **Status — Done:**
> - ✅ Standard chosen: State-Reload-First Recovery Protocol
> - ✅ Already implemented via continue command + get_pipeline_state MCP tool
> - ✅ Cross-area dependency: Area 73 (TODO Checklist provides the checkpoints that recovery uses), Area 16 (Development Workflow — continue is a command in the workflow)
>
> **Status — Remaining:**
> - 🔲 Document the recovery protocol in `docs/workflow.md`
> - 🔲 Write ADR-000X to formalize the session recovery pattern

### 75. Constraint Identification

> **Standard:** Constraint-First Architecture (ADRs with Constraints Section)
> **Authority:** Michael Nygard's Architecture Decision Record format (2011, "Documenting Architecture Decisions"). IEEE 1471-2000 (Recommended Practice for Architectural Description of Software-Intensive Systems) — requires documenting constraints, assumptions, and context as integral parts of the architectural description. The standard: before any architectural decision is made, all relevant constraints must be identified, documented, and evaluated. The ADR's "Context" section includes an explicit "Constraints" subsection listing: hard constraints (cannot be changed — Vercel Hobby tier limits, $0 budget, no server-side database), soft constraints (negotiable — deployment frequency, tooling preferences), and non-constraints (things that are NOT limiting factors). The decision is then evaluated against these constraints — a decision that violates a hard constraint is invalid.
> **Origin:** IEEE 1471 (now ISO/IEC 42010) established the principle that architecture descriptions must document the "environment and context" of the system, including constraints that limit architectural choices. Nygard's ADR pattern made this practical for software teams — every ADR has a "Context" section that describes the forces at play. The "Constraint-First" extension formalizes this: write the constraints before exploring the decision options. This prevents the most common architecture failure mode: choosing a solution that looks good in isolation but violates a real-world constraint (budget, hosting, timeline, skill set, regulatory). The discipline is: if a constraint cannot be stated clearly, the decision does not need to be made yet.
> **Application to CP3 Legacy:**
> - Every existing ADR (0001–0005) already documents implicit constraints in its Context section. This standard formalizes the pattern by adding an explicit `### Constraints` section to the ADR template.
> - CP3 Legacy's primary hard constraints:
>   - **Budget:** $0 — all tools must be free-tier or open-source
>   - **Hosting:** Vercel Hobby tier — 100GB bandwidth, 60s function timeout, 10MB response, 6 concurrent invocations, no server-side database
>   - **Skill set:** Victor knows Next.js, Tailwind v4, TypeScript, React, Sanity — decisions outside this set require learning time
>   - **Goal:** Hire-me demo — SEO, fast load, mobile-first, a11y — these are NOT optional, they are constraints
>   - **Context:** Nigerian market — mobile-first, data-cost-sensitive, specific payment provider needs for client projects
> - For future client projects (interior-deco, eliphany, dry_cleaning_site), constraints will include: client budget, timeline, device capabilities, content readiness, and preferred tools.
> - The "constraint-first" step is added to the workflow: before writing any ADR, write the constraints section first. If constraints change, revisit the ADR.
> **Pros:** Prevents invalid decisions — every choice is evaluated against real constraints. Integrates with existing ADR workflow (Area 02). Makes constraints explicit — no hidden assumptions. Forces honesty — if there are no real constraints driving a decision, the decision is probably unnecessary (YAGNI). Creates a reference document — platform constraints written once, referenced by all ADRs.
> **Cons:** Requires discipline — every ADR needs a constraint section. Constraints can change — ADRs must be revisited when Vercel upgrades the Hobby tier or Victor's skill set grows. May slow down trivial decisions — adding constraint documentation for "should I use npm or yarn?" is overhead. Over-constraining can block action — if every constraint is documented as hard, nothing can be decided.

> **Status — Done:**
> - ✅ Standard chosen: Constraint-First Architecture (ADRs with Constraints Section)
> - ✅ CP3 Legacy's primary hard constraints documented
> - ✅ Cross-area dependency: extends Area 02 (ADR format), references Area 18 (Vercel Hobby limits), Area 73 (Progress Tracking — checklist step before writing ADR)
>
> **Status — Remaining:**
> - 🔲 Add `### Constraints` section to `docs/adr/template.md`
> - 🔲 Write ADR-000X to formalize the constraint-first methodology

### 76. Scalability Planning

> **Standard:** Right-Sizing (Scale to Fit, Not Over-Provision)
> **Authority:** 12-Factor App (Factor VIII — Concurrency — "scale out via the process model"). Werner Vogels (AWS CTO) — "Build for the traffic you have today, not the traffic you hope to have." Basecamp's "default to static" philosophy (Hey.com — static-first, no unnecessary dynamic rendering). The standard: determine the expected traffic at launch, document the breaking point of the current stack, define the upgrade path for when you outgrow it, and then STOP. Do not over-engineer for traffic that hasn't arrived. The discipline is: if you cannot state what traffic level breaks your current architecture, you haven't done scalability planning yet.
> **Origin:** The "premature optimization is the root of all evil" principle (Donald Knuth, 1974 — "Structured Programming with go to Statements"). Applied to scalability: optimizing for scale before you have scale is wasted effort. The 12-Factor App (Heroku, 2011) formalized this with Factor VIII: applications should be stateless and scale out via the process model — not by adding complexity before it's needed. In the Vercel/serverless era, right-sizing means: static generation by default, serverless for dynamic routes, and auto-scaling infrastructure that charges only for what you use. Vercel Hobby tier handles roughly 100K requests/month for free. CP3 Legacy's expected launch traffic is ~100 visitors/day (~3K/month). At this traffic level, scalability planning means one thing: document what to do when traffic exceeds the Hobby tier limits. Do nothing else.
> **Application to CP3 Legacy:**
> - **Expected traffic at launch:** ~100 visitors/day (3K/month). Source: Victor's portfolio applies to ~50-100 companies, plus recruiter referrals. Growth: if the content is strong, organic traffic from SEO (Area 07) could grow to 300–500 visitors/day within 6 months.
> - **When does the current stack break?**
>   - **Bandwidth:** Vercel Hobby limit = 100GB/month. CP3 Legacy pages average ~1MB per page load (HTML + CSS + JS + images). 100GB ÷ 1MB = ~100K page loads/month = ~3,300/day. Break point: ~10X current expected traffic. Safety margin: ample.
>   - **Serverless function timeout:** 60s on Hobby. CP3 Legacy has no serverless functions that run > 1s. Break point: not relevant.
>   - **Response size limit:** 10MB on Hobby. CP3 Legacy pages are <1MB. Break point: not relevant.
>   - **Concurrent invocations:** 6 on Hobby. At 3K/month with light usage, concurrency is ~1. Break point: not relevant.
>   - **data.json size:** ~1MB currently. Becomes unwieldy at ~50MB (Git history, manual editing). Break point: ~50MB data growth — unlikely for a personal demo site, but possible if blog/testimonial content grows.
> - **Upgrade path:**
>   1. **Vercel Pro ($20/month):** 1TB bandwidth, 300s timeout, team features, advanced analytics. Upgrade when monthly bandwidth exceeds 80GB (80% of Hobby limit) or when response timeout exceeds 60s.
>   2. **Sanity CMS (free tier):** Re-integrate from `sanity/` schemas when data.json exceeds ~50MB or when Victor needs client-friendly content editing. Already planned, schemas preserved.
>   3. **Vercel Enterprise (custom):** Only if CP3 Legacy becomes a multi-user platform with SLAs. Not in any foreseeable timeline.
> - **What NOT to do:** Add a database. Add Redis caching. Add a load balancer. Add a message queue. These are solutions for traffic levels CP3 Legacy will not reach in its first year. Right-sizing says: use the simplest, cheapest, lowest-maintenance solution until a concrete constraint forces an upgrade.
> **Pros:** Saves time — no over-engineering. Saves money — stays on free tier as long as possible. Keeps architecture simple — no unnecessary complexity. The upgrade path is clear and documented — no panic when traffic grows. Aligns with YAGNI/KISS (Area 75). Builds on the Vercel auto-scaling platform (Area 18) — Vercel scales horizontally automatically until limits are hit.
> **Cons:** If traffic grows faster than expected, Victor must monitor thresholds manually (no auto-alerting without Pro tier). data.json upgrade to Sanity requires migration effort when triggered. Right-sizing is counterintuitive for developers who want to "build it right" with a database from day one — requires discipline to wait until the constraint bites.

> **Status — Done:**
> - ✅ Standard chosen: Right-Sizing (Scale to Fit, Not Over-Provision)
> - ✅ Current stack breaking points documented (bandwidth, data.json size)
> - ✅ Upgrade path defined (Vercel Pro → Sanity → Enterprise)
> - ✅ Cross-area dependency: Area 01 (12-Factor Concurrency), Area 18 (Vercel platform), Area 75 (Constraints — traffic is a constraint)
>
> **Status — Remaining:**
> - 🔲 Document Vercel Hobby tier limits + upgrade path in `docs/infrastructure.md`
> - 🔲 Write ADR-000X to formalize the right-sizing strategy

### 77. Security

> **Standard:** Dependency Vulnerability Scanning (npm audit + Dependabot)
> **Authority:** OWASP Top 10 (A06:2021 — Vulnerable and Outdated Components). GitHub Security Lab — Dependabot is GitHub's automated dependency security tool, used by millions of repositories. npm security practices — `npm audit` is the built-in security scanner for Node.js projects. The standard: all dependencies are scanned for known vulnerabilities before every deployment. Critical and high-severity vulnerabilities block the build — they must be fixed, patched, or explicitly accepted before the code reaches production. Dependency scanning is the minimum viable security practice for any project using external packages.
> **Origin:** The "dependency hell" problem predates modern package managers, but the security dimension became acute with the npm ecosystem (100,000+ packages, many with transitive dependencies). The Event-Stream incident (2018 — malicious code injected into a popular npm package with 8M weekly downloads) demonstrated that supply chain attacks are the most practical way to compromise a web application — you don't need to hack the app, you hack a dependency the app uses. GitHub acquired Dependabot in 2019 and integrated it natively. For a Next.js project on Vercel, the dependency attack surface includes: Next.js, React, React-DOM, Tailwind CSS, TypeScript, Sonner, and their transitive dependencies. Scanning these for known CVEs before every deployment prevents shipping code with known vulnerabilities.
> **Application to CP3 Legacy:**
> - **npm audit:** Run `npm audit` locally to check current state. Fix vulnerabilities with `npm audit fix` or manually update affected packages. Run before every `git push` to the main branch (deploy trigger).
> - **Dependabot:** Enable on GitHub repo (Settings → Security & Analysis → Dependabot). Dependabot will: (1) scan all dependencies on every push, (2) create PRs with version bumps when vulnerabilities are found, (3) auto-merge if tests pass (configurable). For CP3 Legacy (personal demo, single dev), Dependabot can auto-merge security patches — low risk since there are no end-users depending on stability.
> - **Build-time enforcement:** Vercel auto-deploys from the main branch. Add a GitHub Actions workflow or a `pre-commit` hook that runs `npm audit` and fails the build if critical/high vulnerabilities exist. This creates a "no vulnerable code in production" guarantee.
> - **Review frequency:** Weekly — check Dependabot alerts and npm audit output. If no vulnerabilities are found, no action needed.
> - **False positives:** `npm audit` sometimes reports vulnerabilities in devDependencies or TypeScript type packages that have no runtime impact. Evaluate each alert — do not blindly fix everything. The standard is: know what's vulnerable, document any accepted risks.
> - **No build enforcement yet:** Currently no CI/CD pipeline that blocks builds on npm audit results. This is the primary adoption gap.
> **Pros:** Zero cost — npm audit and Dependabot are free. Automated — Dependabot creates fix PRs without manual intervention. Supply chain protection — catches the most common web vulnerability vector. Low effort — weekly review takes 5 minutes. No false positive burden — evaluate once and move on.
> **Cons:** npm audit can produce false positives (vulnerabilities in dev-only dependencies with no runtime impact). Some vulnerability fixes require major version bumps that may break the build. Dependabot PRs can be noisy if there are frequent alerts. No CI/CD build enforcement yet — requires manual discipline to run npm audit before deploy.

> **Status — Done:**
> - ✅ Standard chosen: Dependency Vulnerability Scanning (npm audit + Dependabot)
> - ✅ Current npm audit state: needs a one-time run to establish baseline
> - ✅ Cross-area dependency: Area 18 (Vercel auto-deploy — build enforcement gap), Area 16 (CI/CD workflow)
>
> **Status — Remaining:**
> - 🔲 Run `npm audit` and fix current vulnerabilities
> - 🔲 Enable Dependabot on GitHub repo
> - 🔲 Add npm audit to pre-deployment workflow (GitHub Actions or pre-commit hook)
> - 🔲 Write ADR-000X to formalize the dependency scanning policy

### 78. Landing Page vs App Shell

> **Standard:** Landing Page First (Marketing Site Methodology)
> **Authority:** Conversion Rate Optimization (CRO) industry — formalized in "Landing Page Optimization" (Tim Ash, 2008, finalist for Amazon Best Business Book) and "Don't Make Me Think" (Steve Krug, 2000 — usability for landing pages). HubSpot and Unbounce's landing page design methodology — every element on the page serves a single conversion goal. Distractions are removed. Navigation is minimized. The page exists to drive one action: for CP3 Legacy, that action is "hire Victor."
> **Origin:** The landing page as a distinct discipline emerged with online advertising (Google AdWords, 2000). Advertisers realized that sending traffic to a homepage (with 10+ navigation options) converted worse than a dedicated page with a single goal. The methodology has since been adopted for all marketing sites — even those without paid traffic. The core principles: (1) one goal per page, (2) above-the-fold communicates value proposition, (3) social proof builds trust, (4) CTA is prominent and unambiguous, (5) distractions (excessive navigation, external links, unrelated content) reduce conversion. The "app shell" is a separate pattern — it wraps authenticated, interactive content in a persistent navigation frame (sidebar, top bar). The two are fundamentally different: a landing page is a funnel, an app shell is a workspace. Mixing them confuses users and reduces conversion.
> **Application to CP3 Legacy:**
> - CP3 Legacy IS a landing page — it has no auth, no workspace, no interactive app functionality. The "app shell vs landing page" question is answered: landing page. There is no app shell. The entire site is a funnel to get Victor hired.
> - The current site structure follows Landing Page First:
>   - **Homepage (Hero):** Value proposition — "Full-stack developer available for hire" → CTA: "Contact me" or "View work"
>   - **Portfolio:** Social proof — past projects demonstrate capability
>   - **Testimonials:** Social proof — clients vouch for Victor
>   - **Skills/Technologies:** Build trust — shows technical depth
>   - **Contact form:** The conversion goal — email, call, or schedule
> - Every existing and future page must answer: "Does this page serve the conversion funnel?" If not, it doesn't belong.
> - If a future project requires an app shell (team dashboard, client portal, admin panel), it will be a separate Next.js project with its own deployment, own caching rules, and own design system — but using the same design tokens for brand consistency.
> - **Different caching rules:** Already covered by Area 78 — all pages are public, all are CDN-cached. When an app shell is added, it uses `private, no-cache` for authenticated routes.
> - **Different SEO requirements:** Landing pages need full SEO (metadata, sitemap, robot.txt — Areas 07, 10). App shell pages do not get indexed — they have `noindex` meta tags.
> - **Separate deployment or same codebase:** For CP3 Legacy, the landing page is the product — same codebase, same deployment. If an app shell is added later, the decision will be: same codebase with route groups (Next.js) or separate project. Separate project is preferred for independent deployments and security isolation.
> **Pros:** Clear design direction — every page has a defined purpose. Converts better — landing pages optimized for a single action outperform general-purpose pages. No scope creep — "does this serve the funnel?" is a clear filter. Aligns with SEO (Area 07) — landing pages are indexable, app shell pages are not. The landing page is the product until there's a reason to build an app shell.
> **Cons:** Only applies to marketing sites — app shell projects need a different standard. If a future client project is an app (dashboard, SaaS), the Landing Page First methodology applies only to the public marketing pages, not the authenticated product. May discourage interaction design — "every page is a landing page" can lead to boring, template-like designs if not balanced with creativity.

> **Status — Done:**
> - ✅ Standard chosen: Landing Page First (Marketing Site Methodology)
> - ✅ Site structure mapped to conversion funnel (hero → portfolio → testimonials → skills → CTA)
> - ✅ App shell ruled out — CP3 Legacy is a landing page
> - ✅ Cross-area dependency: Area 03 (Atomic Design — components serve conversion), Area 07 (SEO — metadata drives discovery), Area 08 (Performance — Core Web Vitals), Area 25 (Forms — contact CTA)
>
> **Status — Remaining:**
> - 🔲 Audit each page and verify it serves the conversion funnel
> - 🔲 Ensure all CTAs are clear, prominent, and consistent
> - 🔲 Write ADR-000X to formalize the landing-page-first architecture

### 79. Design Tokens & Theming

> **Standard:** Semantic Color Token Architecture (Role-Based, Not Literal)
> **Authority:** Nathan Curtis (Design Tokens pioneer, 2016 — "Tokens in Design" series). Salesforce Lightning Design System — the first major production design token system. Google Material Design 3 — dynamic theming via color roles (primary, secondary, tertiary, surface, error, etc.). The standard: every design value (color, typography, spacing, shadow, radius, animation) is stored as a named token. Token names are semantic — they describe the ROLE the value plays (`--color-primary`, `--spacing-section`, `--font-body`), not the literal value (`--blue`, `--size-16px`, `--font-helvetica`). This decouples design intent from implementation — when the brand changes, you update the token value, not every component.
> **Origin:** The design token concept emerged at Salesforce (2014–2015) when the Lightning Design System team needed to maintain visual consistency across multiple products and platforms (web, iOS, Android). Hard-coded values meant updating the brand color required touching every component file. The solution: extract ALL design values into named tokens that map to product-specific roles. A token like `--color-brand-primary` maps to a specific hex/OKLCH value, but components reference the token name, not the value. Nathan Curtis published the "Tokens in Design" series (2016), establishing the design token standard at Medium, Target, and then industry-wide. The W3C Design Tokens Community Working Group (2022) is standardizing the format (JSON-based).
> **Application to CP3 Legacy:**
> - This standard is already established in **Area 04 (Brand & Identity)** — Semantic Color Token Architecture was chosen as the brand/identity standard. Area 79 extends the same methodology to ALL design tokens (colors, spacing, typography, shadows, radii, animations). The two areas share the standard by design — Area 04 covers brand identity, Area 79 covers the full design token system.
> - **Current token state in CP3 Legacy (Tailwind v4):**
>   - **Colors:** Semantic naming in `tailwind.config.ts` + `globals.css` — `--color-primary`, `--color-bg-surface`, etc. Tailwind's `@theme` directive defines these as design tokens.
>   - **Spacing:** Currently uses Tailwind's default spacing scale (`p-4`, `m-8`, `gap-6`). No semantic aliases for "section padding" vs "card gap" vs "button margin."
>   - **Typography:** Currently uses Tailwind's default font-size/line-height scale. No semantic aliases for "heading-xl" vs "body-small" vs "caption."
>   - **Shadows/Radii:** Currently uses Tailwind defaults. No semantic aliases.
>   - **Light/Dark mode:** Not yet implemented. The standard supports a class-based switch (`.light`/`.dark`) with `prefers-color-scheme` as the default.
> - **Adoption path:**
>   1. Colors — already adopted (Area 04).
>   2. Spacing — add semantic aliases: `--spacing-section`, `--spacing-card-gap`, `--spacing-component-gap`.
>   3. Typography — add semantic aliases: `--font-heading-xl`, `--font-heading-lg`, `--font-body`, `--font-caption`.
>   4. Shadows — add semantic aliases: `--shadow-card`, `--shadow-modal`, `--shadow-button`.
>   5. Radii — add semantic aliases: `--radius-card`, `--radius-button`, `--radius-input`.
>   6. Dark mode — add dark token variants to each semantic alias.
> - **Token naming convention adopted:** `--{category}-{role}-{variant}`. Example: `--color-primary-hover`, `--spacing-section-lg`, `--typography-heading-xl`.
> - **Light/Dark switch pattern:** Class-based switch via Tailwind's `dark:` variant. `prefers-color-scheme` media query sets the initial default. The `dark:` class on `<html>` overrides. User can toggle via a theme switcher component.
> **Pros:** Already partially implemented (colors). Industry-standard methodology — used by Salesforce, Google, Shopify, and every major design system. Decouples design from implementation — change one token file, update every component. Enables theming (light/dark mode) trivially — swap token sets. Future-proof — W3C standardization means tooling support is growing. Tailwind v4 already supports the pattern via `@theme`.
> **Cons:** Adding semantic spacing/typography/shadow tokens requires refactoring existing Tailwind class usage — every component that uses `p-4` would need to change to `p-section` or whatever the semantic alias is. This is an incremental refactor, not a blocker. Light/dark mode token sets double the number of color values to maintain. Semantic naming is only useful if enforced — a single hard-coded `#3B82F6` in a component breaks the system.

> **Status — Done:**
> - ✅ Standard chosen: Semantic Color Token Architecture (extends Area 04)
> - ✅ Color tokens already adopted (Area 04)
> - ✅ Light/dark mode pattern defined (class-based, Tailwind `dark:` variant)
> - ✅ Cross-area dependency: Area 04 (Brand — same standard, narrower scope), Area 03 (Atomic Design — tokens are the atoms), Area 23 (Animation — animation timing tokens follow the same naming)
>
> **Status — Remaining:**
> - 🔲 Add semantic spacing tokens to `tailwind.config.ts` / `globals.css`
> - 🔲 Add semantic typography tokens
> - 🔲 Add semantic shadow and radius tokens
> - 🔲 Implement light/dark theme mode (class-based switch)
> - 🔲 Write ADR-000X or update ADR-0004 to formalize the full design token scope

### 80. Third Party Integrations

> **Standard:** Resend (Email API for Contact Form)
> **Authority:** Resend (YC W21) — modern developer-first email API. Industry standard for transactional email delivery (alternative to SendGrid, Mailgun, Postmark). The Resend API is a REST API with SDKs for Node.js, React Email, and Next.js. It supports HTML emails, React Email templates, webhooks for delivery status, and has a free tier (100 emails/day, 500 emails/day with domain verification).
> **Origin:** Before transactional email APIs (2000s), sending email from a web app required an SMTP server, configuration, and deliverability management (SPF, DKIM, DMARC). SendGrid (2009) and Mailgun (2010) pioneered the API-first email approach. Resend (2023) modernized it with a simpler API, React Email integration, and a generous free tier. For a Next.js app like CP3 Legacy, the integration pattern is: create a Resend API key → store in `RESEND_API_KEY` env var → create a server action or API route → call `resend.emails.send()` → handle success/error → show toast to user (Area 24 — Sonner).
> **Application to CP3 Legacy:**
> - CP3 Legacy does NOT currently have a functional contact form. Area 25 (Forms) is documented as "Future Use" — the form stack is defined (react-hook-form + zod + @hookform/resolvers + shadcn/ui Form) but not implemented. Resend is the email provider for that form.
> - **Pre-emptive registration:** Register a Resend account NOW (before the form is built) and add the API key to `.env.example`. This follows the standard's rule: "register account, get keys, add to .env.example BEFORE build starts."
> - **Integration steps (when form is implemented):**
>   1. Register Resend account — `resend.com` — verify ownership of victor@... email domain
>   2. Create API key — store as `RESEND_API_KEY` in `.env.local`
>   3. Add `RESEND_API_KEY` to `.env.example` with a comment: `# Resend email API key for contact form`
>   4. Install `resend` npm package
>   5. Create `src/app/api/contact/route.ts` or a server action `src/actions/contact.ts`
>   6. Implement: receive form data → validate with zod (Area 25) → send via Resend → return success/error
>   7. Wire form to API endpoint — show Sonner toast on success/error (Area 24)
>   8. Test end-to-end: fill form, submit, receive email
> - **Current third-party integrations in CP3 Legacy:**
>   - Vercel Analytics + Speed Insights — already live (Area 19)
>   - Sonner (toast notifications) — already installed, wired (Area 24)
>   - Tailwind v4 — installed (confirmed)
>   - Next.js + React + TypeScript — base stack
> - **Future integrations (not yet adopted):**
>   - Posthog or GA4 — if Vercel Analytics is insufficient
>   - Crisp — if live chat is needed
>   - Sanity CMS — re-integration planned (schemas preserved in `sanity/`)
> - Every future integration follows the same pre-flight checklist: register → keys → .env.example → test → implement.
> **Pros:** Free tier covers CP3 Legacy traffic. Simple API — one function call to send email. React Email integration for beautiful transactional emails. Good deliverability (SPF/DKIM/DMARC handled automatically). Modern DX — TypeScript SDK, typesafe. Follows the "register before build" principle — no last-minute integration.
> **Cons:** Requires domain verification (need to add DNS records, or use Resend's testing email for initial setup). Free tier limit is 100 emails/day — fine for demo, but won't scale if traffic spikes. Resend is newer than SendGrid/Mailgun — smaller ecosystem. Contact form not yet implemented — integration is documented but not wired.

> **Status — Done:**
> - ✅ Standard chosen: Resend (Email API for Contact Form)
> - ✅ Pre-registration planned (before form build)
> - ✅ Integration steps documented
> - ✅ Cross-area dependency: Area 25 (Forms — Resend is the email provider), Area 14 (Env Vars — API key in .env.example), Area 24 (Notifications — Sonner toast on form submission), Area 78 (Landing Page — contact form is the conversion CTA)
>
> **Status — Remaining:**
> - 🔲 Register Resend account + generate API key
> - 🔲 Add `RESEND_API_KEY` to `.env.example`
> - 🔲 (When Area 25 is implemented) Wire up Resend to contact form
> - 🔲 Write ADR-000X to formalize the Resend integration

---

**Total: 41 areas**
