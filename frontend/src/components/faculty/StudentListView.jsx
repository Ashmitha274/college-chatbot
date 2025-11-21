import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const StudentListView = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/faculty/students').then(({ data }) => setStudents(data));
  }, []);

  const filtered = students.filter((student) =>
    student.name?.toLowerCase().includes(query.toLowerCase()) ||
    student.usn?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Student List</h2>
          <p className="text-sm text-slate-500">Filtered by department</p>
        </div>
        <input
          className="rounded border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search name or USN"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">USN</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2 text-left">Parent Phone</th>
              <th className="px-3 py-2 text-left">Address</th>
              <th className="px-3 py-2 text-left">Batch Year</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.student_id} className="border-b border-slate-100">
                <td className="px-3 py-2">{student.usn}</td>
                <td className="px-3 py-2">{student.name}</td>
                <td className="px-3 py-2">{student.email || 'N/A'}</td>
                <td className="px-3 py-2">{student.phone || 'N/A'}</td>
                <td className="px-3 py-2">{student.parent_phone || 'N/A'}</td>
                <td className="px-3 py-2">{student.address || 'N/A'}</td>
                <td className="px-3 py-2">{student.batch_year || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default StudentListView;


