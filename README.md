<p align="center">
  <img src="./.github/readme-assets/signal.gif" alt="Animated signal / product visual for qrtest" width="100%" />
</p>

<h1 align="center">qrtest</h1>

<p align="center"><strong>QRCRAFT — an AI-powered QR code studio implemented as a Next.js + TypeScript web app for generating, customizing, scanning, and tracking QR codes.</strong></p>

<p align="center"><code>REPO//SIGNAL</code> · <code>SIGNAL / PRODUCT</code> · <code>LOOPING README EXPERIENCE</code></p>

## Live signal

| Lens | Readout |
| --- | --- |
| Portfolio lane | **SIGNAL / PRODUCT** |
| Code surface | **106** tracked files observed |
| Primary materials | **React TSX, TypeScript, Markdown, JSON** |
| Verification | **0** test-related files observed |

> A moving scan of the project surface. The animated frame above is a lightweight visual signature; the sections below remain the source of truth for implementation details.

## Motion map

`SIGNAL` → `SHAPE` → `RELEASE`

Use the animated banner as the first signal, then move into the implementation dossier. The recommended next step is to verify the documented setup command against the repository scripts before extending the project.

<details open>
<summary><strong>Open the full project dossier</strong></summary>

## Overview
A modern Next.js (App Router) TypeScript application that bundles a QR generator/studio UI, AI-assisted design suggestions, scanning, analytics, batch export utilities, and local persistence via Prisma (SQLite by default). The repository includes deployment helpers for Render/Vercel and several server wrappers for standalone builds.

## What it does
- Provides a UI for generating and customizing QR codes across many content types (README documents 16 content types such as URL, WhatsApp, WiFi, vCard, Email, SMS, etc.).
- Offers an AI assistant / design suggestions feature referenced in the app and README.
- Includes QR scanning via camera and image upload (jsQR referenced).
- Supplies analytics/dashboard components for tracking scans.
- Supports batch generation (CSV → multiple QR images + ZIP) and export utilities.
- Persists data locally using Prisma with SQLite as the default dev DB.
- Exposes a simple health API route at src/app/api/route.ts.

## Key capabilities
- 16 documented QR content types and templates.
- AI-powered assistance and smart-design suggestions.
- Customization: colors, templates, logo embedding (defaults referenced).
- QR scanning (camera + image upload).
- Batch generation and export (CSV support, archiving referenced).
- Deployment support for Render and standalone builds.

## Technology
- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS (v4) and tailwindcss-animate
- shadcn/ui + Radix UI
- Prisma (ORM) with SQLite as the default development DB
- QR libraries: qrcode, qrcode-generator
- QR scanning: jsqr
- Other libraries: next-auth, framer-motion, sharp, jszip, react-query, zustand, and many Radix UI packages

## Repository structure
Relevant top-level files and directories (short list):
- src/ — application code (App Router, server and client components, components, hooks, lib)
- prisma/ — Prisma schema and migrations
- public/ — static assets
- components.json — shadcn/ui configuration
- .env.example — environment variable example
- next.config.ts, src/middleware.ts — headers and runtime configuration
- server.js, start-server.js, scripts/post-build.js — deployment / standalone helpers
- render.yaml, RENDER_DEPLOYMENT.md — Render deployment configuration
- package.json — npm scripts and dependency list
- README.md (existing project README with detailed feature list)

Files to inspect for key behaviors:
- src/lib/db.ts (Prisma client initialization)
- src/app/api/route.ts (health route)
- src/middleware.ts and next.config.ts (security headers)
- prisma/schema.prisma
- render.yaml, server.js, start-server.js, scripts/post-build.js

## Getting started
(Commands and scripts are taken from package.json and the repository README.)
1. Clone the repository and install dependencies:
   - npm install
2. Prepare environment variables:
   - copy .env.example to .env and edit values as needed
3. Generate Prisma client and push schema:
   - npm run db:generate
   - npm run db:push
4. Start development server:
   - npm run dev
5. Build for production:
   - npm run build
6. Start production server (repository includes a Node start script):
   - npm start

Note: follow the files listed in "Repository structure" to inspect runtime behavior and deployment helpers.

## Configuration
Environment variables and values referenced in the repository (evidence-based):
- DATABASE_URL (default referenced as file:./prisma/dev.db in render.yaml and README excerpts)
- NEXT_PUBLIC_APP_URL
- GROQ_API_KEY
- OPENROUTER_API_KEY
- NODE_ENV

The repository contains .env.example — edit and populate secrets before running build/dev. Render deployment settings are present in render.yaml (build/start commands and env var names).

## Development and quality notes
- Useful npm scripts (from package.json): dev, build (runs prisma generate && next build), start (node server.js), lint, db:push, db:generate, db:migrate, db:reset, postinstall (prisma generate).
- Prisma client initialization in src/lib/db.ts uses a dev-time caching pattern to avoid multiple instances during hot reloads.
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) are set in src/middleware.ts and next.config.ts.
- Observed gaps:
  - No Content-Security-Policy (CSP) or HSTS documented/implemented in the supplied files.
  - Prisma is configured to log queries which may be too verbose for production.
  - No test files or test runner were detected.
  - No CI/workflow configuration detected in the repository evidence.
  - Default DB is SQLite (suitable for local/dev but not for horizontally scaled production).
- Recommended immediate improvements (documented in the audit): add CSP/HSTS, reduce Prisma query logging in production, add tests and CI.

## Safety and responsible use
- Secrets: do not commit values for GROQ_API_KEY, OPENROUTER_API_KEY, DATABASE_URL, or any API keys. Use .env and secret managers for production.
- Production persistence: the repo references SQLite as default; evaluate a managed DB for production deployments.
- Security headers: middleware and next.config.ts set some headers but a strict CSP and HSTS are not present in the supplied manifests — adding those reduces risk from XSS and other injection vectors.
- Rate limiting and validation: the repository provides a simple health route, but dynamic endpoints that accept uploads or content (QR inputs, images) should have server-side validation/abuse protections before public exposure.

## Contributing
- There is no CONTRIBUTING.md or CI workflow evident in the provided files. Suggested entry points for contributors:
  - Run the app locally with the dev script and inspect behavior.
  - Review the main configuration and integration points: src/lib/db.ts, src/app/api/route.ts, src/middleware.ts, next.config.ts, prisma/schema.prisma, and render.yaml.
  - Open issues and PRs that add tests, CI, CSP/HSTS, or migrate production DB configuration.
- Keep secrets out of commits and follow repository coding conventions (TypeScript + shadcn/ui patterns are used throughout).

## License
MIT (as stated in the existing project README)

</details>

---

<p align="center"><sub>README motion system · visual layer by RepoSignal · implementation details remain project-specific</sub></p>
