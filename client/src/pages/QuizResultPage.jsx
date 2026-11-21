import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import attemptService from '../services/attemptService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { formatSeconds, formatDate } from '../utils/formatters';

export const QuizResultPage = () => {
  const { id: attemptId } = useParams();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!location.state?.resultData);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      if (result) {
        triggerConfetti(result.percentage);
        return;
      }
      try {
        const res = await attemptService.getAttemptResult(attemptId);
        if (res.success && res.data) {
          setResult(res.data);
          triggerConfetti(res.data.percentage);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load result details.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  const triggerConfetti = (pct) => {
    if (pct >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // gracefully handle if confetti canvas fails
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Compiling your examination results..." />;
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Alert type="error" message={error || 'Result record not found'} />
        <div className="mt-6 text-center">
          <Link
            to="/student/dashboard"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = result.percentage >= 50;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Result Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 text-center relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-xs">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Competition Result & Scorecard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {result.quizTitle || result.quiz?.title}
        </p>

        {/* Big Score Summary Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-slate-50 border border-indigo-100/60 max-w-xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Score</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {result.score}{' '}
                <span className="text-xs font-normal text-slate-400">/ {result.totalMarks}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Percentage</p>
              <p
                className={`text-2xl font-black mt-1 ${
                  isPassed ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {result.percentage}%
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Time Taken</p>
              <p className="text-2xl font-black text-slate-800 mt-1 font-mono">
                {formatSeconds(result.timeTaken)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rank</p>
              <p className="text-2xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>#{result.competitionRank || 1}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/leaderboard/${result.quizId || result.quiz?._id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>View Competition Standings</span>
          </Link>
          <Link
            to="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Student Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Question Reviews Section (Educational Post-Quiz Learning) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Question Review & Answer Key</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare your selections with the verified correct answers and study explanations.
          </p>
        </div>

        <div className="space-y-6">
          {(result.questionReviews || []).map((q, idx) => {
            const isCorrect = q.isCorrect;
            return (
              <div
                key={q.questionId || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-rose-50/20 border-rose-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center text-white ${
                        isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {isCorrect ? 'Correct Answer' : 'Incorrect'}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? `+${q.marksAwarded} Marks` : `0 / ${q.marks} Marks`}
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-sm font-semibold text-slate-900 mb-4">{q.questionText}</h3>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const isStudentChoice = q.selectedOption === opt.id;
                    const isCorrectChoice = q.correctAnswer === opt.id;

                    let optClasses = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrectChoice) {
                      optClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                    } else if (isStudentChoice && !isCorrect) {
                      optClasses = 'border-rose-400 bg-rose-50 text-rose-800 font-medium';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${optClasses}`}
                      >
                        <span className="font-bold shrink-0">{opt.id}.</span>
                        <span className="flex-1 leading-normal">{opt.text}</span>
                        {isCorrectChoice && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isStudentChoice && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/60 text-xs text-slate-600 bg-white/70 p-3 rounded-xl">
                    <span className="font-bold text-slate-800">Explanation: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
