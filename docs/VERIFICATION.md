# Foundation verification — 2026-10-14

## Passed

| Check | Result |
| --- | --- |
| Root dependency installation | 375 packages installed from cached, real releases; package-lock.json generated |
| Clean `npm ci` using the writable offline cache | Passed; 375 packages installed from the lockfile |
| `npm run check` | ESLint with zero warnings and strict TypeScript checking passed |
| `npm run build` | Optimized Next.js 16.2.10 production build passed; `/` and `/_not-found` statically rendered |
| `npm run start -- --hostname 127.0.0.1 --port 3000` | Production server ready |
| Production HTTP smoke | Homepage 200; compiled CSS 200; unknown route 404; hero, title, section targets, development disclosure, and return-home link present |
| `npm run dev -- --hostname 127.0.0.1 --port 3000` | Development server ready |
| Development HTTP smoke | Same HTTP/content checks passed |

The HTTP check is retained as `npm run smoke`. These checks establish that the
application builds and serves correctly; they do not establish browser hydration,
visual fidelity, mobile layout behavior, or an accessibility audit.

## Blocked or incomplete

- The environment disables outbound network access. Direct npm registry requests
  fail, even though read-only documentation browsing is available through tools.
- `npm --prefix tests install --offline` failed with ENOTCACHED for Vitest. Vitest
  and Playwright binaries are not installed, and Chromium was not downloaded.
- `npm test` and `npm run test:e2e` were attempted and failed because their
  executables are unavailable. No unit or browser tests are reported as passing.
- The test package has no lockfile yet. Generate and commit tests/package-lock.json
  after `npm run test:install` succeeds on a network-enabled machine.
- Auth.js compatibility was checked against official documentation and the current
  source manifest only; published registry and runtime integration verification
  remain for the approved authentication phase.
- `npm ls --depth=0` exits successfully but reports five additional optional WASM
  helper packages as extraneous after both install and clean ci. The declared
  root dependency versions are present; this did not block lint, types, build,
  or startup. No dependency audit could be completed without registry access.
- Automatic approval review rejected cleanup because required sandbox approval is
  disabled. `D:\Coolearn\.npm-cache` remains outside the application (approximately
  3 GB); it is not needed for a normal network-enabled installation and may be
  removed manually. Ignored temporary scripts remain in .verification/. The
  verification servers were stopped.

## Resolved setup issues

- PowerShell blocks npm.ps1 under its execution policy. Used npm.cmd, without
  changing system policy.
- The cached create-next-app CLI fails at `uv_os_get_passwd` with ENOMEM in the
  restricted Windows environment. Initialized the standard App Router structure
  manually following official Next.js guidance instead.
- npm requires a writable cache. Used a temporary copy outside the project;
  prepared its metadata to resolve only real tarballs present in that cache.
  This changes local cache selection, not package contents or published dependencies.
- Initial lint caught an anonymous PostCSS export; changed it to a named config.
- Initial prerender caught buttonVariants being exported across a client boundary;
  removed the unnecessary wrapper directive, matching the server-compatible
  official Base UI component pattern. The final build passed.

## Finish the remaining foundation checks

On a machine with npm network access:

```powershell
npm.cmd ci
npm.cmd run test:install
npm.cmd test
npm.cmd --prefix tests run browsers:install
npm.cmd run test:e2e
```

Review desktop/mobile screenshots and accessibility before calling Phase 1 fully
browser-verified. No later product phase has been implemented.
