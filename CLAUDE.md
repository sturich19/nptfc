# CLAUDE.md

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

This is a React TypeScript application for NPTFC (North Park Tigers Football Club) built with Create React App.

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