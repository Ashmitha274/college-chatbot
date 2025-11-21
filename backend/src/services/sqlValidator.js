// SQL Query Validator - Security checks

const ALLOWED_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL',
  'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'ILIKE', 'BETWEEN', 'IS', 'NULL',
  'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
  'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'CAST', 'COALESCE', 'UPPER', 'LOWER', 'TRIM',
  'EXTRACT', 'DATE_PART', 'TO_CHAR', 'NOW', 'CURRENT_DATE', 'CURRENT_TIMESTAMP'
];

const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
  'EXEC', 'EXECUTE', 'EXECUTE IMMEDIATE', 'GRANT', 'REVOKE', 'COMMIT',
  'ROLLBACK', 'SAVEPOINT', 'TRANSACTION', 'BEGIN', 'CALL',
  'COPY', 'VACUUM', 'ANALYZE', 'REINDEX', 'CLUSTER'
];

export const validateSQL = (sql, userRole, userId) => {
  if (!sql || typeof sql !== 'string') {
    throw new Error('Invalid SQL query');
  }

  const upperSQL = sql.toUpperCase().trim();

  // Check for forbidden keywords
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (upperSQL.includes(keyword)) {
      throw new Error(`Forbidden SQL keyword detected: ${keyword}`);
    }
  }

  // Must start with SELECT
  if (!upperSQL.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }

  // Check for SQL injection patterns
  const dangerousPatterns = [
    /;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)/i,
    /--/,
    /\/\*/,
    /UNION.*SELECT/i,
    /xp_cmdshell/i,
    /sp_executesql/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      throw new Error('Potentially dangerous SQL pattern detected');
    }
  }

  // Role-based validation
  if (userRole === 'student') {
    // Students should only query their own data
    if (!upperSQL.includes(`STUDENT_ID = $`) && !upperSQL.includes(`STUDENT_ID=$`)) {
      // Check if query is about student data
      if (upperSQL.includes('FROM STUDENT') || upperSQL.includes('FROM MARKS_STUDENT')) {
        throw new Error('Student queries must filter by student_id');
      }
    }
  }

  return true;
};

export const sanitizeSQL = (sql) => {
  // Remove comments
  sql = sql.replace(/--.*$/gm, '');
  sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Trim whitespace
  sql = sql.trim();
  
  // Ensure single space after keywords
  sql = sql.replace(/\s+/g, ' ');
  
  return sql;
};

