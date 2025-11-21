import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isValidEmail } from '../utils/validators.js';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value, role = form.role) => {
    if (name === 'username') {
      if (!value.trim()) return 'Username is required';
      if (role !== 'student' && !isValidEmail(value)) {
        return 'Enter a valid institutional email';
      }
    }
    if (name === 'password' && !value.trim()) {
      return 'Password is required';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    if (name === 'role') {
      setFieldErrors((prev) => ({ ...prev, username: validateField('username', nextForm.username, value) }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
    setForm(nextForm);
  };

  const hasValidationErrors = Object.values(fieldErrors).some(Boolean) || !form.username || !form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameError = validateField('username', form.username);
    const passwordError = validateField('password', form.password);
    setFieldErrors({ username: usernameError, password: passwordError });
    if (usernameError || passwordError) {
      alert('Please fix highlighted errors before submitting.');
      return;
    }
    setError(null);
    try {
      const data = await login(form);
      const userRole = data.user.role;
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'faculty') {
        navigate('/faculty/dashboard');
      } else if (userRole === 'department') {
        navigate('/department/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onSubmit={handleSubmit} noValidate>
        <h1 className="text-2xl font-semibold text-slate-900">College Admin Portal</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in with your role credentials</p>
        {error && <p className="mb-4 rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <input
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Email / Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            {fieldErrors.username && <span className="text-xs text-danger">{fieldErrors.username}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              type="password"
              className="w-full rounded border border-slate-200 px-3 py-2"
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <span className="text-xs text-danger">{fieldErrors.password}</span>}
          </div>
          <select
            className="w-full rounded border border-slate-200 px-3 py-2"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="department">Department</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded bg-accent py-2 font-semibold text-white disabled:opacity-50"
          disabled={loading || hasValidationErrors}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login;