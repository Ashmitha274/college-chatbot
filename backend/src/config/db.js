import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
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
      console.log('   (Schema check skipped)');
    }
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check DATABASE_URL in Render Environment Variables');
  });
