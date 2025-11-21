import express from 'express';
import multer from 'multer';

import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/faculty/profile
router.post(
  '/profile',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const facultyId = req.user.id;
    let { courses, department_id, time_details, bio } = req.body;
    
    // Convert courses array to JSONB
    let coursesJson = {};
    if (courses) {
      if (Array.isArray(courses)) {
        coursesJson = { course_list: courses };
      } else if (typeof courses === 'string') {
        // If it's a newline-separated string, convert to array
        const courseArray = courses.split('\n').map(c => c.trim()).filter(Boolean);
        coursesJson = { course_list: courseArray };
      } else if (typeof courses === 'object') {
        coursesJson = courses;
      }
    }
    
    // Handle department_id - convert to integer if provided
    let deptId = null;
    if (department_id) {
      deptId = parseInt(department_id, 10);
      if (isNaN(deptId)) {
        deptId = null;
      }
    }
    
    try {
      // Check if profile exists
      const existing = await pool.query('SELECT faculty_id FROM faculty_profile WHERE faculty_id = $1', [facultyId]);
      
      if (existing.rows.length > 0) {
        // Update existing
        const result = await pool.query(
          `UPDATE faculty_profile 
           SET courses = $1, department_id = $2, time_details = $3, bio = $4, updated_at = NOW()
           WHERE faculty_id = $5
           RETURNING *`,
          [JSON.stringify(coursesJson), deptId, JSON.stringify(time_details || {}), bio || null, facultyId]
        );
        return res.json(result.rows[0]);
      } else {
        // Insert new
        const result = await pool.query(
          `INSERT INTO faculty_profile (faculty_id, courses, department_id, time_details, bio)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [facultyId, JSON.stringify(coursesJson), deptId, JSON.stringify(time_details || {}), bio || null]
        );
        return res.json(result.rows[0]);
      }
    } catch (err) {
      console.error('Faculty profile error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/faculty/courses - upload course materials
router.post(
  '/courses',
  authenticate,
  authorizeRoles('faculty'),
  upload.array('materials'),
  async (req, res) => {
    const facultyId = req.user.id;
    const { course_code, course_name, semester, academic_year } = req.body;
    const materials = (req.files || []).map((f) => ({ filename: f.originalname, path: f.path }));
    try {
      const result = await pool.query(
        `INSERT INTO faculty_courses (faculty_id, course_code, course_name, materials, semester, academic_year)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          facultyId,
          course_code || null,
          course_name || 'Unnamed Course',
          JSON.stringify(materials),
          semester ? parseInt(semester, 10) : null,
          academic_year || null
        ]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Course upload error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/faculty/attendance - Mark/edit attendance
router.post(
  '/attendance',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const { records, course_id, date } = req.body;
    const facultyId = req.user.id;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const insertPromises = records
        .filter(record => record.student_id) // Only process records with student_id
        .map((record) => {
          return pool.query(
            `INSERT INTO student_attendance (student_id, faculty_id, course_id, date, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (student_id, course_id, date)
             DO UPDATE SET status = EXCLUDED.status, created_at = NOW()
             RETURNING *`,
            [
              parseInt(record.student_id, 10),
              facultyId,
              course_id ? parseInt(course_id, 10) : null,
              attendanceDate,
              record.status || 'present'
            ]
          );
        });
      
      await Promise.all(insertPromises);
      return res.json({ message: 'Attendance recorded successfully', count: records.length });
    } catch (err) {
      console.error('Attendance error:', err);
      return res.status(500).json({ message: 'Server error recording attendance' });
    }
  }
);

// GET /api/faculty/attendance - Get attendance records
router.get(
  '/attendance',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const { course_id, date } = req.query;
    try {
      let query = `SELECT sa.*, s.name as student_name, s.usn 
                   FROM student_attendance sa
                   JOIN student s ON sa.student_id = s.student_id
                   WHERE sa.faculty_id = $1`;
      const params = [req.user.id];
      
      if (course_id) {
        query += ` AND sa.course_id = $${params.length + 1}`;
        params.push(course_id);
      }
      if (date) {
        query += ` AND sa.date = $${params.length + 1}`;
        params.push(date);
      }
      
      query += ' ORDER BY sa.date DESC, s.name';
      const result = await pool.query(query, params);
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/faculty/students - Get student lists by faculty department
router.get(
  '/students',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      const faculty = await pool.query('SELECT department_id FROM faculty WHERE faculty_id=$1', [req.user.id]);
      const departmentId = faculty.rows[0]?.department_id;
      const result = await pool.query('SELECT * FROM student WHERE department_id=$1 ORDER BY name', [departmentId]);
      return res.json(result.rows);
    } catch (err) {
      console.error('Students fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/faculty/projects - Get student projects for review
router.get(
  '/projects',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      const faculty = await pool.query('SELECT department_id FROM faculty WHERE faculty_id=$1', [req.user.id]);
      const departmentId = faculty.rows[0]?.department_id;
      
      const result = await pool.query(
        `SELECT sp.*, s.name as student_name, s.usn
         FROM student_projects sp
         JOIN student s ON sp.student_id = s.student_id
         WHERE s.department_id = $1
         ORDER BY sp.created_at DESC`,
        [departmentId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Projects fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// PUT /api/faculty/projects/:id - Approve/reject project
router.put(
  '/projects/:id',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      // Note: We need to add status column to student_projects if not exists
      const result = await pool.query(
        `UPDATE student_projects 
         SET guide_id = $1, updated_at = NOW()
         WHERE project_id = $2
         RETURNING *`,
        [req.user.id, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json(result.rows[0]);
    } catch (err) {
      console.error('Project update error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/faculty/courses - Get faculty courses with materials
router.get(
  '/courses',
  authenticate,
  authorizeRoles('faculty'),
  async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM faculty_courses WHERE faculty_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      
      // Parse materials JSONB if it's a string
      const courses = result.rows.map(course => {
        if (course.materials && typeof course.materials === 'string') {
          try {
            course.materials = JSON.parse(course.materials);
          } catch (e) {
            course.materials = [];
          }
        }
        return course;
      });
      
      return res.json(courses);
    } catch (err) {
      console.error('Courses fetch error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/faculty/materials/:filename - Download course material file
router.get(
  '/materials/:filename',
  authenticate,
  authorizeRoles('faculty', 'student'),
  async (req, res) => {
    try {
      const { filename } = req.params;
      const path = require('path');
      const fs = require('fs');
      // Handle both direct filename and path with backslashes/slashes
      const cleanFilename = filename.replace(/^.*[\\/]/, '');
      const filePath = path.join(process.cwd(), 'uploads', cleanFilename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      res.download(filePath, (err) => {
        if (err) {
          console.error('File download error:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error downloading file' });
          }
        }
      });
    } catch (err) {
      console.error('Material download error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

export default router;


