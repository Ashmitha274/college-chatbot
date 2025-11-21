# Schema Compatibility Guide

Since you have an existing database with a different schema, this guide will help you identify and resolve any compatibility issues.

## Quick Check

Run the schema checker to see what's different:

```bash
cd backend
npm run check-schema
```

This will show you:
- ✅ Which tables and columns exist
- ❌ Which required columns are missing
- ⚠️ Any schema mismatches

## Expected Schema (Minimum Requirements)

### Student Table
Required columns:
- `student_id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `usn` (VARCHAR, UNIQUE)

Optional columns (won't break if missing):
- `department_id`
- `address`
- `phone`
- `parent_phone`
- `batch_year`
- `created_at`
- `updated_at`

### Faculty Table
Required columns:
- `faculty_id` (SERIAL PRIMARY KEY)
- `faculty_name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)

Optional columns:
- `department_id`
- `phone`
- `login_info`
- `created_at`
- `updated_at`

### Admin Table
Required columns:
- `admin_id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (VARCHAR)

Optional columns:
- `foreign_key_info`
- `login_timestamp`
- `created_at`
- `updated_at`

## Common Schema Differences

### Issue 1: Column Name Differences

**Problem:** Your schema uses different column names

**Example:**
- Your schema: `student_name` instead of `name`
- Your schema: `faculty_name` instead of `faculty_name` (same, but check)

**Solution:** The code expects these exact names. If your columns are different, you have two options:

1. **Rename columns** (recommended if no production data):
   ```sql
   ALTER TABLE student RENAME COLUMN student_name TO name;
   ```

2. **Modify the code** to match your schema (contact me if needed)

### Issue 2: Missing Columns

**Problem:** Required columns don't exist

**Solution:** Add missing columns:
```sql
-- Example: Add missing password_hash to student table
ALTER TABLE student ADD COLUMN password_hash VARCHAR(255);

-- Example: Add missing email to faculty table
ALTER TABLE faculty ADD COLUMN email VARCHAR(150) UNIQUE;
```

### Issue 3: Data Type Mismatches

**Problem:** Column exists but has wrong data type

**Example:** `password_hash` is `TEXT` instead of `VARCHAR(255)`

**Solution:** Usually fine, but if you get errors:
```sql
ALTER TABLE student ALTER COLUMN password_hash TYPE VARCHAR(255);
```

## Step-by-Step: Check Your Schema

### 1. Connect to Your Database
```bash
psql -U postgres -d college-management
```

### 2. Check Student Table
```sql
\d student
-- or
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student';
```

### 3. Check Faculty Table
```sql
\d faculty
```

### 4. Check Admin Table
```sql
\d admin
```

### 5. Compare with Expected Schema

Look for these columns in each table:
- **student**: name, email, password_hash, usn
- **faculty**: faculty_name, email, password_hash
- **admin**: username, password_hash, role

## Fixing Schema Issues

### Option A: Add Missing Columns (Safest)

If you're missing optional columns, add them:

```sql
-- Add optional columns to student (if missing)
ALTER TABLE student 
  ADD COLUMN IF NOT EXISTS department_id INT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS batch_year INT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

### Option B: Rename Columns

If your columns have different names:

```sql
-- Example: Rename student_name to name
ALTER TABLE student RENAME COLUMN student_name TO name;

-- Example: Rename faculty_name (if it's different)
-- ALTER TABLE faculty RENAME COLUMN teacher_name TO faculty_name;
```

### Option C: Create Missing Tables

If entire tables are missing:

```sql
-- Create student table (if missing)
CREATE TABLE IF NOT EXISTS student (
    student_id SERIAL PRIMARY KEY,
    usn VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id INT,
    address TEXT,
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing After Fixes

1. **Run schema checker:**
   ```bash
   npm run check-schema
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Check health endpoint:**
   ```
   http://localhost:4000/health
   ```

4. **Try registration:**
   - The error message will now be more specific
   - Check backend console for detailed errors

## Getting Help

If you're still getting errors:

1. **Run the schema checker** and share the output
2. **Check backend console** for the detailed error message
3. **Share your table structure:**
   ```sql
   \d student
   \d faculty
   \d admin
   ```

The improved error messages will now tell you exactly which column is missing or mismatched!

