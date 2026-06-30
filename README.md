# CP3 Legacy

Personal portfolio and hire-me funnel site built with Next.js, Tailwind CSS v4, shadcn/ui, and TypeScript.

## Prerequisites

- **Node.js** 20+ (check with `node --version`)
- **Bun** (package manager) — `curl -fsSL https://bun.sh/install | bash`

## Development

```bash
bun install
bun run dev          # starts dev server on http://localhost:3000
```

## Build

```bash
bun run build        # builds for production + copies static assets
bun run start        # serves the production build
```

### Dev/Prod Parity

- Same Node.js version is used in dev and CI (see `.node-version` or `package.json` `engines`)
- Build locally before pushing: `bun run build` must succeed
- Lint before push: `bun run lint`
- Environment variables for dev and production are declared in `.env.example` — `.env.local` is gitignored

## Deployment

Deploys automatically from the `main` branch via Vercel. See `vercel.json` for configuration.

## Project Structure

```
├── src/              # Application source
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components (atomic design)
│   └── lib/          # Shared utilities
├── public/           # Static assets (images, fonts)
├── docs/             # Documentation and ADRs
├── scripts/          # Admin/one-off tasks
└── sanity/           # Sanity CMS schemas (backup)
```

## Standards

See `active-areas.md` for the documented industry standards adopted across 41 project areas.
