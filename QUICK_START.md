# Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### 1. Database Setup
```bash
# Make sure PostgreSQL is running
# Create database (if not exists)
psql -U postgres -c "CREATE DATABASE \"college-management\";"
```

### 2. Backend Setup
```bash
cd backend

# Create .env file (copy and edit with your PostgreSQL password)
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=college-management
PORT=4000
JWT_SECRET=dev-secret-key-change-in-production
EOF

# Install and run
npm install
npm run dev
```

### 3. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Verify
- Backend: http://localhost:4000/health (should return `{"status":"ok"}`)
- Frontend: http://localhost:5173 (or port shown in terminal)

## 🔍 Troubleshooting Registration Error (500)

### Step 0: Check Schema Compatibility (If you have existing database)
```bash
cd backend
npm run check-schema
```

This will show you exactly what's different in your schema!

### Step 1: Check Database Connection
Visit: http://localhost:4000/health

**If it fails:**
1. Check PostgreSQL is running
2. Verify `.env` file exists in `backend/` directory
3. Check database credentials in `.env`

### Step 2: Check Backend Console
Look for error messages like:
- `❌ Database connection failed` → Database issue
- `❌ Registration Error:` → Check the detailed error
- `⚠️ Schema compatibility warnings` → Schema mismatch (see SCHEMA_COMPATIBILITY.md)

### Step 3: Common Issues

**Issue: "relation does not exist"**
- Solution: Run the database schema
  ```bash
  psql -U postgres -d college-management -f schema.sql
  ```

**Issue: "duplicate key value violates unique constraint"**
- Solution: User already exists, try different email/USN

**Issue: "password_hash" column doesn't exist**
- Solution: Database schema is outdated, run schema.sql

**Issue: "connection refused"**
- Solution: PostgreSQL not running or wrong port

### Step 4: Check Error Details
The backend now logs detailed errors. Look in the console for:
```
❌ Registration Error: {
  message: "...",
  code: "...",
  detail: "..."
}
```

## 📝 Example .env File

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=college-management

# Server
PORT=4000
NODE_ENV=development

# Security
JWT_SECRET=your-random-secret-key-here
```

## ✅ Success Indicators

**Backend is working if you see:**
```
✅ Backend server running on port 4000
✅ Database connection established successfully
```

**Registration is working if:**
- No errors in console
- Returns 201 status code
- User can login after registration

## 🆘 Still Having Issues?

1. **Check all error messages** in backend console
2. **Verify database exists**: `psql -U postgres -l`
3. **Test database connection**: `psql -U postgres -d college-management`
4. **Check port conflicts**: Make sure port 4000 is free
5. **Review SETUP_GUIDE.md** for detailed instructions

