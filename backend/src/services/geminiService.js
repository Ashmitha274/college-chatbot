import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBsRe5oRDrQNg-0RYVOoMcYvd73eBSNJZc';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SCHEMA_CONTEXT = `
Database Schema for college-management:

Tables:
1. student (student_id, usn, name, email, department_id, address, phone, parent_phone)
2. faculty (faculty_id, faculty_name, email, department_id, phone)
3. department (department_id, department_name)
4. admin (admin_id, username, role)
5. marks_student (mark_id, student_id, usn, student_name, semester, subject_code, subject_name, internal_marks, external_marks, total_marks, result, approval_status)
6. student_leave_requests (leave_id, student_id, leave_details, from_date, to_date, status)
7. student_internships (internship_id, student_id, company, start_date, end_date, stipend, approval_status)
8. student_certificates (certificate_id, student_id, certificate_type, competition, internship, workshop, approval_status)
9. student_projects (project_id, student_id, project_name, domain, impact)
10. faculty_courses (course_id, faculty_id, course_name, semester, academic_year)
11. department_activities (event_id, department_id, event_title, event_details, event_date)
12. department_circulars (circular_id, department_id, title, circular_details)
13. login_logs (log_id, user_id, user_type, login_date, login_timestamp)
14. notifications (notification_id, user_id, user_type, title, message, is_read)

Important Notes:
- Always use parameterized queries for security
- For student role: filter by student_id = $userId
- For faculty role: filter by faculty_id = $userId or department_id
- For admin/department: full access
- Use proper JOINs when needed
- Return only SELECT queries, never INSERT/UPDATE/DELETE
`;



export const generateSQL = async (userQuery, userRole, userId) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const roleContext = {
      student: `You are querying as a STUDENT with student_id = ${userId}. Only return data for this student. Always include WHERE student_id = $1 in all queries that access student data.`,
      faculty: `You are querying as a FACULTY with faculty_id = ${userId}. You can access your courses, department data, and student data in your department. Use WHERE faculty_id = $1 when filtering by faculty.`,
      admin: `You are querying as an ADMIN. You have full database access. No user-specific filtering needed unless the query explicitly asks for it.`,
      department: `You are querying as a DEPARTMENT HEAD. You can access all department-related data.`
    };

    const prompt = `
${SCHEMA_CONTEXT}

${roleContext[userRole] || roleContext.admin}

User Query: "${userQuery}"

Generate a PostgreSQL SELECT query that answers this question. 
Rules:
1. Return ONLY the SQL query, no explanations
2. Use parameterized placeholders ($1, $2, etc.) for user_id when needed
3. Use proper JOINs when accessing related tables
4. Include appropriate WHERE clauses based on user role
5. Use meaningful column aliases
6. Order results logically (ORDER BY when appropriate)
7. Limit results to 100 rows if not specified

SQL Query:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let sql = response.text().trim();

    // Clean up SQL - remove markdown code blocks if present
    sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Replace $userId placeholder with actual parameter
    if (userRole === 'student') {
      sql = sql.replace(/\$userId/g, `$${sql.split('$').length}`);
    }

    return sql;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate SQL query: ' + error.message);
  }
};

export const formatResponse = async (userQuery, sql, results) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
The user asked: "${userQuery}"

The SQL query executed was: ${sql}

The results returned ${results.length} row(s).

Results data:
${JSON.stringify(results.slice(0, 10), null, 2)}${results.length > 10 ? '\n... (showing first 10 rows)' : ''}

Generate a natural, conversational English response that:
1. Answers the user's question directly
2. Summarizes the key findings
3. Mentions the number of records found
4. Highlights important data points
5. Is friendly and helpful
6. If no results, explain why (e.g., "No records found matching your criteria")

Response (plain text, no markdown):
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini Format Error:', error);
    // Fallback response
    if (results.length === 0) {
      return 'No records found for your query.';
    }
    return `Found ${results.length} record(s). Here are the results.`;
  }
};

