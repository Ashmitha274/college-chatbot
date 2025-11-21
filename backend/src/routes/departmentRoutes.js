import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/department/activities - Get all activities
router.get(
  '/activities',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT da.*, d.department_name, f.faculty_name
         FROM department_activities da
         LEFT JOIN department d ON da.department_id = d.department_id
         LEFT JOIN faculty f ON da.created_by = f.faculty_id
         ORDER BY da.timestamp DESC`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Activities fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/department/activities
router.post(
  '/activities',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  body('event_title').notEmpty().withMessage('Event title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { department_id, event_title, event_details, event_date } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO department_activities (department_id, event_title, event_details, event_date, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          department_id ? parseInt(department_id, 10) : null,
          event_title,
          event_details || null,
          event_date || null,
          req.user.id
        ]
      );
      
      // Create notifications for all users
      try {
        // Get all students
        const students = await pool.query('SELECT student_id FROM student');
        for (const student of students.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, is_read) VALUES ($1, $2, $3, $4, false)',
            [student.student_id, 'student', `New Activity: ${event_title}`, event_details || `A new activity "${event_title}" has been scheduled.`]
          );
        }
        // Get all faculty
        const faculty = await pool.query('SELECT faculty_id FROM faculty');
        for (const fac of faculty.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, is_read) VALUES ($1, $2, $3, $4, false)',
            [fac.faculty_id, 'faculty', `New Activity: ${event_title}`, event_details || `A new activity "${event_title}" has been scheduled.`]
          );
        }
        // Get all admins
        const admins = await pool.query('SELECT admin_id FROM admin');
        for (const admin of admins.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, is_read) VALUES ($1, $2, $3, $4, false)',
            [admin.admin_id, 'admin', `New Activity: ${event_title}`, event_details || `A new activity "${event_title}" has been scheduled.`]
          );
        }
      } catch (notifErr) {
        console.error('Failed to create notifications:', notifErr);
        // Don't fail the request if notification creation fails
      }
      
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/department/circulars - Get all circulars
router.get(
  '/circulars',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT dc.*, d.department_name, f.faculty_name
         FROM department_circulars dc
         LEFT JOIN department d ON dc.department_id = d.department_id
         LEFT JOIN faculty f ON dc.created_by = f.faculty_id
         ORDER BY dc.timestamp DESC`
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Circulars fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/department/circulars
router.post(
  '/circulars',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  body('title').notEmpty().withMessage('Title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { department_id, title, circular_details } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO department_circulars (department_id, title, circular_details, created_by) VALUES ($1,$2,$3,$4) RETURNING *',
        [
          department_id ? parseInt(department_id, 10) : null,
          title,
          circular_details || null,
          req.user.id
        ]
      );
      
      // Create notifications for all users
      try {
        // Get all students
        const students = await pool.query('SELECT student_id FROM student');
        for (const student of students.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, is_read) VALUES ($1, $2, $3, $4, false)',
            [student.student_id, 'student', `New Circular: ${title}`, circular_details || `A new circular "${title}" has been published.`]
          );
        }
        // Get all faculty
        const faculty = await pool.query('SELECT faculty_id FROM faculty');
        for (const fac of faculty.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, is_read) VALUES ($1, $2, $3, $4, false)',
            [fac.faculty_id, 'faculty', `New Circular: ${title}`, circular_details || `A new circular "${title}" has been published.`]
          );
        }
        // Get all admins
        const admins = await pool.query('SELECT admin_id FROM admin');
        for (const admin of admins.rows) {
          await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, is_read) VALUES ($1, $2, $3, $4, false)',
            [admin.admin_id, 'admin', `New Circular: ${title}`, circular_details || `A new circular "${title}" has been published.`]
          );
        }
      } catch (notifErr) {
        console.error('Failed to create notifications:', notifErr);
        // Don't fail the request if notification creation fails
      }
      
      return res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/department/list - Get all departments
router.get(
  '/list',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM department ORDER BY department_name');
      return res.json(result.rows);
    } catch (err) {
      console.error('Departments fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/department/staff
router.get(
  '/staff',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    const { department_id } = req.query;
    try {
      const result = await pool.query(
        'SELECT * FROM faculty WHERE department_id = $1 ORDER BY faculty_name',
        [department_id]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Staff fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// PUT /api/department/leave-approval
router.put(
  '/leave-approval',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    const { leave_id, status, remarks } = req.body;
    try {
      const result = await pool.query(
        `UPDATE student_leave_requests
         SET status=$1, reviewed_by=$2, review_timestamp=NOW(), remarks=$3
         WHERE leave_id=$4
         RETURNING *`,
        [status, req.user.id, remarks || null, leave_id]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Leave approval error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/department/leave-requests
router.get(
  '/leave-requests',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT lr.*, s.name, s.usn
         FROM student_leave_requests lr
         JOIN student s ON s.student_id = lr.student_id
         WHERE lr.status = 'pending'
         ORDER BY lr.timestamp DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Leave requests fetch error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/department/pending-marks - Get pending marks for approval
router.get(
  '/pending-marks',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          ms.*,
          s.email as student_email,
          s.phone as student_phone,
          d.department_name
         FROM marks_student ms
         LEFT JOIN student s ON ms.student_id = s.student_id
         LEFT JOIN department d ON s.department_id = d.department_id
         WHERE ms.approval_status = 'pending'
         ORDER BY ms.usn, ms.semester, ms.created_at DESC`
      );

      res.json({
        success: true,
        records: result.rows
      });
    } catch (err) {
      console.error('Error fetching pending marks:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error fetching pending marks', 
        error: err.message 
      });
    }
  }
);

// PUT /api/department/approve-marks - Approve or reject marks
router.put(
  '/approve-marks',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  [
    body('mark_id').isInt().withMessage('Mark ID is required'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { mark_id, action, remarks } = req.body;
      const approverId = req.user.id;
      const approverRole = req.user.role;

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const result = await pool.query(
        `UPDATE marks_student 
         SET approval_status = $1,
             approved_by = $2,
             approved_at = NOW(),
             approval_remarks = $4,
             updated_at = NOW()
         WHERE mark_id = $5 
         RETURNING *`,
        [newStatus, approverId, remarks, mark_id]
      );

      // Create notification for student when marks are approved
      if (action === 'approve' && result.rows.length > 0) {
        const markRecord = result.rows[0];
        try {
          await pool.query(
            `INSERT INTO notifications (user_id, user_type, title, message, is_read)
             VALUES ($1, 'student', $2, $3, false)`,
            [
              markRecord.student_id,
              'Marks Approved',
              `Your marks for ${markRecord.subject_name} (${markRecord.subject_code}) have been approved.`
            ]
          );
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr);
          // Don't fail the request if notification fails
        }
      }

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mark record not found'
        });
      }

      res.json({
        success: true,
        record: result.rows[0],
        message: `Marks ${action}d successfully`
      });

    } catch (err) {
      console.error('Error approving marks:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error processing approval', 
        error: err.message 
      });
    }
  }
);

// GET /api/department/approved-marks - Get approved marks
router.get(
  '/approved-marks',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          ms.*,
          s.email as student_email,
          d.department_name
         FROM marks_student ms
         LEFT JOIN student s ON ms.student_id = s.student_id
         LEFT JOIN department d ON s.department_id = d.department_id
         WHERE ms.approval_status = 'approved'
         ORDER BY ms.approved_at DESC`
      );

      res.json({
        success: true,
        records: result.rows
      });
    } catch (err) {
      console.error('Error fetching approved marks:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error fetching approved marks', 
        error: err.message 
      });
    }
  }
);

// GET /api/department/pending-internships
router.get(
  '/pending-internships',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT si.*, s.name AS student_name, s.usn, d.department_name
         FROM student_internships si
         JOIN student s ON si.student_id = s.student_id
         LEFT JOIN department d ON s.department_id = d.department_id
         WHERE si.approval_status = 'pending'
         ORDER BY si.created_at DESC`
      );
      // Parse stack_data JSONB if it's a string
      const records = result.rows.map(row => {
        if (typeof row.stack_data === 'string') {
          try {
            row.stack_data = JSON.parse(row.stack_data);
          } catch (e) {
            row.stack_data = {};
          }
        }
        return row;
      });
      res.json({ success: true, records });
    } catch (err) {
      console.error('Error fetching internships:', err);
      res.status(500).json({ success: false, message: 'Server error fetching internships', error: err.message });
    }
  }
);

router.put(
  '/approve-internship',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  [
    body('internship_id').isInt(),
    body('action').isIn(['approve', 'reject']),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { internship_id, action, remarks } = req.body;
    try {
      const result = await pool.query(
        `UPDATE student_internships
         SET approval_status = $1,
             approved_by = $2,
             approved_role = $3,
             approved_at = NOW(),
             approval_remarks = $4
         WHERE internship_id = $5
         RETURNING *`,
        [action === 'approve' ? 'approved' : 'rejected', req.user.id, req.user.role, remarks, internship_id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ success: false, message: 'Internship not found' });
      }
      res.json({ success: true, record: result.rows[0] });
    } catch (err) {
      console.error('Error approving internship:', err);
      res.status(500).json({ success: false, message: 'Server error approving internship', error: err.message });
    }
  }
);

router.get(
  '/pending-certificates',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT sc.*, s.name AS student_name, s.usn
         FROM student_certificates sc
         JOIN student s ON sc.student_id = s.student_id
         WHERE sc.approval_status = 'pending'
         ORDER BY sc.created_at DESC`
      );
      res.json({ success: true, records: result.rows });
    } catch (err) {
      console.error('Error fetching certificates:', err);
      res.status(500).json({ success: false, message: 'Server error fetching certificates', error: err.message });
    }
  }
);

router.put(
  '/approve-certificate',
  authenticate,
  authorizeRoles('faculty', 'admin', 'department'),
  [
    body('certificate_id').isInt(),
    body('action').isIn(['approve', 'reject']),
    body('remarks').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { certificate_id, action, remarks } = req.body;
    try {
      const result = await pool.query(
        `UPDATE student_certificates
         SET approval_status = $1,
             approved_by = $2,
             approved_role = $3,
             approved_at = NOW(),
             approval_remarks = $4
         WHERE certificate_id = $5
         RETURNING *`,
        [action === 'approve' ? 'approved' : 'rejected', req.user.id, req.user.role, remarks, certificate_id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ success: false, message: 'Certificate not found' });
      }
      res.json({ success: true, record: result.rows[0] });
    } catch (err) {
      console.error('Error approving certificate:', err);
      res.status(500).json({ success: false, message: 'Server error approving certificate' });
    }
  }
);

export default router;