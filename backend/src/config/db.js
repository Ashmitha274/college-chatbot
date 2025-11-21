import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'college-student',
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client:', err);
});

// Test database connection on startup
pool.query('SELECT NOW()')
  .then(async () => {
    console.log('✅ Database connection established successfully');
    
    // Check schema compatibility (non-blocking)
    try {
      const { checkSchemaCompatibility } = await import('../utils/schemaChecker.js');
      const { issues } = await checkSchemaCompatibility();
      if (issues.length > 0) {
        console.log('\n⚠️  Schema compatibility warnings:');
        issues.forEach(msg => console.log('   ' + msg));
        console.log('   Some features may not work correctly.\n');
      }
    } catch (err) {
      // Schema checker failed, but don't block startup
      console.log('   (Schema check skipped)');
    }
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Please check your database configuration in .env file');
  });


