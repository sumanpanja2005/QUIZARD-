import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { formatDate, formatDuration, getDifficultyColor } from '../utils/formatters';

const SUBJECTS = [
  'All',
  'Web Development',
  'Computer Science',
  'Mathematics',
  'Science',
  'General Knowledge',
];

export const AvailableCompetitionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'All';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const res = await quizService.getQuizzes({
          subject: selectedSubject !== 'All' ? selectedSubject : undefined,
          search: searchTerm.trim() || undefined,
        });
        if (res.success) {
          setQuizzes(res.data || []);
        }
      } catch (err) {
        console.warn('Error loading competitions:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchQuizzes, 300);
    return () => clearTimeout(timer);
  }, [selectedSubject, searchTerm]);

  const handleSubjectChange = (subj) => {
    setSelectedSubject(subj);
    if (subj === 'All') {
      searchParams.delete('subject');
    } else {
      searchParams.set('subject', subj);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Active Quizzes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Available Quiz Competitions
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Select a competition to test your mastery. Each quiz features automated timer tracking, server-side score calculation, and instantaneous ranking updates.
        </p>
      </div>

      {/* Controls: Search & Category Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, subject, or keywords..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 pr-1">
            <Filter className="w-3.5 h-3.5" /> Subjects:
          </span>
          {SUBJECTS.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSubjectChange(sub)}
              className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Competitions Grid */}
      {loading ? (
        <LoadingSpinner text="Loading competitions..." />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No competitions found"
          description="Try selecting another subject or clearing your search filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedSubject('All');
            setSearchTerm('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {quiz.subject}
                  </span>
                  <Badge variant={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty || 'Medium'}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {quiz.description || 'Test your knowledge in this competitive quiz competition.'}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> Duration:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatDuration(quiz.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Award className="w-3.5 h-3.5" /> Total Marks:
                    </span>
                    <span className="font-semibold text-indigo-600">{quiz.totalMarks} Points</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> Closes On:
                    </span>
                    <span className="font-medium text-slate-700">{formatDate(quiz.endDate)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {quiz.isAttempted && !quiz.allowRetakes ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed ({quiz.userScore} pts)</span>
                    </div>
                    <Link
                      to={`/leaderboard/${quiz._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                    >
                      Rankings
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={`/quiz/${quiz._id}/instructions`}
                    className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{quiz.isAttempted && quiz.allowRetakes ? 'Retake Quiz' : 'Enter Competition'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCompetitionsPage;
