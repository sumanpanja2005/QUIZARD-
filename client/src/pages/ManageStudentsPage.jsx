import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { formatDate } from '../utils/formatters';

export const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [alert, setAlert] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents({
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleToggleStatus = async (studentId, currentStatus, studentName) => {
    const action = currentStatus === 'active' ? 'block' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${studentName}'s account?`)) return;

    try {
      const res = await adminService.toggleStudentStatus(studentId);
      if (res.success) {
        setAlert({ type: 'success', message: res.message });
        setStudents((prev) =>
          prev.map((s) => (s._id === studentId ? { ...s, status: res.data.status } : s))
        );
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update student status.',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Student Account Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review registered students, performance statistics, and toggle account access status.
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, username, email, institution..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          {['All', 'active', 'blocked'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner text="Searching student records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold">Institution</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Quizzes</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Points</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Avg Score</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Registered</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const isActive = student.status === 'active';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student.profileImage ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`
                            }
                            alt={student.name}
                            className="w-9 h-9 rounded-xl bg-indigo-50 border border-slate-200 object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              @{student.username} • {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {student.institution || 'Independent'}
                      </td>
                      <td className="py-4 px-4 text-xs text-center font-medium text-slate-700">
                        {student.quizzesAttempted || 0}
                      </td>
                      <td className="py-4 px-4 text-xs text-center font-bold text-indigo-600">
                        {student.totalPoints || 0}
                      </td>
                      <td className="py-4 px-4 text-xs text-center font-medium text-slate-700">
                        {student.avgScore || 0}%
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <Badge variant={isActive ? 'success' : 'danger'}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {formatDate(student.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(student._id, student.status, student.name)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudentsPage;
