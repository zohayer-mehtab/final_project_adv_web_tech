# Backend remediation report

## Audit baseline

The repository began on `main` at `6c76f60`, tracking `origin/main`. The only uncommitted change removed JSX comments in the product details page; the owner asked that it be included in this project work. GitHub showed `main` as the default branch. The backend initially built, but `npm test -- --runInBand` had nine failing suites out of ten because Jest could not resolve `src/...` imports and placeholder specs lacked dependencies. The root README described a different stack and an unsafe admin-registration path.

The configured PostgreSQL schema was inspected read only before writing migrations. It had the three expected tables, six users, no case-insensitive duplicate email groups, and no migration history table. The configured database was not migrated or reset. Temporary databases used for tests were created and removed by those tests.

## Findings and fixes

| Finding | Resolution |
| --- | --- |
| Public registration accepted `admin` | Added buyer/vendor-only registration DTO and service allowlist. Kept managed creation behind JWT and ADMIN guards. |
| Self-service update inherited role and other privileged fields | Replaced inheritance with an explicit profile DTO and service update allowlist. |
| User and order entities exposed credential fields through responses | Added user and order projections in services; tested serialized HTTP bodies. |
| Reset codes were stored in plaintext and reusable logic was not atomic | Stored keyed hashes, enforced expiry, consumed with a conditional database update, and tested invalid, expired, and reused codes. |
| Six digit reset codes could collide across accounts | Added a partial unique index on stored hashes and collision retry before mail delivery. |
| Reset requests revealed account existence and swallowed mail failures | Unified public responses, cleared codes after delivery failure, and logged generic failures. |
| Login and reset endpoints had no request limits | Added process-local per-IP fixed-window limits. |
| JWT authorization trusted a possibly stale role claim | Resolved current role and vendor approval from the database on guarded requests. |
| TypeORM synchronized schema at startup | Disabled synchronization and added explicit migration commands and migrations. |
| Email uniqueness relied on a precheck | Added a case-insensitive unique index and safe `23505` conflict handling. |
| Order stock checks could race | Moved conditional stock reservation and order insertion into one transaction. |
| Parameter and numeric validation was incomplete | Added integer and UUID parameter pipes, positive IDs, integer stock, and two-decimal price validation. |
| Placeholder tests did not exercise behavior | Replaced them with service and controller behavior checks; added HTTP, database, concurrency, and e2e tests. |
| Backend lint reported 400 findings | Formatted backend TypeScript, typed request and mail boundaries, and scoped dynamic-test lint rules to spec files. Production source retains type-aware lint rules. |
| Frontend reset wording contradicted neutral API response; TypeScript build failed | Updated the message and repaired page types without changing the UI flow. |

## Files changed

The source changes are concentrated in:

- `nestJS_backend/src/auth/`: controller, service, JWT strategy, module, rate-limit guard, DTOs, and tests.
- `nestJS_backend/src/users/`: controller, service, entity, profile and response DTOs, and tests.
- `nestJS_backend/src/orders/`: controller, service, order response DTO, entity type metadata, and tests.
- `nestJS_backend/src/products/`: controller, product DTO, entity type metadata, and tests.
- `nestJS_backend/src/database/`: TypeORM data source, three migrations, and isolated PostgreSQL tests.
- `nestJS_backend/src/app.module.ts`, `nestJS_backend/src/common/`, `nestJS_backend/eslint.config.mjs`, `nestJS_backend/package.json`, `nestJS_backend/package-lock.json`, `nestJS_backend/test/`, and `nestJS_backend/README.md`.
- `b2b-frontend/app/page.tsx`, `app/products/[id]/page.tsx`, `app/register/page.tsx`, `app/forgot-password/page.tsx`, and `app/reset-password/page.tsx`.
- Root `README.md`, this report, and `docs/CASE_STUDY.md`.

## Checks executed

| Command and directory | Result |
| --- | --- |
| `npm run build` in `nestJS_backend` | Passed; SWC compiled the backend. |
| `npx tsc --noEmit` in `nestJS_backend` | Passed. |
| `npm test -- --runInBand` in `nestJS_backend` | Passed: 14 suites, 30 tests including order concurrency and reset-code collision coverage in the final integration check. |
| `npm run test:e2e -- --runInBand` in `nestJS_backend` | Passed: 1 suite, 1 real-app flow on a temporary database. |
| `npm test -- --runInBand migrations.spec.ts` in `nestJS_backend` | Passed: migration, uniqueness, concurrent registration, reset consumption, and stock concurrency in a temporary database. |
| `npm run migration:show` in `nestJS_backend` | Passed; all three migrations pending on the configured database. No migration run there. |
| `npx tsc --noEmit --pretty false` in `b2b-frontend` | Passed after typing fixes. |
| `npm run build` in `b2b-frontend` | Passed after typing fixes; 16 pages generated. |
| `npm run lint` in `nestJS_backend` | Passed after focused source typing, formatting, and spec-file lint rules. The script does not mutate source. |

The final integration branch will be rerun through the relevant build and test commands before merge. An earlier frontend build failed on TypeScript errors; that result was resolved by the frontend compatibility commit. An initial sandboxed build also hit a Next.js worker-spawn restriction; the permitted retry reached TypeScript and later passed.

## Publication and secret review

The local `nestJS_backend/.env` is ignored by Git and has never appeared in tracked history. A tracked-source and Git-history scan found no private-key blocks, recognized cloud/GitHub/OpenAI token patterns, or credential-bearing PostgreSQL URLs. The scan reports path categories only and did not print secret values. No database rows or credentials were included in commits.

## Remaining limits and unverified checks

- The configured application database has not had the pending migrations applied. Fresh migration behavior was verified in temporary PostgreSQL databases; production migration planning remains an operator task.
- Real SMTP delivery was not tested. The mail transport was mocked in e2e tests, while failure propagation and neutral responses were tested.
- Rate limiting is per process and per IP; it is not distributed. JWTs have a one-day lifetime with no refresh or general revocation mechanism.
- The reset response is content-neutral, but SMTP timing can still differ between known and unknown addresses. A durable asynchronous mail queue would improve this.
- The initial administrator needs controlled operator provisioning. Order cancellation is not yet transactional.
- No deployment, load test, browser automation, or production security assessment was performed.
