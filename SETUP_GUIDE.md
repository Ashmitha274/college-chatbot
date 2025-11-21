# Setup Guide - College Management System

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## Step 1: Database Setup

### 1.1 Install PostgreSQL
- Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
- Remember your PostgreSQL password during installation

### 1.2 Create Database
Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
CREATE DATABASE "college-management";
```

Or use the provided SQL dump:
```bash
psql -U postgres -f schema.sql
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment File
Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=college-management

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret (change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Gemini API (optional, for chatbot)
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password.

### 2.4 Run Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ Backend server running on port 4000
✅ Database connection established successfully
📊 Health check: http://localhost:4000/health
```

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory
Open a new terminal and navigate to:
```bash
cd frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Run Frontend Server
```bash
npm run dev
```

You should see the frontend running on `http://localhost:5173` (or similar port).

## Step 4: Verify Setup

### 4.1 Check Backend Health
Open your browser and visit:
```
http://localhost:4000/health
```

You should see:
```json
{"status":"ok"}
```

### 4.2 Test Registration
1. Open the frontend application
2. Navigate to the Signup page
3. Try registering a new user

## Troubleshooting

### Error: "Database connection failed"

**Possible causes:**
1. PostgreSQL is not running
   - **Windows:** Check Services → PostgreSQL
   - **Mac/Linux:** `sudo service postgresql status`

2. Wrong database credentials in `.env`
   - Verify your PostgreSQL username and password
   - Default username is usually `postgres`

3. Database doesn't exist
   - Create it: `CREATE DATABASE "college-management";`

4. Wrong port number
   - Default PostgreSQL port is `5432`
   - Check: `psql -U postgres -c "SHOW port;"`

### Error: "Port 4000 is already in use"

**Solution:**
1. Find the process using port 4000:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   taskkill /F /PID <PID_NUMBER>
   
   # Mac/Linux
   lsof -ti:4000 | xargs kill -9
   ```

2. Or change the port in `.env`:
   ```env
   PORT=4001
   ```

### Error: "500 Internal Server Error" on Registration

**Check:**
1. Database connection is working (check `/health` endpoint)
2. Database tables exist (run the schema.sql file)
3. Check backend console for detailed error messages
4. Verify `.env` file exists and has correct values

### Error: "Module not found"

**Solution:**
```bash
# In backend directory
npm install

# In frontend directory  
npm install
```

## Common Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Run in development mode
npm start            # Run in production mode
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Build for production
```

## Database Management

### Connect to Database
```bash
psql -U postgres -d college-management
```

### View Tables
```sql
\dt
```

### Reset Database (WARNING: Deletes all data)
```bash
psql -U postgres -d college-management -f schema.sql
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Use environment-specific database credentials
4. Build frontend: `npm run build`
5. Serve frontend using a web server (nginx, Apache, etc.)

## Need Help?

Check the backend console for detailed error messages. The server logs all errors with:
- Error message
- Stack trace
- Database error codes
- Request details

