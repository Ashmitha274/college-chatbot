import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';
import { generateSQL, formatResponse } from '../services/geminiService.js';
import { generateExcel } from '../services/excelService.js';
import { validateSQL, sanitizeSQL } from '../services/sqlValidator.js';

const router = express.Router();

// POST /api/chat/query - Process user queries
router.post(
  '/query',
  authenticate,
  authorizeRoles('student', 'faculty', 'admin', 'department'),
  body('query').notEmpty().withMessage('Query is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req.body;
    const { id: userId, role: userRole } = req.user;

    try {
      // 1. Generate SQL from user query
      let sql = await generateSQL(query, userRole, userId);

      // --- FIX: Handle non-database greetings (e.g., "Hey", "Hi") ---
      if (sql === 'NON_SQL_INTENT') {
         return res.json({
           success: true,
           query,
           sql: null,
           response: "Hello! I am your college assistant. Ask me about student projects, marks, or attendance.",
           data: [],
           count: 0
         });
      }
      // ---------------------------------------------------------------

      sql = sanitizeSQL(sql);

      // 2. Validate SQL for security
      validateSQL(sql, userRole, userId);

      // 3. Prepare Parameters based on Role (Row Level Security)
      let queryParams = [];
      const paramMatches = sql.match(/\$\d+/g) || [];
      const paramCount = paramMatches.length > 0 
        ? Math.max(...paramMatches.map(p => parseInt(p.replace('$', ''))))
        : 0;
      
      if ((userRole === 'student' || userRole === 'faculty') && paramCount > 0) {
        // Students and Faculty should only see their own data (mapped to $1, $2 etc)
        queryParams = Array(paramCount).fill(userId);
      }

      // 4. Execute SQL
      const result = await pool.query(sql, queryParams);
      const rows = result.rows || [];

      // 5. Format response in natural language
      const botResponse = await formatResponse(query, sql, rows);

      // 6. Save to chat history
      await pool.query(
        `INSERT INTO chat_history (user_id, user_type, user_query, generated_sql, bot_response, result_data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, userRole, query, sql, botResponse, JSON.stringify(rows)]
      );

      res.json({
        success: true,
        query,
        sql,
        response: botResponse,
        data: rows,
        count: rows.length
      });

    } catch (error) {
      console.error('Chat query error:', error);

      // Save error to history
      await pool.query(
        `INSERT INTO chat_history (user_id, user_type, user_query, generated_sql, bot_response)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, userRole, query, null, `Error: ${error.message}`]
      ).catch(() => {});

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process query',
        error: error.message
      });
    }
  }
);

// POST /api/chat/download - Generate Excel downloads
// UPDATED: Now accepts SQL to re-execute query securely
router.post(
  '/download',
  authenticate,
  authorizeRoles('student', 'faculty', 'admin', 'department'),
  body('query').notEmpty(),
  body('sql').notEmpty().withMessage('SQL query is required for export'), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, sql } = req.body;
    const { id: userId, role: userRole } = req.user;

    try {
      // 1. Validate SQL again (Security Best Practice)
      // Even though it came from our frontend, we verify it hasn't been tampered with
      validateSQL(sql, userRole, userId);

      // 2. Prepare Parameters (Same logic as /query)
      let queryParams = [];
      const paramMatches = sql.match(/\$\d+/g) || [];
      const paramCount = paramMatches.length > 0 
        ? Math.max(...paramMatches.map(p => parseInt(p.replace('$', ''))))
        : 0;
      
      if ((userRole === 'student' || userRole === 'faculty') && paramCount > 0) {
        queryParams = Array(paramCount).fill(userId);
      }

      // 3. Execute SQL to get fresh data
      const result = await pool.query(sql, queryParams);
      const data = result.rows || [];

      // 4. Generate Excel
      const { buffer, filename } = await generateExcel(data, query, userRole);

      // 5. Send File
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);

    } catch (error) {
      console.error('Excel download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Excel file',
        error: error.message
      });
    }
  }
);

// GET /api/chat/history - Get user's chat history
router.get(
  '/history',
  authenticate,
  authorizeRoles('student', 'faculty', 'admin', 'department'),
  async (req, res) => {
    const { id: userId, role: userRole } = req.user;
    const { limit = 20 } = req.query;

    try {
      const result = await pool.query(
        `SELECT chat_id, user_query, bot_response, generated_sql, created_at, 
         CASE WHEN result_data IS NOT NULL THEN jsonb_array_length(result_data) ELSE 0 END as result_count
         FROM chat_history
         WHERE user_id = $1 AND user_type = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [userId, userRole, parseInt(limit, 10)]
      );

      res.json({
        success: true,
        history: result.rows
      });
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chat history',
        error: error.message
      });
    }
  }
);

export default router;