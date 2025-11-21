import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const linksByRole = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/features', label: 'Features' },
    { to: '/admin/fee-structure', label: 'Fee Structure' },
    { to: '/admin/login-logs', label: 'Login Logs' }
  ],
  faculty: [
    { to: '/faculty/dashboard', label: 'Dashboard' },
    { to: '/faculty/courses', label: 'Courses' },
    { to: '/faculty/attendance', label: 'Attendance' },
    { to: '/faculty/students', label: 'Students' },
    { to: '/faculty/projects', label: 'Projects' },
    { to: '/faculty/profile', label: 'Profile' }
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/marks', label: 'Marks' },
    { to: '/student/leave', label: 'Leave' },
    { to: '/student/projects', label: 'Projects' },
    { to: '/student/internships', label: 'Internships' },
    { to: '/student/certificates', label: 'Certificates' },
    { to: '/student/courses', label: 'Courses' },
    { to: '/student/attendance', label: 'Attendance' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/admin-curated', label: 'Admin Features' }
  ],
  department: [
    { to: '/department/dashboard', label: 'Dashboard' },
    { to: '/department/marks-approval', label: 'Marks Approval' },
    { to: '/department/leave-approval', label: 'Leave Approval' },
    { to: '/department/internship-approval', label: 'Internship Approval' },
    { to: '/department/certificates-approval', label: 'Certificates Approval' },
    { to: '/department/activities', label: 'Activities' },
    { to: '/department/circulars', label: 'Circulars' },
    { to: '/department/staff', label: 'Staff' }
  ]
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <aside className="w-64 bg-primary text-white flex flex-col">
      <div className="p-6 font-semibold text-lg border-b border-slate-700">College Admin Portal</div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="m-4 rounded bg-danger px-3 py-2 text-sm font-medium"
        onClick={logout}
      >
        Sign out
      </button>
    </aside>
  );
};

export default Sidebar;


