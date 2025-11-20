<!-- Copied/created by AI assistant: tailored for this repository -->
# Copilot / AI Agent Instructions — revdoctor-automation

Purpose: give an AI coding agent immediate, actionable knowledge to work productively in this repository.

- Project type: Next.js (app router) + TypeScript. See `package.json` and `next.config.mjs`.
- Package manager: repo contains `pnpm-lock.yaml`; prefer `pnpm` when available (`pnpm dev`, `pnpm build`). `npm` scripts are present (`dev`, `build`, `start`).

Quick architecture summary
- Frontend: `app/` (Next.js 14 app-router). Pages and nested routes live under `app/` (e.g. `app/admin`, `app/auth`). Layouts and global CSS are in `app/layout.tsx` and `app/globals.css`.
- Components: `components/` contains UI primitives, grouped by feature (e.g. `components/auth`, `components/dashboard`, `components/ui`). Many components use Tailwind + Radix primitives.
- Server/API: API routes use Next.js Route Handlers under `app/api/*` (examples: `app/api/stripe/webhook/route.ts`, `app/api/agent/start/route.ts`). They use `NextRequest` / `NextResponse`.
- Services / libs: `lib/` holds utilities and integrations: `lib/supabase/*` (client/server factories), `lib/stripe.ts`, `lib/actions.ts`, `lib/utils.ts`.
- Integrations: Supabase (DB/auth), Stripe (payments & webhooks), and optional n8n for agent lifecycle webhooks. See API routes for flows.

Important files to reference (examples)
- `app/api/stripe/webhook/route.ts` — Stripe webhook handling; updates `subscriptions` and `dealers_v2` tables and triggers n8n.
- `app/api/agent/start/route.ts` and `app/api/agent/stop/route.ts` — gate agent lifecycle calls behind subscription checks and call `N8N_WEBHOOK_URL`.
- `lib/supabase/server.ts` — server-side Supabase client factory (uses `SUPABASE_SERVICE_ROLE_KEY`). Returns a dummy client if env vars missing — important for local dev behavior.
- `lib/supabase/client.ts` — client-side Supabase singleton and `isSupabaseConfigured` feature flag.
- `lib/stripe.ts` — Stripe client setup and required env vars: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- `lib/actions.ts` — example of a server action (uses `"use server"`) and `revalidatePath('/settings')` to trigger Next.js cache invalidation.

Environment variables the agent must respect
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY — client-side Supabase.
- SUPABASE_SERVICE_ROLE_KEY — server-side Supabase privileged key (used in `lib/supabase/server.ts` and API routes).
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET — Stripe API and webhook verification (`lib/stripe.ts` and webhook route).
- STRIPE_BASIC_PRICE_ID, STRIPE_PRO_PRICE_ID — price IDs referenced in `lib/stripe.ts`.
- N8N_WEBHOOK_URL — optional; when present API routes call n8n endpoints to start/stop agents.

Coding and change patterns to follow (project-specific)
- API route patterns: use Next's Route Handler signatures (`export async function POST(req: NextRequest) { ... }`) and return `NextResponse.json(...)`.
- Error handling: code commonly logs errors via `console.error(...)` and returns JSON errors; follow the same style for consistency.
- Env fallbacks/dummies: many libs return safe dummy clients when envs are missing — do not assume presence of envs during local edits; add checks instead of hard-coding secrets.
- Server vs. client Supabase: use `lib/supabase/server.ts` for server-side operations (service-role key) and `lib/supabase/client.ts` for client components. The repo intentionally separates these to avoid leaking secrets.
- Database tables referenced: `dealers_v2`, `subscriptions`. When modifying DB interactions, search for these names to identify related logic.
- Revalidation: when changing server actions that update data, use `revalidatePath()` where present (e.g. `lib/actions.ts`) to keep pages in sync.

Development workflow notes
- Start dev server: `pnpm dev` (or `npm run dev` if pnpm not installed).
- Build: `pnpm build` / `npm run build` and start: `pnpm start` / `npm run start`.
- Lint: `pnpm lint` (`next lint`). Note `next.config.mjs` disables ESLint/TypeScript build blocking (`ignoreDuringBuilds`, `ignoreBuildErrors`).
- Local dev with missing envs: repository intentionally provides dummy clients (see `lib/supabase/*`) — many routes will still run but behave as no-op. For real integration testing, set envs locally (see list above).

Patterns for AI code edits
- Small UI changes: edit under `app/` and `components/`. Prefer TSX components and keep Tailwind utility classes consistent with `globals.css` and `components/ui/*` patterns.
- API changes: edit `app/api/*` route handlers. Preserve `NextRequest`/`NextResponse` handler signatures and existing error logging style.
- Adding server utilities: place helper code in `lib/` and export factories for reuse (`lib/supabase/*`, `lib/stripe.ts`). Keep secrets only in server-side files.
- Tests: no test suite detected — avoid adding large test scaffolding without approval.

Search tips for maintainers/agents
- Find Supabase usage: search for `dealers_v2` or `subscriptions`.
- Find n8n hooks: search `N8N_WEBHOOK_URL` or `/webhook/` in `app/api` handlers.
- Find revalidation: search for `revalidatePath(`.

Examples of typical code edits an agent might make
- Add a new API endpoint: create `app/api/<name>/route.ts` with exported `GET`/`POST` handlers returning `NextResponse.json`.
- Update subscription handling: modify `app/api/stripe/webhook/route.ts` and `lib/stripe.ts` and ensure `STRIPE_WEBHOOK_SECRET` verification remains.

When in doubt
- Prefer server-side secrets only under `lib/supabase/server.ts` or API routes.
- Run `pnpm dev` locally and test critical flows (login / checkout / webhook simulator) when touching integrations.

If you make edits, ask reviewers to verify:
- Env var changes and whether `lib/*` dummy fallbacks are still correct.
- Any downstream n8n webhook contracts (payload keys like `user_id` and `plan`).

Feedback request
- If any part of this guidance is incomplete or you want more detail for a specific area (e.g., database schema, n8n contract, or deployment steps), tell me which area and I will expand the instructions.
