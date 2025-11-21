import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const CertificatesApproval = () => {
  const [records, setRecords] = useState([]);
  const [remarks, setRemarks] = useState({});

  const loadRecords = async () => {
    try {
      const { data } = await api.get('/department/pending-certificates');
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to load certificates', err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const act = async (certificateId, action) => {
    try {
      await api.put('/department/approve-certificate', {
        certificate_id: certificateId,
        action,
        remarks: remarks[certificateId] || ''
      });
      loadRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to update certificate');
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Certificates Approval</h2>
          <p className="text-sm text-slate-500">Validate uploaded certificates</p>
        </div>
        <button className="text-sm text-accent" type="button" onClick={loadRecords}>
          Refresh
        </button>
      </div>
      {records.length === 0 && <p className="text-sm text-slate-500">No pending certificates.</p>}
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.certificate_id} className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{record.student_name}</p>
                <p className="text-xs text-slate-500">{record.usn}</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Pending</span>
            </div>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <p><span className="text-slate-500">Type:</span> {record.certificate_type}</p>
              <p><span className="text-slate-500">Competition:</span> {record.competition || 'NA'}</p>
              <p><span className="text-slate-500">Internship:</span> {record.internship || 'NA'}</p>
              <p><span className="text-slate-500">Workshop:</span> {record.workshop || 'NA'}</p>
            </div>
            {record.file_path && (
              <a
                href={record.file_path}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs text-accent underline"
              >
                View Attachment
              </a>
            )}
            <textarea
              className="mt-3 w-full rounded border border-slate-200 px-3 py-2 text-sm"
              placeholder="Remarks"
              value={remarks[record.certificate_id] || ''}
              onChange={(e) => setRemarks((prev) => ({ ...prev, [record.certificate_id]: e.target.value }))}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded bg-success px-4 py-2 text-xs font-semibold text-white"
                onClick={() => act(record.certificate_id, 'approve')}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded bg-danger px-4 py-2 text-xs font-semibold text-white"
                onClick={() => act(record.certificate_id, 'reject')}
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

export default CertificatesApproval;

