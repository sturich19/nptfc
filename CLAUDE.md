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

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` - Start development server (opens at http://localhost:3000)
- `npm run build` - Build for production
- `npm test` - Run tests (currently returns "No tests" message)

### Special Notes
- If you encounter "permission denied" errors with react-scripts on Windows, run: `git update-index --chmod=+x node_modules/.bin/react-scripts`
- Uses cross-env for environment variable handling across platforms

## Architecture

This is a React TypeScript application for NPTFC (Newport Pagnell Tigers Football Club) built with Create React App.

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **UI Libraries**: Material-UI (@mui/material, @mui/icons-material), Bootstrap 5
- **Authentication**: Auth0 (@auth0/auth0-react)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Form Handling**: Formik
- **Analytics**: Microsoft Clarity

### Project Structure

#### Core Application Flow
- `src/index.tsx` - Entry point with Auth0Provider wrapper
- `src/App.tsx` - Main app component handling authentication flow
- `src/routes/routes.tsx` - All route definitions using React Router v6
- `src/pages/layout.tsx` - Layout wrapper with header and outlet for child routes

#### Authentication
- Uses Auth0 for authentication
- All pages require authentication (redirects to login if not authenticated)
- Authentication state managed in `src/authentication/auth0-provider-with-navigate.js`

#### Page Organization
- **Core Pages**: Home, Players, Age Groups
- **Fixtures & League**: Tigers fixtures, league tables, league fixtures with history
- **Admin Pages**: Complete CRUD operations for seasons, players, teams, fixtures, game stats
- **Season Management**: Season view with detailed statistics

#### Component Architecture
- **Atoms**: Reusable UI components (buttons, cards, headers, textfields, toolbar, drawer)
- **Components**: Complex components (fixtures, fantasy stats, league tables, season summaries)
- **Pages**: Route-level components
- **Services**: API communication layer for all entities
- **Objects**: TypeScript interfaces/types for data models
- **Utils**: Helper functions for dates, formatting, seasons, fixtures

#### Data Models
Key entities include: Player, Team, Fixture, Season, AgeGroup, GameStat, FantasyStat, TigersFixture

#### Services Layer
Each major entity has its own service file for API operations:
- `*-service.tsx` files handle HTTP requests to backend APIs
- Services cover: league tables, players, teams, fixtures, seasons, age groups, game stats, fantasy stats

#### Styling
- Uses a mix of CSS modules and global CSS
- Bootstrap 5 for layout and components
- Material-UI components with custom styling
- Component-specific CSS files alongside components

## Development Workflow

You are a careful, collaborative coding assistant. Follow this workflow for every task.

### PHASE 1 — PLAN (default)
- Always start with /plan and WAIT for approval before changing code.
- Output a concise plan with this structure (no hidden thoughts):
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
- Wait for my explicit message: "APPROVE PLAN" (or "Proceed").
- If I request "High-impact changes", show a one-line summary of why they're high-impact and ask:
  "Proceed with HIGH-IMPACT CHANGES? yes/no"
- Never claim or imply any safety policy is disabled. Continue to follow all safety rules.

### PHASE 3 — APPLY
- Make changes exactly per the approved plan.
- After edits, always:
  1) run pretty
  2) fix issues until clean
  3) run the playwright tests. Ask the user if they want to run these now.

### PHASE 4 — COMMIT
- Stage ONLY the files changed in APPLY phase (never blanket stage all files).
  Example: `git add path/to/file1 path/to/file2`
- Show me the staged diff and ask for confirmation before committing.
- On my approval, commit with a conventional commit message:
  `git commit -m "feat: <short summary of change>"`
- If commit fails (e.g., conflicts, hooks), STOP and prompt me for resolution before retrying.
- After successful commit, push the branch to origin:
  `git push origin <branch-name>`
- If push fails, STOP and inform the user of the issue before proceeding.

### GUARDRAILS
- If instructions are ambiguous or risky, ask one targeted question in PLAN.
- Never proceed without explicit approval after PLAN.
- If tools like "add translation", "run pretty", or "run lint" aren't available, say so and propose alternatives.

### WRAP-UP
- Ask: "Are we done with this subject?"
- If yes: run /clear to reset context (or instruct me to do so if I must run it).