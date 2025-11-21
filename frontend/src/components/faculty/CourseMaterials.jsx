import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const CourseMaterials = () => {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ course_code: '', course_name: '', semester: '', academic_year: '' });
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/faculty/courses');
      setUploads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }
    if (!form.course_name && !form.course_code) {
      alert('Please enter course name');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('materials', file));
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const { data } = await api.post('/faculty/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploads((prev) => [data, ...prev]);
      setFiles([]);
      setForm({ course_code: '', course_name: '', semester: '', academic_year: '' });
      alert('Course materials uploaded successfully!');
      fetchCourses(); // Refresh list
    } catch (err) {
      console.error('Course upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload course materials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Course Materials</h2>
          <p className="text-sm text-slate-500">Share syllabus, notes & notifications</p>
        </div>
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Course Code (optional)"
          value={form.course_code}
          onChange={(e) => setForm((prev) => ({ ...prev, course_code: e.target.value }))}
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Course Name *"
          value={form.course_name}
          onChange={(e) => setForm((prev) => ({ ...prev, course_name: e.target.value }))}
          required
        />
        <input
          type="number"
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Semester (optional)"
          value={form.semester}
          onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Academic Year (optional)"
          value={form.academic_year}
          onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))}
        />
      </div>
      <button
        type="button"
        className="mt-4 rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        onClick={handleUpload}
        disabled={!files.length || !form.course_name || loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      <div className="mt-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Uploaded Courses:</h3>
        {uploads.length === 0 ? (
          <p className="text-sm text-slate-500">No courses uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {uploads.map((upload) => {
              const materials = typeof upload.materials === 'string' 
                ? JSON.parse(upload.materials) 
                : (upload.materials || []);
              return (
                <div key={upload.course_id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-slate-800">
                        {upload.course_code && `${upload.course_code} - `}{upload.course_name}
                      </p>
                      {upload.semester && <p className="text-xs text-slate-500">Semester: {upload.semester}</p>}
                      {upload.academic_year && <p className="text-xs text-slate-500">Year: {upload.academic_year}</p>}
                    </div>
                    <span className="text-xs text-slate-500">{materials.length} file(s)</span>
                  </div>
                  {materials.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {materials.map((material, idx) => {
                        const filePath = material.path || '';
                        const fileName = filePath ? filePath.split(/[/\\]/).pop() : material.filename || `File ${idx + 1}`;
                        return (
                          <div key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {material.filename || fileName}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseMaterials;


