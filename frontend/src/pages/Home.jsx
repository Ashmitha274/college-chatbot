import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent">CollegePortal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-accent"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Manage Your Academic Journey
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A centralized platform for students, faculty, and departments to manage records, 
            assignments, and administrative tasks efficiently.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-accent/90"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="text-base font-semibold leading-6 text-slate-900"
            >
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;