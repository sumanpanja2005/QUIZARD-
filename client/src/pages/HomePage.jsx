import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Zap,
  ShieldCheck,
  Timer,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import leaderboardService from '../services/leaderboardService';
import quizService from '../services/quizService';
import { formatDuration, formatSeconds } from '../utils/formatters';

export const HomePage = () => {
  const [topStudents, setTopStudents] = useState([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [lbRes, quizRes] = await Promise.all([
          leaderboardService.getGlobalLeaderboard({ page: 1, limit: 3 }),
          quizService.getQuizzes({ limit: 3 }),
        ]);

        if (lbRes.success && lbRes.data) {
          setTopStudents(lbRes.data.topThree || []);
        }

        if (quizRes.success && quizRes.data) {
          setFeaturedQuizzes(quizRes.data || []);
        }
      } catch (err) {
        console.warn('Error loading home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-300 blur-3xl" />
          <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-blue-200 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Next-Gen Academic Competitions</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-5xl mx-auto">
            Challenge Your Knowledge.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
              Compete. Win!
            </span>
          </h1>

          {/* Short description */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            QUIZARD is the modern online arena where students test their intellect across disciplines, compete in real-time timed challenges, and earn their place on the global student leaderboard.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/competitions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-all hover:-translate-y-0.5"
            >
              <span>Explore Competitions</span>
            </Link>
          </div>

          {/* Trust stats banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-200/80">
            <div>
              <p className="text-3xl font-black text-slate-900">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Automated Scoring</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">Real-Time</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Timer & Auto-Submit</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">Tiebreaker</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Time-Based Ranking</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">Zero Leak</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Server-Side Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Students Leaderboard Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Hall of Fame</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Top Competitors</h2>
            <p className="mt-1 text-sm text-slate-500">
              Leading the global standings across all academic competition categories.
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Podium Layout */}
        {topStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">The Podium is Waiting for You!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              No students have taken the top spots yet. Register now, enter an active competition, and claim the #1 rank!
            </p>
            <Link
              to="/register"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Register & Take the Lead</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {topStudents.map((student, idx) => {
              const rank = idx + 1;
              const rankConfigs = {
                1: {
                  border: 'border-amber-300 ring-2 ring-amber-400/30',
                  badgeBg: 'bg-amber-400 text-amber-950',
                  label: '1st Place',
                  cardBg: 'bg-gradient-to-b from-amber-50/50 to-white',
                  order: 'order-1 md:order-2',
                  scale: 'md:-translate-y-4 shadow-lg',
                },
                2: {
                  border: 'border-slate-300',
                  badgeBg: 'bg-slate-300 text-slate-800',
                  label: '2nd Place',
                  cardBg: 'bg-white',
                  order: 'order-2 md:order-1',
                  scale: 'shadow-sm',
                },
                3: {
                  border: 'border-amber-600/30',
                  badgeBg: 'bg-amber-700 text-white',
                  label: '3rd Place',
                  cardBg: 'bg-white',
                  order: 'order-3 md:order-3',
                  scale: 'shadow-sm',
                },
              }[rank] || {
                border: 'border-slate-200',
                badgeBg: 'bg-slate-200 text-slate-700',
                label: `${rank}th Place`,
                cardBg: 'bg-white',
                order: 'order-3',
                scale: 'shadow-sm',
              };

              return (
                <div
                  key={student._id || idx}
                  className={`${rankConfigs.order} ${rankConfigs.scale} ${rankConfigs.cardBg} ${rankConfigs.border} rounded-2xl border p-6 flex flex-col items-center text-center transition-all`}
                >
                  <div className="relative mb-4">
                    <img
                      src={
                        student.profileImage ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${student.username}`
                      }
                      alt={student.name}
                      className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-white shadow-md object-cover"
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${rankConfigs.badgeBg} shadow-xs flex items-center gap-1`}
                    >
                      <Trophy className="w-3 h-3" />
                      <span>#{rank}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">@{student.username}</p>
                  {student.institution && (
                    <p className="text-xs text-indigo-600 font-medium mt-1 truncate max-w-full">
                      {student.institution}
                    </p>
                  )}

                  <div className="w-full mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-slate-400 font-medium">Total Points</p>
                      <p className="text-base font-bold text-indigo-600">{student.totalPoints}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-slate-400 font-medium">Avg Time</p>
                      <p className="text-base font-bold text-slate-800">
                        {formatSeconds(student.averageTime)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Competitions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-2">
              <Zap className="w-4 h-4" />
              <span>Live & Active</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Competitions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Join open competitions, beat the timer, and claim high ranking scores.
            </p>
          </div>
          <Link
            to="/competitions"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All Competitions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {quiz.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-slate-400" />
                    {formatDuration(quiz.duration)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {quiz.description || 'Join this competitive quiz and test your skills against top peers.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Total Marks: </span>
                  <span className="font-bold text-slate-800">{quiz.totalMarks} pts</span>
                </div>
                <Link
                  to={`/quiz/${quiz._id}/instructions`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                >
                  <span>Enter Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Compete on QUIZARD?</h2>
            <p className="mt-3 text-slate-600 text-sm">
              Engineered with academic integrity, fair play, and instant feedback at its foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Precise Countdown</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Live synchronized countdown timer ensures equal testing duration for every single student.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Server-Side Scoring</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Correct answers are never leaked to client browsers. Scores are computed securely on the backend.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Time-Based Tiebreakers</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Equal scores? Speed matters. Fast, accurate solvers rank higher on the global leaderboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Detailed Review</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                After submission, students view thorough question explanations to learn from their mistakes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-2 text-slate-500 text-sm">
            Three simple steps to compete, learn, and climb the ranks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-5 text-sm shadow-sm">
              1
            </span>
            <h3 className="text-lg font-bold text-slate-900">Create Student Account</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Register with your student details and browse active competitions across diverse academic disciplines.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-5 text-sm shadow-sm">
              2
            </span>
            <h3 className="text-lg font-bold text-slate-900">Compete Against Time</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Attempt multiple-choice questions with a live ticking timer. Navigate questions seamlessly with the palette.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <span className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-5 text-sm shadow-sm">
              3
            </span>
            <h3 className="text-lg font-bold text-slate-900">Instant Results & Rank</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Receive automatic score calculation instantly upon submit and see your position rise on the leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to showcase your knowledge?
            </h2>
            <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Join hundreds of motivated students currently testing their skills in computer science, web engineering, mathematics, and science competitions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 text-center text-sm font-bold text-indigo-900 bg-white hover:bg-indigo-50 rounded-xl shadow-md transition-colors"
            >
              Register Free
            </Link>
            <Link
              to="/competitions"
              className="px-6 py-3.5 text-center text-sm font-semibold text-white bg-indigo-800/80 hover:bg-indigo-800 border border-indigo-500/50 rounded-xl transition-colors"
            >
              View Active Quizzes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
