# Project Guidelines

## Code Style
- Use TypeScript throughout and keep imports aligned with the existing alias pattern: `@/` maps to `src/` (see `tsconfig.json`).
- Follow existing Next.js App Router structure under `src/app` and keep route code colocated with route folders.
- Keep client/server boundaries explicit:
  - Add `'use client'` only for interactive components.
  - Add `'use server'` for Server Actions.
  - Keep server-only utilities in files that import `server-only` (see `src/lib/appwrite.server.ts`).
- Preserve current lint conventions configured in `eslint.config.mjs`.

## Architecture
- Framework: Next.js App Router with React + TypeScript.
- Core route areas:
  - Citizen flows in `src/app/auth`, `src/app/report`, `src/app/dashboard`, `src/app/verification`.
  - Spatial map UI in `src/app/map` with map components in `src/components/map`.
  - Shared landing components in `src/components`.
- Business logic is primarily in Server Actions under `src/app/actions`:
  - Auth/session logic in `src/app/actions/auth.ts`.
  - Grievance lifecycle in `src/app/actions/grievance.ts`.
  - AI integrations in `src/app/actions/ai.ts`.
  - Geocoding in `src/app/actions/geo.ts`.
  - Profile operations in `src/app/actions/profile.ts`.
- Integration layer is in `src/lib`:
  - Appwrite clients and session bridge in `src/lib/appwrite.server.ts` and `src/lib/appwrite.ts`.
  - Validation/sanitization in `src/lib/security.ts`.
  - Environment access in `src/lib/env.ts`.
  - AI providers in `src/lib/gemini.ts` and `src/lib/sarvam.ts`.
  - Rate limiting in `src/lib/ratelimit.ts`.

## Build and Test
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`
- Tests: no test script is currently defined in `package.json`; do not claim test runs unless a test command is added.

## Conventions
- Server Action response contract: prefer structured objects like `{ success: boolean, ... }` instead of throwing for expected failures.
- Keep action hardening pattern used in `src/app/actions/grievance.ts`:
  - Apply rate limiting early.
  - Validate with Zod schemas from `src/lib/security.ts`.
  - Sanitize user-facing string fields.
  - Use bounded retries for flaky external calls.
- For Appwrite session handling, use `getServerSession()` from `src/lib/appwrite.server.ts` rather than re-implementing cookie parsing.
- Be careful with serialization across server/client boundaries; preserve existing plain-object return patterns where used.
- Environment variables:
  - Keep server secrets server-side.
  - Use `NEXT_PUBLIC_` variants only for values required by browser code.
  - Follow access patterns already centralized in `src/lib/env.ts`.

## Key References
- High-level project and setup: `README.md`
- Product/feature scope: `PRD.MD`
- Current status and roadmap snapshot: `current_situation.md`
- Example server action implementation pattern: `src/app/actions/grievance.ts`
