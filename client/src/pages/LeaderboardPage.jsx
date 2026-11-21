import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Medal,
  Clock,
  CheckCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import leaderboardService from '../services/leaderboardService';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatSeconds } from '../utils/formatters';

export const LeaderboardPage = () => {
  const { quizId } = useParams();

  const [leaderboardData, setLeaderboardData] = useState(null);
  const [competitionsList, setCompetitionsList] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(quizId || 'global');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load competitions for selector
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await quizService.getQuizzes({ limit: 50 });
        if (res.success) {
          setCompetitionsList(res.data || []);
        }
      } catch (err) {
        console.warn('Error fetching quizzes for leaderboard filter:', err.message);
      }
    };
    fetchCompetitions();
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (selectedQuizId === 'global') {
          const res = await leaderboardService.getGlobalLeaderboard({ page, limit: 15 });
          if (res.success) {
            setLeaderboardData(res.data);
          }
        } else {
          const res = await leaderboardService.getQuizLeaderboard(selectedQuizId, {
            page,
            limit: 15,
          });
          if (res.success) {
            setLeaderboardData({
              topThree: res.data.topThree,
              students: res.data.rankings,
              pagination: res.data.pagination,
              quizMeta: res.quiz,
            });
          }
        }
      } catch (err) {
        console.warn('Leaderboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedQuizId, page]);

  const handleSelectQuiz = (val) => {
    setSelectedQuizId(val);
    setPage(1);
  };

  const topThree = leaderboardData?.topThree || [];
  const students = leaderboardData?.students || [];
  const pagination = leaderboardData?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header & Controls */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-semibold tracking-wider uppercase mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Official Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Academic Leaderboard & Rankings
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Rankings are calculated dynamically. Highest points earn top placement, with fastest average time breaking ties.
        </p>

        {/* Competition Filter Selector */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/60 rounded-2xl max-w-md w-full">
          <select
            value={selectedQuizId}
            onChange={(e) => handleSelectQuiz(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm font-semibold text-slate-800 py-2.5 px-4 rounded-xl border border-transparent focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs cursor-pointer"
          >
            <option value="global">🏆 Global Student Leaderboard (All Quizzes)</option>
            {competitionsList.map((c) => (
              <option key={c._id} value={c._id}>
                📖 {c.title} ({c.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Computing rankings..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No ranking entries recorded"
          description="Be the very first student to complete a quiz in this category!"
          actionLabel="View Competitions"
          onAction={() => (window.location.href = '/competitions')}
        />
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            {topThree.map((student, idx) => {
              const rank = idx + 1;
              const configs = {
                1: {
                  badgeBg: 'bg-amber-400 text-amber-950',
                  border: 'border-amber-300 ring-4 ring-amber-400/20 shadow-lg',
                  cardBg: 'bg-gradient-to-b from-amber-50/60 via-white to-slate-50',
                  order: 'order-1 md:order-2',
                  scale: 'md:-translate-y-4',
                  trophyColor: 'text-amber-500',
                  label: 'Gold Champion',
                },
                2: {
                  badgeBg: 'bg-slate-300 text-slate-800',
                  border: 'border-slate-300 shadow-md',
                  cardBg: 'bg-white',
                  order: 'order-2 md:order-1',
                  scale: '',
                  trophyColor: 'text-slate-400',
                  label: 'Silver Finalist',
                },
                3: {
                  badgeBg: 'bg-amber-700 text-white',
                  border: 'border-amber-600/30 shadow-md',
                  cardBg: 'bg-white',
                  order: 'order-3 md:order-3',
                  scale: '',
                  trophyColor: 'text-amber-700',
                  label: 'Bronze Finalist',
                },
              }[rank];

              return (
                <div
                  key={student.studentId || idx}
                  className={`${configs.order} ${configs.scale} ${configs.cardBg} ${configs.border} rounded-3xl border p-6 flex flex-col items-center text-center transition-all`}
                >
                  <div className="relative mb-3">
                    <img
                      src={
                        student.profileImage ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`
                      }
                      alt={student.name}
                      className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-white shadow-md object-cover"
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black ${configs.badgeBg} shadow-xs flex items-center gap-1`}
                    >
                      <Trophy className="w-3 h-3" />
                      <span>#{rank}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider ${configs.trophyColor}`}>
                    {configs.label}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{student.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">@{student.username}</p>

                  <div className="w-full mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-medium">Score / Points</p>
                      <p className="text-base font-bold text-indigo-600">
                        {student.totalPoints !== undefined ? student.totalPoints : student.score}
                      </p>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-medium">Time</p>
                      <p className="text-base font-bold text-slate-800 font-mono">
                        {formatSeconds(student.averageTime || student.timeTaken)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Standings Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Overall Rankings</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold w-20">Rank</th>
                    <th className="py-3.5 px-4 font-semibold">Student</th>
                    <th className="py-3.5 px-4 font-semibold">Institution</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Quizzes</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Avg Time</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <tr
                        key={entry.studentId}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isTop1 ? 'bg-amber-50/30 font-medium' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold ${
                              isTop1
                                ? 'bg-amber-400 text-amber-950'
                                : isTop2
                                ? 'bg-slate-300 text-slate-800'
                                : isTop3
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                entry.profileImage ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.username}`
                              }
                              alt={entry.name}
                              className="w-9 h-9 rounded-xl bg-indigo-50 border border-slate-200 object-cover"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{entry.name}</p>
                              <p className="text-xs text-slate-400">@{entry.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600">
                          {entry.institution || 'Independent Student'}
                        </td>
                        <td className="py-4 px-4 text-xs text-center font-medium text-slate-700">
                          {entry.quizzesAttempted !== undefined ? entry.quizzesAttempted : '1'}
                        </td>
                        <td className="py-4 px-4 text-xs text-center font-mono text-slate-600">
                          {formatSeconds(entry.averageTime || entry.timeTaken)}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-indigo-600 text-base">
                          {entry.totalPoints !== undefined ? entry.totalPoints : entry.score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs text-slate-500">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
