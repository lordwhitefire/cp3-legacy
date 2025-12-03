# CP-Legacy-Tracker Frontend  
**Live URL**: `https://cp-legacy-frontend.vercel.app` (replace after deploy)

A lightning-fast, trend-riding micro-site that visualises Chris Paul’s real-time legacy: career stats + live social reactions + a discreet “hire the dev” funnel. Built with Next.js 14 (App Router), Tailwind CSS, Sanity headless CMS, and deployed on Vercel.

---

## 🎯 Purpose  
- Ride the current Chris-Paul-waived trend for traffic.  
- Prove end-to-end delivery (data → design → deploy) in < 24 h.  
- Capture inbound gig leads via embedded Sanity form.

---

## 🧱 Stack
| Layer        | Tech                                   |
|--------------|----------------------------------------|
| Framework    | Next.js 14 (App Router, TypeScript)    |
| Styling      | Tailwind CSS                           |
| CMS          | Sanity (content + form submissions)    |
| Deployment   | Vercel (zero-config, on-demand ISR)    |
| Automation   | GitHub Actions (stat & tweet ingestion)|
| Analytics    | Vercel Web Analytics (privacy-first)   |

---

## 🗂️ Project Map
```
cp-legacy-frontend/
├─ app/
│  ├─ page.tsx                 # landing: hero stats + reaction wall
│  ├─ stats/page.tsx           # paginated season table (ISR 60 s)
│  ├─ reactions/page.tsx       # crowd timeline, sortable
│  ├─ api/reactions/route.ts   # POST new reaction / GET approved list
│  ├─ api/stats/route.ts       # webhook to revalidate after nightly stat update
├─ components/
│  ├─ StatCard.tsx             # animated counter & progress bars
│  ├─ ReactionWall.tsx         # masonry grid, optimistic up-vote
│  ├─ HireCTA.tsx              # sticky footer form → Sanity “gigLead”
├─ lib/
│  ├─ sanity.ts                # client + GROQ helpers
│  ├─ revalidate.ts            # on-demand ISR helper
├─ types/index.ts              # shared TS interfaces
├─ public/cp-og.png            # 1200×630 auto-generated OG image
├─ .env.local                  # never commit real tokens
├─ .github/workflows/          # ingestion & stat cron jobs (see docs)
└─ README.md                   # you are here
```

---

## 🔐 Environment Variables
Add these to Vercel dashboard **and** `.env.local` for local dev:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<from Sanity project>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=<token with read rights>
SANITY_API_WRITE_TOKEN=<token with write rights>
REVALIDATE_SECRET=<any random string>
```

---

## 🚀 Quick Start
```bash
git clone https://github.com/YOUR_GH/cp-legacy-frontend.git
cd cp-legacy-frontend
npm i
npm run dev        # http://localhost:3000
```

---

## 📊 Data Flow
1. **Stats** – GitHub Action scrapes Basketball-Reference nightly → POST to Sanity → Vercel webhook → ISR.  
2. **Reactions** – GitHub Action polls Twitter & Reddit every 15 min → POST to `/api/reactions` (auto-approved=false) → you curate in Sanity Studio → ISR.  
3. **Leads** – `HireCTA` writes to Sanity “gigLead” → Zapier emails you instantly.

---

## 🧪 Testing
- Unit: `npm run test` (Vitest + React Testing Library)  
- E2E: `npm run e2e` (Playwright) – runs against preview deploys  
- Lighthouse CI runs on every PR (via GitHub Action)

---

## 📈 Analytics & SEO
- Vercel Web Analytics (no cookies, GDPR-safe)  
- Open Graph & Twitter meta generated per route  
- Sitemap + robots.txt auto-generated at build time

---

## 🏁 Deployment
```bash
vercel --prod        # CLI one-liner
```
or push to `main` branch → automatic production deploy via Git integration.

---

## 🤝 Hire Me
If you need a dev who ships trend-sized features in hours:  
✉️ chris@yourdomain.com | 🐦 @yourhandle

---

## License
MIT – feel free to fork, just link back.