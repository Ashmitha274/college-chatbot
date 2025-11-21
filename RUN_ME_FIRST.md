# 🚀 Quick Start - Run These Commands

## Step 1: Create Database

```bash
psql -U postgres -c 'CREATE DATABASE "college-student";'
```

## Step 2: Run Schema

```bash
# From project root directory
psql -U postgres -d college-student -f schema.sql
```

## Step 3: Backend Setup

```bash
cd backend

# Create .env file (copy this and edit password)
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=college-student
PORT=4000
JWT_SECRET=dev-secret-key-change-in-production
EOF

# Install and run
npm install
npm run dev
```

## Step 4: Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

## Step 5: Open Browser

- Frontend: http://localhost:5173
- Backend Health: http://localhost:4000/health

---

**📖 For detailed instructions, see: COMPLETE_SETUP_GUIDE.md**

