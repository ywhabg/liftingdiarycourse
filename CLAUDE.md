# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Docs-first rule

**Before generating any code, always check the `/docs` directory first.** If a relevant standards document exists for the area you are working in (UI, data, API, etc.), you must read and follow it. The docs directory is the source of truth for project conventions and must take precedence over general best practices or defaults.

## Commands

```bash
npm run dev       # start dev server at http://localhost:3000 (Turbopack by default)
npm run build     # production build
npm test
npm start         # start production server
npm run lint      # run ESLint (build no longer lints automatically in Next.js 16)
```

To use Webpack instead of Turbopack: `next dev --webpack` / `next build --webpack`.

## Stack

- **Next.js 16** with App Router — breaking changes from prior versions; read `node_modules/next/dist/docs/` before using any API
- **React 19** — Server Components are the default; add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs
- **TypeScript** (strict mode) — import alias `@/*` maps to the project root
- **Tailwind CSS 4** via PostCSS

## Architecture

This is an App Router project. All routes live under `app/`:

- `app/layout.tsx` — root layout (wraps every route; sets fonts and `<html>`/`<body>`)
- `app/page.tsx` — home route (`/`)
- `app/globals.css` — global styles (Tailwind base)

**Routing conventions** (folders = URL segments; a route is public only when a `page.tsx` or `route.ts` file exists):

| Pattern | Meaning |
|---|---|
| `app/foo/page.tsx` | `/foo` route |
| `app/[slug]/page.tsx` | dynamic segment — `params` is a **Promise**, must be awaited |
| `app/(group)/` | route group — excluded from URL |
| `app/_folder/` | private folder — excluded from routing |
| `app/foo/route.ts` | API endpoint at `/foo` |

**Component hierarchy** rendered per segment: `layout → template → error → loading → not-found → page`.

## Key conventions

- `params` in dynamic routes is now a `Promise<{ slug: string }>` — always `await params` before accessing fields.
- Fonts are loaded via `next/font/google` and injected as CSS variables on `<html>`.
- ESLint config (`eslint.config.mjs`) uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` in flat-config format.
