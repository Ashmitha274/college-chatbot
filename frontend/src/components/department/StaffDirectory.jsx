import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const StaffDirectory = () => {
  const [departmentId, setDepartmentId] = useState('');
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (!departmentId) return;
    api.get('/department/staff', { params: { department_id: departmentId } }).then(({ data }) => setStaff(data));
  }, [departmentId]);

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Staff Directory</h2>
          <p className="text-sm text-slate-500">View faculty by department</p>
        </div>
        <input
          className="rounded border border-slate-200 px-3 py-2 text-sm"
          placeholder="Department ID"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        />
      </header>
      <ul className="space-y-2 text-sm text-slate-600">
        {staff.map((member) => (
          <li key={member.faculty_id} className="rounded border border-slate-200 p-3">
            <p className="font-medium">{member.faculty_name}</p>
            <p className="text-xs text-slate-500">{member.email}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StaffDirectory;


