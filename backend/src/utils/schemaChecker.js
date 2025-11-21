import { pool } from '../config/db.js';

/**
 * Check if a column exists in a table
 */
async function columnExists(tableName, columnName) {
  try {
    const result = await pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = $1 AND column_name = $2`,
      [tableName, columnName]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error(`Error checking column ${tableName}.${columnName}:`, err.message);
    return false;
  }
}

/**
 * Check if a table exists
 */
async function tableExists(tableName) {
  try {
    const result = await pool.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = $1`,
      [tableName]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error(`Error checking table ${tableName}:`, err.message);
    return false;
  }
}

/**
 * Get all columns for a table
 */
async function getTableColumns(tableName) {
  try {
    const result = await pool.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );
    return result.rows;
  } catch (err) {
    console.error(`Error getting columns for ${tableName}:`, err.message);
    return [];
  }
}

/**
 * Check schema compatibility and report differences
 */
export async function checkSchemaCompatibility() {
  const issues = [];
  const info = [];

  // Check required tables
  const requiredTables = ['student', 'faculty', 'admin'];
  for (const table of requiredTables) {
    const exists = await tableExists(table);
    if (!exists) {
      issues.push(`❌ Required table '${table}' does not exist`);
    } else {
      info.push(`✅ Table '${table}' exists`);
      const columns = await getTableColumns(table);
      info.push(`   Columns: ${columns.map(c => c.column_name).join(', ')}`);
    }
  }

  // Check student table columns
  if (await tableExists('student')) {
    const hasName = await columnExists('student', 'name');
    const hasEmail = await columnExists('student', 'email');
    const hasPasswordHash = await columnExists('student', 'password_hash');
    const hasUsn = await columnExists('student', 'usn');

    if (!hasName) issues.push("❌ student table missing 'name' column");
    if (!hasEmail) issues.push("❌ student table missing 'email' column");
    if (!hasPasswordHash) issues.push("❌ student table missing 'password_hash' column");
    if (!hasUsn) issues.push("❌ student table missing 'usn' column");
  }

  // Check faculty table columns
  if (await tableExists('faculty')) {
    const hasFacultyName = await columnExists('faculty', 'faculty_name');
    const hasEmail = await columnExists('faculty', 'email');
    const hasPasswordHash = await columnExists('faculty', 'password_hash');

    if (!hasFacultyName) issues.push("❌ faculty table missing 'faculty_name' column");
    if (!hasEmail) issues.push("❌ faculty table missing 'email' column");
    if (!hasPasswordHash) issues.push("❌ faculty table missing 'password_hash' column");
  }

  // Check admin table columns
  if (await tableExists('admin')) {
    const hasUsername = await columnExists('admin', 'username');
    const hasPasswordHash = await columnExists('admin', 'password_hash');
    const hasRole = await columnExists('admin', 'role');

    if (!hasUsername) issues.push("❌ admin table missing 'username' column");
    if (!hasPasswordHash) issues.push("❌ admin table missing 'password_hash' column");
    if (!hasRole) issues.push("❌ admin table missing 'role' column");
  }

  return { issues, info };
}

/**
 * Print schema report
 */
export async function printSchemaReport() {
  console.log('\n📊 Checking Database Schema Compatibility...\n');
  const { issues, info } = await checkSchemaCompatibility();

  info.forEach(msg => console.log(msg));
  
  if (issues.length > 0) {
    console.log('\n⚠️  Schema Issues Found:');
    issues.forEach(msg => console.log(msg));
    return false;
  } else {
    console.log('\n✅ Schema is compatible!');
    return true;
  }
}

