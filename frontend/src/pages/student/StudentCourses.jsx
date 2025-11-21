import { useState, useEffect } from 'react';
import PageWrapper from '../../components/common/PageWrapper.jsx';
import { api } from '../../api/client.js';
import { exportToPDF } from '../../utils/pdfExport.js';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/student/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper showBackButton backPath="/student/dashboard">
      <div id="courses-content" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Course Materials</h1>
          <button
            onClick={() => exportToPDF('courses-content', 'student-courses.pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as PDF
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No course materials available yet.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.course_id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{course.course_name}</h3>
                    <p className="text-sm text-slate-600">Faculty: {course.faculty_name || 'N/A'}</p>
                    {course.semester && <p className="text-sm text-slate-600">Semester: {course.semester}</p>}
                    {course.academic_year && <p className="text-sm text-slate-600">Year: {course.academic_year}</p>}
                  </div>
                </div>
                {course.materials && Array.isArray(course.materials) && course.materials.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Materials:</p>
                    <ul className="space-y-2">
                      {course.materials.map((material, idx) => {
                        // Extract filename from path (handle both / and \ separators)
                        const filePath = material.path || '';
                        const fileName = filePath ? filePath.split(/[/\\]/).pop() : material.filename || `File ${idx + 1}`;
                        const displayName = material.filename || fileName;
                        const downloadUrl = `/api/student/materials/${encodeURIComponent(fileName)}`;
                        return (
                          <li key={idx} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <a 
                              href={downloadUrl} 
                              download={displayName}
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              {displayName}
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default StudentCourses;

