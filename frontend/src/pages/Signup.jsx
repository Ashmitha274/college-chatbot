import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { isValidEmail, isValidPassword } from '../utils/validators.js';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', usn: '', role: 'student' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (name, value, nextForm = form) => {
    if (name === 'name' && !value.trim()) return 'Name is required';
    if (name === 'email' && !isValidEmail(value)) return 'Enter a valid email';
    if (name === 'password' && !isValidPassword(value)) {
      return 'Password must include uppercase, lowercase, number & symbol';
    }
    if (name === 'usn' && nextForm.role === 'student' && !value.trim()) return 'USN is required for students';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    const errorMsg = validate(name, value, nextForm);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const canSubmit =
    form.name &&
    isValidEmail(form.email) &&
    isValidPassword(form.password) &&
    (form.role !== 'student' || form.usn) &&
    !Object.values(fieldErrors).some(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      name: validate('name', form.name),
      email: validate('email', form.email),
      password: validate('password', form.password),
      usn: validate('usn', form.usn)
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      alert('Please resolve highlighted errors.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', form);
      alert('Registration successful! Please login with your new account.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onSubmit={handleSubmit} noValidate>
        <h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
        <p className="mb-6 text-sm text-slate-500">Register as a new user</p>
        {error && <p className="mb-4 rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="space-y-3">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-bold text-slate-500 uppercase">I am a:</label>
            <select
              className="w-full rounded border border-slate-200 px-3 py-2 bg-white"
              value={form.role}
              name="role"
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="department">Department Head</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Full Name"
              value={form.name}
              name="name"
              onChange={handleChange}
              required
            />
            {fieldErrors.name && <span className="text-xs text-danger">{fieldErrors.name}</span>}
          </div>

          {form.role === 'student' && (
            <div className="flex flex-col gap-1">
              <input
                className="w-full rounded border border-slate-200 px-3 py-2"
                placeholder="USN (Student ID)"
                value={form.usn}
                name="usn"
                onChange={handleChange}
                required
              />
              {fieldErrors.usn && <span className="text-xs text-danger">{fieldErrors.usn}</span>}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <input
              type="email"
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder={form.role === 'admin' || form.role === 'department' ? 'Email (used as username)' : 'Email Address'}
              value={form.email}
              name="email"
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <span className="text-xs text-danger">{fieldErrors.email}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <input
              type="password"
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Password (min 8 chars, strong)"
              value={form.password}
              name="password"
              onChange={handleChange}
              required
            />
            <span className={`text-xs ${isValidPassword(form.password) ? 'text-success' : 'text-danger'}`}>
              Must include uppercase, lowercase, number & symbol
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded bg-accent py-2 font-semibold text-white disabled:opacity-50"
          disabled={loading || !canSubmit}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
