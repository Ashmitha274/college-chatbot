import { useState } from 'react';
import { api } from '../../api/client.js';

const FacultyProfile = () => {
  const [form, setForm] = useState({ courses: '', department_id: '', bio: '', time_details: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        courses: form.courses.split('\n').filter(Boolean),
        time_details: form.time_details ? { details: form.time_details } : {}
      };
      await api.post('/faculty/profile', payload);
      setStatus('Profile updated successfully!');
      setForm({ courses: '', department_id: '', bio: '', time_details: '' });
    } catch (err) {
      console.error('Profile update error:', err);
      setStatus('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Faculty Profile</h2>
      <p className="mb-4 text-sm text-slate-500">Update teaching info</p>
      <form className="space-y-3" onSubmit={submit}>
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Courses (one per line)"
          value={form.courses}
          onChange={(e) => setForm((prev) => ({ ...prev, courses: e.target.value }))}
        />
        <input
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Department ID"
          value={form.department_id}
          onChange={(e) => setForm((prev) => ({ ...prev, department_id: e.target.value }))}
        />
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Bio"
          value={form.bio}
          onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
        />
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Time Details (optional)"
          value={form.time_details}
          onChange={(e) => setForm((prev) => ({ ...prev, time_details: e.target.value }))}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>
      {status && <p className="mt-2 text-sm text-success">{status}</p>}
    </section>
  );
};

export default FacultyProfile;


