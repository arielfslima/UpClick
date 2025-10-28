# UpClick - ClickUp Task & Points Management System

A full-stack web application for managing development team tasks, tracking points, and generating weekly payout reports by integrating with ClickUp.

## Features

- ✅ **Real-time ClickUp Integration** - Sync tasks from ClickUp automatically
- 📊 **Task Dashboard** - View all tasks with status, assignees, hours, and points
- 👥 **Team Management** - Track developers and their assigned points
- 📈 **Weekly Reports** - Generate hours worked reports for payouts
- 🔄 **Webhook Support** - Real-time updates when tasks change in ClickUp
- 🎯 **Points Balancing** - Auto-assign tasks to developers with lowest points
- 📥 **CSV Export** - Export weekly reports for payout processing

## Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** database
- **Prisma** ORM
- **Axios** for ClickUp API integration

### Frontend
- **React** 18 + **TypeScript**
- **Vite** build tool
- **Tailwind CSS** for styling
- **React Router** for navigation

## Project Structure

```
UpClick/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── clickup.service.ts
│   │   │   ├── database.service.ts
│   │   │   └── sync.service.ts
│   │   ├── types/            # TypeScript types
│   │   └── index.ts          # Express app entry
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helper functions
│   │   └── App.tsx
│   ├── .env                  # Frontend env variables
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** 14+ installed and running
- **ClickUp API Token** (get from ClickUp Settings → Apps → API Token)

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure PostgreSQL Database

```bash
# Create database
createdb upclick

# Or using psql
psql -U postgres
CREATE DATABASE upclick;
```

### 3. Configure Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# ClickUp API Credentials
CLICKUP_API_TOKEN=A8TXT70WRO9T0UE4R7Q1BMHDYT36VK5X
CLICKUP_CLIENT_ID=A8TXT70WRO9T0UE4R7Q1BMHDYT36VK5X
CLICKUP_CLIENT_SECRET=J1ETQVOE1G8JNDFC8ALXOIUSAL8XTG4PGELN88WQ92REPIAW104GZPRLVWIKFFU8

# ClickUp Configuration
CLICKUP_WORKSPACE_ID=9013086675
CLICKUP_SPACE_ID=901311123180

# Database
DATABASE_URL=postgresql://localhost:5432/upclick

# Server
PORT=3001
NODE_ENV=development

# Webhook (update with your public URL for production)
WEBHOOK_URL=http://localhost:3001/api/webhooks/clickup
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 4. Initialize Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Or if you prefer to push schema directly
npx prisma db push
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

### 6. Initial Data Sync

1. Open your browser and go to http://localhost:5173
2. Click the "🔄 Sync from ClickUp" button on the dashboard
3. This will fetch all tasks from your ClickUp space and populate the database

### 7. (Optional) Set Up Webhooks

For real-time updates when tasks change in ClickUp:

1. If deploying to production, update `WEBHOOK_URL` in `backend/.env` with your public URL
2. Make a POST request to register the webhook:

```bash
curl -X POST http://localhost:3001/api/webhooks/register
```

Or use the API endpoint from your frontend once deployed.

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks/sync` - Sync all tasks from ClickUp
- `GET /api/tasks/stats` - Get task statistics

### Developers
- `GET /api/developers` - Get all developers
- `GET /api/developers/:id` - Get developer by ID
- `GET /api/developers/lowest-points` - Get developer with lowest points
- `GET /api/developers/weekly-report?week=X&year=Y` - Get weekly report
- `POST /api/developers/time-entry` - Add time entry

### Webhooks
- `POST /api/webhooks/clickup` - ClickUp webhook endpoint
- `POST /api/webhooks/register` - Register webhook with ClickUp
- `GET /api/webhooks` - Get all webhooks
- `DELETE /api/webhooks/:id` - Delete webhook

## Usage Guide

### Dashboard
- View overview of all tasks and team members
- See statistics (total, open, completed tasks)
- Quick access to recent tasks and developers

### Tasks Page
- View all tasks from ClickUp
- Filter by status
- Search tasks by name or description
- See task details including points, hours, assignees

### Developers Page
- View all team members sorted by points (lowest first)
- See each developer's total points and active tasks
- Use for deciding who to assign new tasks to

### Reports Page
- Generate weekly hours reports
- Navigate between weeks
- Export to CSV for payout processing
- See breakdown by developer and task

## Database Schema

- **Developer** - Team members from ClickUp
- **Task** - Tasks synced from ClickUp
- **TimeEntry** - Hours logged per task/developer
- **TaskTag** - Tags associated with tasks
- **CustomField** - Custom fields from ClickUp
- **Webhook** - Registered webhooks
- **SyncLog** - Sync operation logs

## Development Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Update `WEBHOOK_URL` to your production URL
5. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set build directory: `dist`
5. Add environment variable: `VITE_API_URL=your-backend-url`
6. Deploy

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `npx prisma db push` to sync schema

### ClickUp API Issues
- Verify API token is correct
- Check workspace and space IDs match your ClickUp account
- Ensure you have proper permissions in ClickUp

### Sync Not Working
- Check backend logs for errors
- Verify ClickUp credentials in `.env`
- Try manual sync from dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your team!

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for managing dev team workflows efficiently!
