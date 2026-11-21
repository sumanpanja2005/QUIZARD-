import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please provide admin username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(identifier.trim(), password);
      if (res.success) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Admin authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setIdentifier('admin@quizard.com');
    setPassword('AdminPassword123!');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Administrator Console</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in with authorized staff credentials to manage competitions, questions, and students.
          </p>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Username or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@quizard.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Administrator Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 rounded-xl shadow-md shadow-indigo-100 transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Verifying Admin Access...' : 'Sign In as Admin'}</span>
          </button>
        </form>

        {/* Demo Admin One-Click Button */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="w-full py-2.5 px-3 border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 rounded-xl text-xs font-semibold text-indigo-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fill Seeded Admin Credentials (1-Click)</span>
          </button>
          <p className="mt-1.5 text-[10px] text-center text-slate-400">
            Email: <code className="text-slate-600 font-mono">admin@quizard.com</code> | Password: <code className="text-slate-600 font-mono">AdminPassword123!</code>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Student looking to take quizzes?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
