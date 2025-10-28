# UpClick Quick Start Guide

Get up and running with UpClick in 5 minutes!

## 🚀 Quick Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Set Up Database (1 minute)

```bash
# Create PostgreSQL database
createdb upclick

# Initialize Prisma
cd backend
npx prisma db push
npx prisma generate
```

### Step 3: Configure (1 minute)

Your ClickUp credentials are already configured in `backend/.env`:
- ✅ API Token: A8TXT70WRO9T0UE4R7Q1BMHDYT36VK5X
- ✅ Workspace ID: 9013086675
- ✅ Space ID: 901311123180

Just verify your `backend/.env` file exists with these values.

### Step 4: Start Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Sync Data

1. Open http://localhost:5173
2. Click "🔄 Sync from ClickUp" button
3. Wait for tasks to sync (may take 30-60 seconds)
4. Done! 🎉

## 📊 What You Can Do

### Dashboard
- View all tasks and team members
- See statistics at a glance
- Quick sync button

### Tasks Page
- Browse all tasks from ClickUp
- Filter by status
- Search tasks

### Developers Page
- See team members sorted by points
- View who has the lowest workload
- Perfect for task assignment

### Reports Page
- Generate weekly hours reports
- Export to CSV for payouts
- Navigate between weeks

## 🔄 Daily Workflow

1. **Morning**: Sync tasks from ClickUp to see latest updates
2. **During Day**: View dashboard to see progress
3. **Assign Tasks**: Check Developers page, assign to person with lowest points
4. **End of Week**: Go to Reports page, generate weekly report, export CSV for payouts

## 🛠️ Common Tasks

### Sync Latest Tasks
- Go to Dashboard
- Click "🔄 Sync from ClickUp"

### Check Who to Assign Task To
- Go to Developers page
- First person in list has lowest points → assign task to them

### Generate Payout Report
- Go to Reports page
- Select week
- Click "📥 Export CSV"
- Use CSV for payment processing

## 🆘 Troubleshooting

### Backend won't start?
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify database exists
psql -U postgres -l | grep upclick
```

### Database errors?
```bash
cd backend
npx prisma db push
npx prisma generate
```

### No tasks showing?
1. Check backend logs for errors
2. Verify ClickUp credentials in `backend/.env`
3. Try syncing again from Dashboard

### Frontend can't connect to backend?
- Check backend is running on port 3001
- Verify `VITE_API_URL=http://localhost:3001` in `frontend/.env`

## 🎯 Next Steps

- Set up webhooks for real-time updates (see README.md)
- Deploy to production (see README.md)
- Customize for your team's workflow

## 📞 Need Help?

Check the full README.md for detailed documentation and API references.

---

Happy task managing! 🚀
