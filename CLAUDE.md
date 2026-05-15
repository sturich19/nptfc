# CLAUDE.md

**🚨 CRITICAL: ALWAYS START HERE - READ THIS FIRST 🚨**

**MANDATORY WORKFLOW FOR EVERY TASK - DO NOT SKIP TO IMPLEMENTATION**

For EVERY request involving code changes, you MUST follow this exact sequence:
1. **PHASE 1 — PLAN**: Present structured plan, WAIT for approval
2. **PHASE 2 — APPROVAL**: Wait for explicit "APPROVE PLAN" or "Proceed"
3. **PHASE 3 — APPLY**: Make changes, run lint/tests
4. **PHASE 4 — COMMIT**: Stage specific files, show diff, get approval

**DO NOT make any code changes without completing PHASE 1 and getting approval first.**

---

This is the NPTFC monorepo. It contains the React frontend and ASP.NET Core backend for the Newport Pagnell Tigers Football Club app.

## Structure

```
/frontend    - React 18 TypeScript app (Create React App)
/backend     - ASP.NET Core 8.0 Web API
```

## Commands

### Frontend (`/frontend`)
- `npm start` - Start dev server (http://localhost:3000)
- `npm run build` - Production build
- `npm test` - Run tests (Vitest)

### Backend (`/backend`)
- `dotnet run` - Start API
- `dotnet build --configuration Release` - Build
- `dotnet test` - Run tests
- `dotnet ef migrations add <Name>` - Add EF migration
- `dotnet ef database update` - Apply migrations

## Architecture

### Frontend
- **Tech**: React 18, TypeScript, Material-UI, Bootstrap 5, Auth0, React Router v6, Axios
- **Key folders**: `src/pages`, `src/components`, `src/services`, `src/objects`, `src/utils`
- **Tests**: Vitest + React Testing Library, co-located in `__tests__` dirs

### Backend
- **Tech**: ASP.NET Core 8.0, Entity Framework Core, SQL Server (Azure)
- **Key folders**: `Controllers/`, `models/`, `DTO/`, `Services/`, `database/`, `Migrations/`
- **CORS**: Configured for `http://localhost:3000`
- **Auth**: Auth0 JWT bearer tokens

### Data Models
Player, Team, Fixture, Season, AgeGroup, GameStat, FantasyStat, TigersFixture

## Deployment
- **Frontend** → Azure Web App `nptfc-tigers` via GitHub Actions on push to `master` (path: `frontend/**`)
- **Backend** → Azure Web App `nptfc-backend` via GitHub Actions on push to `master` (path: `backend/**`)

## Development Workflow

### PHASE 1 — PLAN (default)
- Always start with /plan and WAIT for approval before changing code.
- Output a concise plan with this structure:
  PLAN:
  - Goal:
  - Context I'm using:
  - Assumptions / Unknowns (ask at most 3 crisp questions if blocking):
  - Approach (steps):
  - Risks & Rollback:
  - Affected files:
  - Acceptance checks (how we know it works)
- Do not modify files in PLAN phase.

### PHASE 2 — APPROVAL
- Wait for explicit message: "APPROVE PLAN" (or "Proceed").

### PHASE 3 — APPLY
- Make changes exactly per the approved plan.
- Frontend: run prettier after edits
- Backend: run `dotnet build` after edits

### PHASE 4 — COMMIT
- Stage ONLY the files changed in APPLY phase.
- Show staged diff and ask for confirmation before committing.
- On approval, commit with conventional commit message.
- Push to origin master.

### GUARDRAILS
- If instructions are ambiguous or risky, ask one targeted question in PLAN.
- Never proceed without explicit approval after PLAN.
