# AGENTS.md

## Project

- Userscript (Tampermonkey/Violentmonkey) that rebrands the Université d'Artois ENT (CAS/uPortal) entirely client-side: no server changes.
- `@match` is `https://*.univ-artois.fr/*`, but `src/main.ts` only injects styles/viewport/language and mutates the DOM when a page in `src/pages/index.ts` matches. Unregistered pages must stay untouched.
- Current pages: `cas-login` and `cas-logout`.
- Use Bun 1.4.2 (`packageManager`); `bun.lock` is the only lockfile, is tracked, and must be committed with dependency changes. Do not use npm/yarn/pnpm.

## Commands

- `bun install` — install dependencies.
- `bun run dev` — Vite dev server; auto-opens the userscript install page (`vite-plugin-monkey`).
- `bun run build` — `tsc` (src only) then Vite build to `dist/artois-university-rebranding.user.js`.
- Full verification, in CI order: `bun run lint && bun run format:check && bun run typecheck && bun run test && bun run build`. CI runs this after `bun install --frozen-lockfile`.
- `bun run typecheck` checks both `src` (`tsconfig.json`) and `vite.config.ts`/`vitest.config.ts` (`tsconfig.node.json`); `bun run build` only typechecks `src`.
- Single test file: `bunx vitest run src/pages/cas-login/cas-login.test.ts`; filter by name with `-t "<name>"`.
- Single-file fixes: `bunx eslint <file> --fix`, `bunx prettier --write <file>`. Whole-repo: `bun run lint:fix`, `bun run format`.
- `bun run hooks:install` installs Lefthook pre-commit hooks (ESLint `--fix` + Prettier on staged files).

## Architecture

- `src/core/` is the generic runtime (router, page runner, DOM helpers, logger); `src/pages/` holds page-specific transforms; `src/shared/` holds cross-page helpers/assets.
- A page is `src/pages/<page>/<page>.ts` exporting `{ id, match, preflight?, steps } satisfies Page`; register it in `src/pages/index.ts` ordered most-specific first (`resolvePage` returns the first match). Use `matchers.host` (exact hostname), `matchers.path`, and `matchers.all`.
- Keep `preflight` read-only. It must throw (usually via `requireElement`) when critical DOM is missing; then no step runs and the page is left untouched.
- Steps run in order, each in its own `try/catch`: one failure yields `status: "partial"` but later steps still run.
- `runPage` is idempotent via `<html data-rebranding-applied="<page id>">`; page `id` must be unique. A failed preflight leaves no guard (retryable); a partial run keeps it, so reload to retry.
- Templates are Preact `.tsx` rendered to strings with `preact-render-to-string`; they are never mounted. Keep DOM mutation in page steps.
- `cas-logout` redirects only to HTTPS `univ-artois.fr` hosts (apex or subdomain) and falls back to the ENT login page; keep that allowlist behavior.

## Testing

- Vitest + jsdom. `include` is `src/**/*.test.ts`, so tests must be `.test.ts`; a `.test.tsx` is silently ignored.
- Page tests typically load fixtures with `?raw` from `src/pages/<page>/__fixtures__/`, call `runPage(page, silentLogger)`, and assert on `report.status` (`ok`/`partial`/`aborted`). See `src/pages/cas-login/cas-login.test.ts`.
- In `beforeEach`, reset the idempotency guard (`delete document.documentElement.dataset.rebrandingApplied`), root class, body class/style, and relevant `<head>` state (e.g. favicons), or tests see the previous run's DOM.
- jsdom does not implement navigation; inject a location-like object (as `redirectToService` does) instead of calling `window.location.replace`.
- Pure page logic (e.g. `resolveLogoutRedirect`) can be tested directly without a fixture.
- The CAS fixture is a simplified copy of the real legacy markup; keep it representative when selectors change.
- Anonymize fixtures and screenshots; never include real personal data.

## Styling and assets

- Tailwind CSS 4 via `@tailwindcss/vite`; there is no `tailwind.config.*`. `src/style.css` imports `tailwindcss/theme.css` and `tailwindcss/utilities.css` with `prefix(tw)` and `important`; replacing them with `@import "tailwindcss"` would drop that setup.
- Use the `tw:` prefix for utilities; Tailwind 4's important modifier is trailing (`tw:w-full!`).
- Custom rules must stay nested under `.artois-rebranding` so they cannot leak to unsupported pages.
- Theme tokens are duplicated in `.artois-rebranding` and `@theme` (the `tw` prefix rewrites them to `--tw-*`); keep both lists in sync.
- Assets are inlined: `?inline` for CSS/font/logo, `?raw` for fixtures and SVG icons. The only runtime fetch is jQuery, loaded from jsDelivr as a userscript `@require`; it is not bundled.
- Userscript metadata is assembled in `vite.config.ts`; `version`/`description`/`author`/URLs come from `package.json`, so bump `version` there for releases.
- Icons: add the Papicons SVG under `src/shared/icons/papicons/`, import it `?raw`, and add it to the `icons` map in `src/shared/icons/index.tsx`. Use `<Icon>` in TSX or `renderIcon()` in string templates. The sprite is injected once; icons are `aria-hidden`. Tests require a 24×24 viewBox and `fill="currentColor"`; keep the Papicons LICENSE/attribution.

## Conventions

- Product rule: modernize existing elements only. Do not add features, links, or userscript-specific content; accessibility fixes are the exception.
- Never intercept forms, read/submit credentials, add telemetry, or bypass security. Logs use `[rebranding]` and `debug`/`info` are gated by dev mode or `?rebranding-debug`.
- User-facing copy is French. Preserve accessibility: labels, ARIA, focus-visible, and `prefers-reduced-motion`.
- This is an unofficial project; do not imply university endorsement.
- Prettier: 100 columns, double quotes, semicolons, trailing commas, 2 spaces, LF.
- `dist/` is generated and gitignored; never edit it by hand.
- `README.md` (French) has the full page-adding walkthrough, design tokens, and troubleshooting. Keep it updated when commands, scope, or behavior change, but trust code/config when they conflict.
