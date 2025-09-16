# CLAUDE.md

**🚨 CRITICAL: ALWAYS START HERE - READ THIS FIRST 🚨**

**MANDATORY WORKFLOW FOR EVERY TASK - DO NOT SKIP TO IMPLEMENTATION**

For EVERY request involving code changes, you MUST follow this exact sequence:
1. **PHASE 1 — PLAN**: Present structured plan, WAIT for approval
2. **PHASE 2 — APPROVAL**: Wait for explicit "APPROVE PLAN" or "Proceed"
3. **PHASE 3 — APPLY**: Make changes, run lint/tests
4. **PHASE 4 — COMMIT**: Stage specific files, show diff, get approval

**DO NOT make any code changes without completing PHASE 1 and getting approval first.**


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NPTFC Backend is an ASP.NET Core 8.0 Web API for a football club management system. It handles fixtures, players, teams, game statistics, and league data for different age groups (Tigers, Lions, Panthers).

## Development Commands

### Build and Run
- **Build**: `dotnet build --configuration Release`
- **Run locally**: `dotnet run`
- **Publish**: `dotnet publish -c Release -o ./publish`

### Database Operations
- **Add migration**: `dotnet ef migrations add <MigrationName>`
- **Update database**: `dotnet ef database update`
- **Remove migration**: `dotnet ef migrations remove`

## Architecture

### Database Context
- **DatabaseContext** (`database/DBContext.cs`): Main EF Core context with DbSets for all entities
- Uses SQL Server with connection string in `appsettings.json`
- Entity relationships configured in `OnModelCreating`

### Core Models
- **Player** (`models/Player.cs`): Player information with position and game statistics
- **Team** (`models/Team.cs`): Teams with flags for Tigers/Lions/Panthers
- **Fixture** (`models/Fixture.cs`): Match fixtures with scores and dates
- **Season** (`models/Season.cs`): Season definitions with age groups and divisions
- **GameStat** (`models/GameStat.cs`): Individual player statistics per fixture
- **League** (`models/League.cs`): League table data

### Controllers
All controllers follow standard REST API patterns:
- **PlayersController**: CRUD operations for players
- **TeamsController**: Team management
- **FixturesController**: Fixture management
- **GameStatsController**: Player statistics
- **LeagueController**: League table operations
- **TigersFixturesController**: Tigers-specific fixtures

### DTOs
DTOs in `/DTO` folder handle data transfer:
- **FixtureDTO**: Fixture data transfer
- **LeagueResult**: League table results
- **GameStatDTO**: Game statistics transfer
- **FantasyStatDTO**: Fantasy league statistics

### Enums
- **Position**: Player positions (GK, DEF, MID, ATT)
- **GameType**: Type of game
- **GameLocation**: Home/Away
- **ResultType**: Win/Loss/Draw
- **WhoWon**: Match outcome

## Configuration

### Connection String
Database connection is configured in `appsettings.json` pointing to Azure SQL Database.

### CORS
CORS is configured to allow requests from `http://localhost:3000` (React frontend).

### Swagger
Swagger UI is enabled for API documentation at `/swagger`.

## Deployment

The project uses GitHub Actions for CI/CD to Azure Web App:
- Builds on `main` branch push
- Publishes to Azure Web App `nptfc-backend`
- Uses .NET 8.x runtime

## Project Structure

```
/Controllers     - API controllers
/models          - Entity models
/DTO             - Data Transfer Objects
/enums           - Enumerations
/database        - Database context
/Migrations      - EF Core migrations
```

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
- After edits, always fix issues until clean  

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

### WRAP-UP
- Ask: "Are we done with this subject?"
- If yes: run /clear to reset context (or instruct me to do so if I must run it).