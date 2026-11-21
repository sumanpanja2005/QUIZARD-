import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Calendar,
  Eye,
} from 'lucide-react';
import studentService from '../services/studentService';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatDate, formatDuration, formatSeconds, getDifficultyColor } from '../utils/formatters';

export const StudentDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await studentService.getDashboard();
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
  }

  if (error || !dashboardData) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description={error || 'Please check your connection and try again.'}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  const { welcomeMessage, student, stats, availableCompetitions, recentQuizHistory } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={student.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`}
            alt={student.name}
            className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 p-1 object-cover"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-indigo-100 text-[11px] font-medium mb-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Student Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{welcomeMessage}</h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
              {student.institution ? `${student.institution} • ` : ''}Ready for your next competitive challenge?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/competitions"
            className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Explore Quizzes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/leaderboard"
            className="px-4 py-2.5 bg-indigo-800/60 hover:bg-indigo-800 border border-indigo-400/40 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={CheckCircle2}
          label="Quizzes Attempted"
          value={stats.totalQuizzesAttempted}
          subtext="Total completed sessions"
          color="indigo"
        />
        <StatCard
          icon={Award}
          label="Total Points Earned"
          value={stats.totalPointsEarned}
          subtext="Cumulative score earned"
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.averageScore}%`}
          subtext="Overall accuracy rate"
          color="amber"
        />
        <StatCard
          icon={Trophy}
          label="Current Global Rank"
          value={stats.currentGlobalRanking !== '-' ? `#${stats.currentGlobalRanking}` : 'Unranked'}
          subtext="Among all active students"
          color="purple"
        />
      </div>

      {/* Available Competitions Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Available Competitions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live and open competitions ready for your attempt.
            </p>
          </div>
          <Link
            to="/competitions"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableCompetitions.length === 0 ? (
          <EmptyState
            title="No active competitions"
            description="Check back soon for new competitions added by administrators."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCompetitions.map((quiz) => (
              <div
                key={quiz._id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group bg-slate-50/40 hover:bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {quiz.subject}
                    </span>
                    <Badge variant={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty || 'Medium'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Test your knowledge in this timed competition.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(quiz.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{quiz.totalMarks} Marks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  {quiz.isAttempted && !quiz.allowRetakes ? (
                    <div className="w-full py-2 px-3 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <Link
                      to={`/quiz/${quiz._id}/instructions`}
                      className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{quiz.isAttempted && quiz.allowRetakes ? 'Retake Quiz' : 'Start Quiz'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quiz History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Recent Quiz History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your completed quiz attempts, marks, and detailed answers.
            </p>
          </div>
        </div>

        {recentQuizHistory.length === 0 ? (
          <EmptyState
            title="No quiz attempts yet"
            description="You haven't attempted any quiz competitions yet. Explore available competitions and test your skills!"
            actionLabel="Start First Quiz"
            onAction={() => (window.location.href = '/competitions')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Competition</th>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Percentage</th>
                  <th className="py-3 px-4 font-semibold">Time Taken</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQuizHistory.map((item) => (
                  <tr key={item.attemptId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{item.quizTitle}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                        {item.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      {item.score} <span className="text-xs text-slate-400 font-normal">/ {item.totalMarks}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          item.percentage >= 60
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {formatSeconds(item.timeTaken)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{formatDate(item.submittedAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/quiz/result/${item.attemptId}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Result</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
