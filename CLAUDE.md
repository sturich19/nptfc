# CLAUDE.md

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