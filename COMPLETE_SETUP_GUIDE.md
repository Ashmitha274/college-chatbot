# Complete Setup Guide - College Student Management System

## 🎯 Quick Overview

This guide will help you:
1. ✅ Create the database
2. ✅ Run the schema.sql file
3. ✅ Setup backend
4. ✅ Setup frontend
5. ✅ Connect everything together

---

## Step 1: Create Database

### Option A: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE "college-student";

# Exit psql
\q
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name: `college-student`
5. Click "Save"

---

## Step 2: Run Schema.sql

### Where to Run schema.sql

**Option A: Using psql (Recommended)**

```bash
# From the project root directory
psql -U postgres -d college-student -f schema.sql
```

**Option B: Using pgAdmin**

1. Open pgAdmin
2. Right-click on `college-student` database
3. Select "Query Tool"
4. Open `schema.sql` file (from project root)
5. Click "Execute" (F5)

**Option C: Copy-Paste in psql**

```bash
# Connect to database
psql -U postgres -d college-student

# Copy entire content of schema.sql and paste, then press Enter
```

### Verify Schema is Created

```bash
psql -U postgres -d college-student -c "\dt"
```

You should see tables like: `student`, `faculty`, `admin`, `department`, etc.

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend

```bash
cd backend
```

### 3.2 Create .env File

Create a file named `.env` in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=college-student

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google Gemini API (optional, for chatbot)
GEMINI_API_KEY=your_gemini_api_key_here
```

**⚠️ Important:** Replace `your_postgres_password_here` with your actual PostgreSQL password!

### 3.3 Install Dependencies

```bash
npm install
```

### 3.4 Run Backend Server

```bash
npm run dev
```

**Expected Output:**
```
✅ Backend server running on port 4000
✅ Database connection established successfully
📊 Health check: http://localhost:4000/health
```

**If you see errors:**
- Check your `.env` file exists
- Verify database credentials
- Make sure PostgreSQL is running

### 3.5 Test Backend

Open browser: http://localhost:4000/health

Should return: `{"status":"ok"}`

---

## Step 4: Frontend Setup

### 4.1 Open New Terminal

Keep backend running, open a **new terminal window**.

### 4.2 Navigate to Frontend

```bash
cd frontend
```

### 4.3 Install Dependencies

```bash
npm install
```

### 4.4 Run Frontend Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4.5 Access Application

Open browser: http://localhost:5173

---

## Step 5: Verify Everything is Connected

### 5.1 Check Backend Health
- URL: http://localhost:4000/health
- Should show: `{"status":"ok"}`

### 5.2 Check Frontend
- URL: http://localhost:5173
- Should show the login page

### 5.3 Test Registration

1. Go to http://localhost:5173
2. Click "Signup" or navigate to signup page
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@#
   - USN: TEST123 (if student)
   - Role: student
4. Click "Register"

**If successful:** You'll see a success message and can login.

**If error:** Check backend console for detailed error message.

---

## 📋 Complete Command Sequence

Here's the complete sequence of commands:

```bash
# 1. Create database
psql -U postgres -c 'CREATE DATABASE "college-student";'

# 2. Run schema
psql -U postgres -d college-student -f schema.sql

# 3. Setup backend (Terminal 1)
cd backend
# Create .env file (edit with your password)
npm install
npm run dev

# 4. Setup frontend (Terminal 2 - NEW TERMINAL)
cd frontend
npm install
npm run dev

# 5. Open browser
# http://localhost:5173
```

---

## 🔧 Troubleshooting

### Database Connection Failed

**Error:** `❌ Database connection failed`

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Windows: Check Services
   # Mac/Linux: sudo service postgresql status
   ```

2. Verify `.env` file:
   - File exists in `backend/` directory
   - `DB_PASSWORD` is correct
   - `DB_NAME=college-student`

3. Test connection manually:
   ```bash
   psql -U postgres -d college-student
   ```

### Schema Not Found

**Error:** `relation "student" does not exist`

**Solution:**
```bash
# Run schema.sql again
psql -U postgres -d college-student -f schema.sql
```

### Port Already in Use

**Error:** `Port 4000 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /F /PID <PID_NUMBER>

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

Or change port in `.env`:
```env
PORT=4001
```

### Frontend Can't Connect to Backend

**Check:**
1. Backend is running on port 4000
2. Frontend API base URL is correct (should be `/api`)
3. No CORS errors in browser console

---

## 📁 File Structure

```
gsss3.0/
├── schema.sql              ← Run this first!
├── backend/
│   ├── .env               ← Create this with your DB password
│   ├── src/
│   └── package.json
└── frontend/
    ├── src/
    └── package.json
```

---

## ✅ Success Checklist

- [ ] Database `college-student` created
- [ ] Schema.sql executed successfully
- [ ] Backend `.env` file created with correct credentials
- [ ] Backend running on port 4000
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Frontend running on port 5173
- [ ] Can access frontend in browser
- [ ] Can register a new user
- [ ] Can login with registered user

---

## 🚀 Next Steps

Once everything is running:

1. **Register a test user** (student/faculty/admin)
2. **Login** and explore the dashboard
3. **Check backend console** for any warnings
4. **Test features** like:
   - Student registration
   - Faculty profile update
   - Course material upload
   - Attendance marking

---

## 📞 Need Help?

If you encounter issues:

1. **Check backend console** - Detailed error messages
2. **Check browser console** - Frontend errors (F12)
3. **Run schema checker:**
   ```bash
   cd backend
   npm run check-schema
   ```
4. **Verify database:**
   ```bash
   psql -U postgres -d college-student -c "\dt"
   ```

---

## 🎉 You're All Set!

Your application should now be running:
- **Backend:** http://localhost:4000
- **Frontend:** http://localhost:5173
- **Database:** college-student (PostgreSQL)

Happy coding! 🚀

