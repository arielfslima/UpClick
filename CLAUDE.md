# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UpClick is a full-stack application that integrates with ClickUp to manage development team tasks, track points per developer, and generate weekly payout reports. The system syncs tasks from ClickUp and maintains a local database for tracking and reporting.

## Architecture

### High-Level Data Flow

1. **ClickUp → Backend**: Tasks are synced via ClickUp API (manual trigger or webhooks)
2. **Backend → Database**: Tasks and developers are stored in PostgreSQL via Prisma
3. **Backend → Frontend**: React app fetches data through REST API
4. **Points Tracking**: System calculates developer points based on assigned open tasks

### Service Layer Architecture (Backend)

The backend uses a three-service architecture:

- **clickup.service.ts**: ClickUp API client wrapper (fetching tasks, lists, spaces, webhook management)
- **database.service.ts**: Prisma client singleton
- **sync.service.ts**: Orchestrates syncing ClickUp data to local database

**Key Sync Logic** (sync.service.ts):
- `syncAllTasks()`: Fetches all tasks from all lists in the configured ClickUp space
- `syncTask()`: Upserts individual task with all related data (developers, tags, custom fields)
- `updateDeveloperPoints()`: Recalculates developer's total points from assigned open tasks
- Points are extracted from ClickUp custom fields (looks for field named "points" or "story points")

### Database Schema Key Relationships

**Many-to-Many**: Task ↔ Developer (developers can have multiple tasks, tasks can have multiple assignees)

**One-to-Many**:
- Developer → TimeEntry (tracks hours worked)
- Task → TimeEntry (hours logged per task)
- Task → TaskTag (ClickUp tags)
- Task → CustomField (ClickUp custom fields)

**Important**: Task IDs are ClickUp's task IDs (string), not auto-generated UUIDs. This enables idempotent syncing.

**Prisma Client Location**: Generated at `backend/src/generated/prisma` (not the default node_modules location).

### Frontend Architecture

- **React Router** pages: Dashboard, TasksPage, DevelopersPage, ReportsPage
- **API Client** (services/api.ts): Axios wrapper for all backend endpoints
- **Shared Types** (types/index.ts): TypeScript interfaces matching backend models
- **Helpers** (utils/helpers.ts): Time conversion (ClickUp uses milliseconds), date formatting, badge color mapping

## Development Commands

### Backend (from `/backend`)
```bash
npm run dev                  # Start dev server with nodemon + ts-node (port 3001)
npm run build                # Compile TypeScript to /dist
npm start                    # Run compiled production server
npm run prisma:generate      # Generate Prisma client (required after schema changes)
npm run prisma:migrate       # Create and apply migration
npx prisma db push          # Push schema directly without migration (faster for dev)
npx prisma studio           # Open Prisma Studio (database GUI)
```

### Frontend (from `/frontend`)
```bash
npm run dev                  # Start Vite dev server (port 5173)
npm run build                # Build for production to /dist
npm run preview              # Preview production build locally
```

### Database Reset
```bash
cd backend
npx prisma db push --force-reset  # Wipe and recreate database
npm run prisma:generate           # Regenerate client
```

### Important: Prisma Client Path

**Note:** The Prisma schema originally used a custom output path (`../src/generated/prisma`), but this has been changed to the default location to avoid TypeScript compilation issues.

Current configuration in `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"  // Uses default path: node_modules/@prisma/client
}
```

All imports use:
```typescript
import { PrismaClient } from '@prisma/client';  // NOT from '../generated/prisma'
```

If you encounter "Cannot find module" errors after schema changes, run `npx prisma generate`.

## Environment Configuration

### Backend (.env)
Required variables:
- `CLICKUP_API_TOKEN`: ClickUp API token (from ClickUp Settings → Apps → API Token)
- `CLICKUP_WORKSPACE_ID`: Team ID (from ClickUp URL)
- `CLICKUP_SPACE_ID`: Space ID where tasks are located
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend server port (default 3001)
- `WEBHOOK_URL`: Public URL for ClickUp webhooks (for production)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default http://localhost:3001)

## Key Implementation Details

### ClickUp API Integration

**Rate Limiting**: ClickUp API allows 100 requests/minute. The sync service includes a 100ms delay between list fetches to avoid hitting limits.

**Time Format**: ClickUp stores times as Unix timestamps in milliseconds. Use `ClickUpService.msToHours()` and `ClickUpService.hoursToMs()` for conversion.

**Custom Fields**: Points are stored as custom fields in ClickUp. The sync service searches for fields named "points" or "story points" (case-insensitive) and extracts the numeric value.

### Webhook Flow

1. Register webhook: `POST /api/webhooks/register`
2. ClickUp sends events to: `POST /api/webhooks/clickup`
3. Webhook handler fetches updated task from ClickUp and calls `syncService.syncTask()`
4. If assignees changed, recalculates all developer points

### Weekly Reports

**Week Calculation**: ISO week number is calculated using `getWeekNumber()` helper (weeks start on Monday, first week contains Jan 4th).

**Time Entries**: Not automatically created - must be manually added via `POST /api/developers/time-entry`. This allows tracking actual hours worked vs. estimated.

**CSV Export**: Frontend generates CSV client-side from report data (no backend endpoint needed).

## Common Development Workflows

### Adding a New API Endpoint

1. Create controller method in `backend/src/controllers/*.controller.ts`
2. Add route in `backend/src/routes/*.routes.ts`
3. Import and mount route in `backend/src/index.ts` (if new route file)
4. Add API function in `frontend/src/services/api.ts`
5. Update types in both `backend/src/types` and `frontend/src/types`

### Modifying Database Schema

1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma db push` (dev) or `npx prisma migrate dev --name description` (prod)
3. Run `npm run prisma:generate` to update Prisma client
4. Restart backend server (if dev server doesn't pick up changes)
5. Update TypeScript types in `frontend/src/types/index.ts` if needed

### Testing ClickUp Integration

1. Ensure `.env` has valid ClickUp credentials
2. Start backend: `cd backend && npm run dev`
3. Trigger sync: `curl -X POST http://localhost:3001/api/tasks/sync`
4. Check backend logs for sync progress
5. Verify data: `npx prisma studio` or query via API

### Debugging Sync Issues

- Check `sync_logs` table for error messages
- Verify ClickUp credentials and space ID are correct
- Ensure PostgreSQL is running and database exists
- Check backend console for detailed error logs during sync
- Use `GET /api/tasks/stats` to verify data was synced

## Production Deployment

### Backend
- Set `NODE_ENV=production`
- Update `WEBHOOK_URL` to public production URL
- Run `npm run build` and deploy `/dist` directory
- Run `npx prisma migrate deploy` (use migrations, not db push)
- After deployment, call `POST /api/webhooks/register` to activate webhooks

### Frontend
- Set `VITE_API_URL` to production backend URL
- Run `npm run build`
- Deploy `/dist` directory to static hosting (Vercel/Netlify)

## API Endpoint Summary

### Tasks
- `GET /api/tasks` - List all tasks (query params: `status`, `developerId`)
- `GET /api/tasks/stats` - Task counts by status
- `POST /api/tasks/sync` - Trigger full sync from ClickUp

### Developers
- `GET /api/developers` - List all developers (sorted by points ascending)
- `GET /api/developers/lowest-points` - Get developer with fewest points
- `GET /api/developers/weekly-report` - Weekly hours report (query params: `week`, `year`)
- `POST /api/developers/time-entry` - Add time entry (body: `taskId`, `developerId`, `hours`, `date?`)

### Webhooks
- `POST /api/webhooks/register` - Register webhook with ClickUp
- `POST /api/webhooks/clickup` - ClickUp webhook receiver (called by ClickUp)
- `GET /api/webhooks` - List registered webhooks

## Troubleshooting

**"Prisma Client not found"**: Run `npm run prisma:generate` from backend directory

**Database connection errors**: Verify PostgreSQL is running and `DATABASE_URL` is correct

**ClickUp sync returns 0 tasks**: Check that `CLICKUP_SPACE_ID` matches your ClickUp space

**Frontend can't connect to backend**: Verify backend is running on port in `VITE_API_URL`

**Webhook not working**: Ensure `WEBHOOK_URL` is publicly accessible and webhook is registered
