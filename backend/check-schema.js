import { pool } from './src/config/db.js';
import { printSchemaReport } from './src/utils/schemaChecker.js';

async function main() {
  try {
    await printSchemaReport();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();

