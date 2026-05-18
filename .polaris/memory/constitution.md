# Project Constitution

**Project**: Newport Pagnell Tigers FC (nptfc)
**Date**: 2026-05-18
**Version**: 1.0
**Path**: `.polaris/memory/constitution.md`

---

## Project Identity

- **Name**: nptfc
- **Display Name**: Newport Pagnell Tigers Football Club
- **Purpose**: Football club management web app - fixtures, player stats, league tables, fantasy stats, and admin CRUD for the Newport Pagnell Tigers youth teams (Tigers, Lions, Panthers age groups).
- **Primary Languages**: TypeScript 4.9+ (frontend), C# / .NET 8 LTS (backend)
- **Frontend Test Framework**: Vitest + React Testing Library
- **Backend Test Framework**: xUnit (dotnet test)
- **Deployment**: Azure Web Apps via GitHub Actions on push to `master`

---

## Technical Standards

### Languages and Frameworks

- **Frontend**: React 18 with TypeScript 4.9+, built with Create React App (react-scripts)
  - UI: Material-UI v5 + Bootstrap 5
  - Auth: Auth0 (`@auth0/auth0-react`)
  - Routing: React Router v6
  - HTTP: Axios
  - Forms: Formik
- **Backend**: ASP.NET Core 8.0, C# (.NET 8 LTS)
  - ORM: Entity Framework Core 8 (SQL Server provider)
  - Database: Azure SQL Server
  - Auth: Auth0 JWT bearer tokens
  - Docs: Swagger (Swashbuckle)

### Testing

- **Frontend coverage target**: 80% for components with admin/mutation logic
- **Frontend**: `npm test` (Vitest, co-located `__tests__` directories)
- **Backend**: `dotnet test`
- All tests must pass before review. No merging with failing tests.
- Centralized mock data lives in `frontend/src/__mocks__/test-data.ts`.

### Performance and Scale

Single-tenant club app. No high-throughput requirements. API responses under 500ms is acceptable. No caching infrastructure required initially.

### Deployment

- **Frontend** -> Azure Web App `nptfc-tigers` (GitHub Actions, push to `master`, path `frontend/**`)
- **Backend** -> Azure Web App `nptfc-backend` (GitHub Actions, push to `master`, path `backend/**`)
- Push to `master` triggers deployment. No staging environment currently.

---

## Security and Audit Baseline

### Data Classification

**Tier: Internal / Confidential**

The application stores player names, ages, positions, and club membership data (youth players). This is personal data for minors. While not payment or medical data, it must be treated as Confidential due to child data protection obligations (GDPR UK, children's data).

No passwords stored - all authentication delegated to Auth0.

### Audit Logging

The following events MUST be logged:

- Authentication outcomes (Auth0 handles auth events; application logs successful/failed API access)
- All write operations on Confidential data: player create/update/delete, fixture create/update/delete, game stat create/update/delete
- Admin actions: any operation that changes player personal data
- Retention: 1 year minimum

Audit logs: currently implicit in Azure App Service logs. When a dedicated audit log is implemented, it must be append-only and stored separately from the main SQL database.

### Authentication and Authorization

- **AuthN**: Auth0 OIDC/OAuth2. JWT bearer tokens validated on every API request.
- **AuthZ**: Role-based. Admin role required for all write (POST/PUT/DELETE) operations. Public read operations are authenticated but not role-restricted.
- **Default-deny**: Any unauthenticated or unauthorized request is denied with 401/403.
- **Principal source**: JWT claims from Auth0 token (validated via `Microsoft.AspNetCore.Authentication.JwtBearer`).
- CORS: Locked to `http://localhost:3000` in development. Production frontend origin must be configured explicitly.

### Threat Surface

| Boundary | PII/Child Data Exposure | Notes |
|----------|------------------------|-------|
| Public HTTP REST API (ASP.NET Core) | Yes - player names, ages | JWT auth required; admin role for mutations |
| Auth0 (external IdP) | Yes - email/profile | Managed by Auth0; not in-app |
| Azure SQL Server | Yes - all club data | Access restricted to backend service identity |
| GitHub Actions CI/CD | Secrets (connection strings, deployment creds) | Use GitHub Secrets; never commit credentials |

No file upload, no webhooks, no message queue, no scheduled jobs consuming external data. Single-tenant (one club).

---

## Code Quality

### PR and Review Requirements

- 1 approval required before merge to `master`
- All GitHub Actions CI checks must pass (build + test)
- No committing directly to `master` for feature work

### Review Checklist

- [ ] Tests pass (`npm test` and `dotnet test`)
- [ ] No hardcoded credentials, connection strings, or Auth0 secrets
- [ ] CORS config not widened beyond required origins
- [ ] Player/personal data access requires authentication
- [ ] No new dependencies with LGPL/GPL/AGPL licenses

### Quality Gates

- Frontend: `npm run build` must succeed
- Backend: `dotnet build --configuration Release` must succeed
- No TypeScript `any` without explicit justification comment
- EF Core migrations must be reviewed before applying to production database

### Documentation Standards

- CLAUDE.md files maintained at root, `frontend/`, and `backend/` levels
- No inline comments explaining what the code does - only comments for non-obvious WHY
- Swagger auto-documents the API; no manual API docs required

---

## Tribal Knowledge

### Conventions

- Frontend services are `*-service.tsx` files under `src/services/` - one file per domain entity
- Backend follows standard REST controller pattern: one controller per entity, standard CRUD routes
- Atoms (`src/atoms/`) are purely reusable UI primitives; components (`src/components/`) are domain-specific
- All TypeScript interfaces/types live in `src/objects/`
- `react-scripts` on Windows may need execute permission: `git update-index --chmod=+x node_modules/.bin/react-scripts`
- Build script runs tests: `npm run build` = build + test. Use `npm run build:only` for build without tests.

### Known Constraints

- The backend `.csproj` excludes `nptfcBE.Tests/` from compilation - tests are in a separate test project
- `InvariantGlobalization` is disabled (needed for EF Core SQL Server provider on Azure)
- Auth0 configuration lives in `appsettings.json` and environment variables - never commit real Auth0 secrets

### Historical Decisions

- Monorepo structure with `frontend/` and `backend/` subtrees merged via `git subtree` (see git log)
- GitHub Actions workflows live at root `.github/workflows/` after monorepo restructure
- Material-UI and Bootstrap coexist; Bootstrap used for layout grid, MUI for component-level UI

---

## Governance

### Amendment Process

Constitution is amended via PR to `master`. Changes to security baseline (Section 3) require explicit review comment from the project owner before merge.

### Compliance

- GDPR UK applies: player data belongs to minors. Do not expose player PII in unauthenticated endpoints.
- No payment processing. No PHI.
- License compliance: allowed licenses for dependencies are Apache-2.0, BSD-2/3-Clause, MIT, ISC, PSF-2.0, Unlicense, 0BSD, CC0-1.0. Prohibited: LGPL, AGPL, GPL, SSPL, BSL, CPAL, EUPL, MPL-2.0.

### Exceptions

Case-by-case basis via PR discussion. Document the exception rationale in the PR description and update this constitution if the exception becomes permanent.

---

## Model Selection

Claude Code operates in two phases within any Polaris workflow. Use the right model for each.

### Plan Phase -> Opus

When reading specs, synthesizing the architecture, deciding what to build and how it connects:
use claude-opus-4-6. Planning mistakes compound through every line of code that follows.
Opus-level reasoning here is insurance, not indulgence.

Polaris planning commands: /polaris.specify, /polaris.plan, /polaris.tasks

### Implementation Phase -> Sonnet

When writing code, calling tools, executing against a defined plan:
use claude-sonnet-4-6. Implementation is where call volume lives - this is where savings compound.

Polaris implementation commands: /polaris.implement, /polaris.autopilot, /polaris.runtests

### When Implementation Hits Unexpected Complexity

Do not reason through ambiguity or contradiction at Sonnet level. Stop the step, describe what
is unexpected, and surface it:

REPLAN NEEDED: [one sentence - what was unexpected]
SPEC REFERENCE: [which spec/section the assumption came from]
OPTIONS: [2-3 ways to resolve, with tradeoffs]

Re-enter the plan phase (Opus) with the updated context before continuing.
Never self-escalate the model mid-implementation.

---

## License Compliance

Allowed: Apache-2.0, BSD-2-Clause, BSD-3-Clause, MIT, ISC, PSF-2.0, Unlicense, 0BSD, CC0-1.0
Prohibited: LGPL, AGPL, GPL, SSPL, BSL, CPAL, EUPL, MPL-2.0
