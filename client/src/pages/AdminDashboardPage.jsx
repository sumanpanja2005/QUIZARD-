import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  HelpCircle,
  FileCheck2,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Award,
} from 'lucide-react';
import adminService from '../services/adminService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import { formatDate, formatSeconds } from '../utils/formatters';

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.warn('Admin dashboard error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading administrator dashboard..." />;
  }

  const { stats, recentStudents, recentSubmissions, subjectStats } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time platform activity metrics, competition management, and student monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/create-quiz"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Quiz</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Platform Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Users}
          label="Registered Students"
          value={stats?.totalStudents || 0}
          subtext="Active platform participants"
          color="indigo"
        />
        <StatCard
          icon={BookOpen}
          label="Total Competitions"
          value={stats?.totalCompetitions || 0}
          subtext={`${stats?.totalPublishedCompetitions || 0} currently published`}
          color="purple"
        />
        <StatCard
          icon={HelpCircle}
          label="Total Questions"
          value={stats?.totalQuestions || 0}
          subtext="Across all subjects"
          color="amber"
        />
        <StatCard
          icon={FileCheck2}
          label="Quiz Submissions"
          value={stats?.totalSubmissions || 0}
          subtext="Completed student evaluations"
          color="emerald"
        />
      </div>

      {/* Subject Distribution */}
      {subjectStats && subjectStats.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Competitions by Subject Area</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {subjectStats.map((item) => (
              <div
                key={item._id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between"
              >
                <span className="text-xs font-semibold text-slate-700 truncate">{item._id}</span>
                <span className="text-xl font-bold text-indigo-600 mt-2">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Recent Registrations & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registered Students */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Recent Student Registrations</span>
              </h2>
              <Link
                to="/admin/students"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {(recentStudents || []).map((student) => (
                <div key={student._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-400">
                      @{student.username} • {student.institution || 'Independent'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={student.status === 'active' ? 'success' : 'danger'}>
                      {student.status}
                    </Badge>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatDate(student.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Recent Quiz Submissions</span>
              </h2>
              <Link
                to="/admin/submissions"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {(recentSubmissions || []).map((sub) => (
                <div key={sub._id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {sub.studentId?.name || 'Student'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {sub.quizId?.title || 'Competition'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-indigo-600">
                      {sub.score}{' '}
                      <span className="text-[10px] text-slate-400">/ {sub.quizId?.totalMarks}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatSeconds(sub.timeTaken)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
