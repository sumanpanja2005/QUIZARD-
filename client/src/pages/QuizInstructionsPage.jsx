import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
} from 'lucide-react';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { formatDate, formatDuration, getDifficultyColor } from '../utils/formatters';

export const QuizInstructionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuiz(id);
        if (res.success) {
          setQuiz(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz instructions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading quiz details..." />;
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Alert type="error" message={error || 'Quiz not found'} />
        <div className="mt-6 text-center">
          <Link
            to="/competitions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Competitions</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    if (!agreed) return;
    navigate(`/quiz/${quiz._id}/live`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <Link
        to="/competitions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Competitions</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-indigo-100">
              {quiz.subject}
            </span>
            <Badge variant={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty || 'Medium'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{quiz.title}</h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            {quiz.description || 'Welcome to this timed academic competition.'}
          </p>
        </div>

        {/* Competition Specifications Grid */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 text-center">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-400 font-medium">Duration</p>
              <p className="text-base font-bold text-slate-900">{formatDuration(quiz.duration)}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 text-center">
              <Award className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-400 font-medium">Total Marks</p>
              <p className="text-base font-bold text-slate-900">{quiz.totalMarks} Points</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 text-center">
              <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-400 font-medium">Questions</p>
              <p className="text-base font-bold text-slate-900">{quiz.questionCount || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/70 text-center">
              <CheckCircle className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-400 font-medium">Retakes</p>
              <p className="text-base font-bold text-slate-900">
                {quiz.allowRetakes ? 'Allowed' : 'Single Try'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Rules and Guidelines */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <span>Competition Instructions & Rules</span>
          </h2>

          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                1
              </span>
              <span>
                <strong>Multiple-Choice Format:</strong> Each question provides four options (A, B, C, D). Select one correct answer per question.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                2
              </span>
              <span>
                <strong>Continuous Countdown Timer:</strong> The countdown timer begins the instant you click <em>"Start Live Quiz"</em>. Navigating away or reloading will not pause the timer.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                3
              </span>
              <span>
                <strong>Auto-Submission:</strong> When the countdown reaches zero, all your chosen answers are automatically submitted to the server for evaluation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                4
              </span>
              <span>
                <strong>Server Scoring & Tiebreaker:</strong> Scores are calculated securely by the backend scoring engine. In the event of a points tie, completion speed serves as the tiebreaker.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                5
              </span>
              <span>
                <strong>Immediate Results:</strong> Once submitted, you will immediately see your total score, percentage, correct answer review, and placement on the competition ranking table.
              </span>
            </li>
          </ul>

          {/* Acknowledgement check */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">
                I understand the rules and agree to adhere to QUIZARD academic integrity guidelines.
              </span>
            </label>
          </div>

          {/* Start CTA */}
          <div className="pt-2">
            <button
              onClick={handleStart}
              disabled={!agreed}
              className="w-full py-3.5 px-6 flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-md shadow-indigo-100 transition-all"
            >
              <span>Start Live Quiz Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructionsPage;
