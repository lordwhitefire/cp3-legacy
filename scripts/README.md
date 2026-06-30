# Scripts — Admin & One-Off Tasks

## Content Refresh

```bash
bun scripts/refresh-prod/refresh-all.py
```

Fetches news, Reddit posts, match data, and images. See `scripts/refresh-prod/README.md` for details.

## Sanity Schema Sync

```bash
bun scripts/sync-sanity-schemas.ts
```

When Sanity CMS is re-integrated: pushes local schema definitions from `sanity/` to Sanity project. See `sanity/studio-cp3-legacy/schemaTypes/` for schemas.

## data.json Migration

```bash
bun scripts/migrate-data-to-sanity.ts
```

When Sanity CMS is re-integrated: reads `data.json` and creates/updates corresponding Sanity documents. Run once to migrate, then content lives in Sanity.

## Screenshots

```bash
python3 scripts/screenshot_rebuild.py     # capture page screenshots
python3 scripts/compare_screenshots.py    # compare before/after
```

## Project Status

See `active-areas.md` for the full list of adopted standards and remaining items.
