import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const InternshipApproval = () => {
  const [records, setRecords] = useState([]);
  const [remarks, setRemarks] = useState({});

  const loadRecords = async () => {
    try {
      const { data } = await api.get('/department/pending-internships');
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to load internships', err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const act = async (internshipId, action) => {
    try {
      await api.put('/department/approve-internship', {
        internship_id: internshipId,
        action,
        remarks: remarks[internshipId] || ''
      });
      loadRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update internship');
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Internship Approvals</h2>
          <p className="text-sm text-slate-500">Review student internship submissions</p>
        </div>
        <button className="text-sm text-accent" type="button" onClick={loadRecords}>
          Refresh
        </button>
      </div>
      {records.length === 0 && <p className="text-sm text-slate-500">No pending internships.</p>}
      <div className="space-y-4">
        {records.map((item) => (
          <div key={item.internship_id} className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{item.student_name}</p>
                <p className="text-xs text-slate-500">{item.usn}</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Pending</span>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <p><span className="text-slate-500">Company:</span> {item.company}</p>
              <p><span className="text-slate-500">Duration:</span> {item.start_date} → {item.end_date || 'NA'}</p>
              <p><span className="text-slate-500">Stipend:</span> {item.stipend || 'NA'}</p>
              <p>
                <span className="text-slate-500">Stack:</span>{' '}
                {(Array.isArray(item.stack_data)
                  ? item.stack_data
                  : item.stack_data
                  ? Object.values(item.stack_data)
                  : []
                ).join(', ')}
              </p>
            </div>
            <textarea
              className="mt-3 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              placeholder="Remarks"
              value={remarks[item.internship_id] || ''}
              onChange={(e) => setRemarks((prev) => ({ ...prev, [item.internship_id]: e.target.value }))}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded bg-success px-4 py-2 text-xs font-semibold text-white"
                onClick={() => act(item.internship_id, 'approve')}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded bg-danger px-4 py-2 text-xs font-semibold text-white"
                onClick={() => act(item.internship_id, 'reject')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InternshipApproval;

