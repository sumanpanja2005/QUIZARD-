import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import attemptService from '../services/attemptService';
import { useQuizTimer } from '../hooks/useQuizTimer';
import Timer from '../components/Timer';
import QuestionPalette from '../components/QuestionPalette';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export const LiveQuizPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [attemptData, setAttemptData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: 'A' | 'B' | ... }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Auto-submit callback when timer reaches zero
  const handleTimeExpire = useCallback(() => {
    if (!submitting) {
      console.warn('⏰ Timer expired! Auto-submitting quiz attempt now...');
      performSubmission();
    }
  }, [submitting, attemptData, selectedAnswers]);

  // Initial attempt fetch
  useEffect(() => {
    const initAttempt = async () => {
      try {
        const res = await attemptService.startAttempt(quizId);
        if (res.success && res.data) {
          setAttemptData(res.data);

          // Populate saved answers if resuming
          const initialMap = {};
          if (res.data.savedAnswers && res.data.savedAnswers.length > 0) {
            res.data.savedAnswers.forEach((ans) => {
              const qIndex = res.data.quiz.questions.findIndex(
                (q) => q._id.toString() === ans.questionId.toString()
              );
              if (qIndex !== -1) {
                initialMap[qIndex] = ans.selectedOption;
              }
            });
          }
          setSelectedAnswers(initialMap);
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to start quiz attempt.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    initAttempt();
  }, [quizId]);

  // Timer hook
  const remainingSecs = attemptData?.remainingSeconds || 0;
  const { formattedTime, isUrgent, isCritical } = useQuizTimer(remainingSecs, handleTimeExpire);

  const performSubmission = async () => {
    if (!attemptData) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      // Format answers payload
      const formattedAnswers = attemptData.quiz.questions.map((q, idx) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[idx] || null,
      }));

      const res = await attemptService.submitAttempt(attemptData.attemptId, formattedAnswers);
      if (res.success) {
        navigate(`/quiz/result/${res.data.attemptId}`, {
          state: { resultData: res.data },
          replace: true,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSelectOption = (optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }));
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Preparing live examination..." />;
  }

  if (error && !attemptData) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Alert type="error" message={error} />
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/competitions')}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Competitions
          </button>
        </div>
      </div>
    );
  }

  const questions = attemptData?.quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.values(selectedAnswers).filter((a) => a !== null).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Quiz Top Action Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 truncate">
              {attemptData?.quiz?.subject}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate">
              {attemptData?.quiz?.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Timer
              formattedTime={formattedTime}
              isUrgent={isUrgent}
              isCritical={isCritical}
            />
            <button
              onClick={() => setShowSubmitModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Quiz</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Side: Question Display */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />}

            {currentQuestion ? (
              <div>
                {/* Question metadata */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {currentIndex + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    +{currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Question Text */}
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>

                {/* 4 Multiple Choice Options */}
                <div className="mt-8 space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedAnswers[currentIndex] === option.id;
                    return (
                      <label
                        key={option.id}
                        onClick={() => handleSelectOption(option.id)}
                        className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/30'
                            : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {option.id}
                        </div>
                        <span className="text-sm font-medium text-slate-800 leading-normal flex-1">
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState title="No question found" description="Please refresh." />
            )}
          </div>

          {/* Bottom Next/Prev & Submit Controls */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="sm:hidden">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
              >
                Submit
              </button>
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
              >
                <span>Finish & Submit</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Question Navigation Palette */}
        <div className="w-full lg:w-72">
          <QuestionPalette
            totalQuestions={totalQuestions}
            currentIndex={currentIndex}
            answers={selectedAnswers}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
          />
        </div>
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Quiz Examination?"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Ready to submit your answers?</h3>
          <p className="text-xs text-slate-500">
            You have answered <span className="font-bold text-indigo-600">{answeredCount}</span> of{' '}
            <span className="font-bold text-slate-700">{totalQuestions}</span> questions.
            {totalQuestions - answeredCount > 0 && (
              <span className="block text-amber-600 font-semibold mt-1">
                ⚠️ You have {totalQuestions - answeredCount} unanswered question(s).
              </span>
            )}
          </p>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Continue Quiz
            </button>
            <button
              onClick={performSubmission}
              disabled={submitting}
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LiveQuizPage;
