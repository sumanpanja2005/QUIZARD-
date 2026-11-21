import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export const ManageQuestionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuizId = searchParams.get('quizId') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(initialQuizId);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Question Form State
  const initialQuestionState = {
    questionText: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    correctAnswer: 'A',
    marks: 5,
    explanation: '',
  };

  const [questionForm, setQuestionForm] = useState(initialQuestionState);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Load all quizzes for dropdown
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizService.getQuizzes({ limit: 100 });
        if (res.success) {
          const list = res.data || [];
          setQuizzes(list);
          if (!selectedQuizId && list.length > 0) {
            setSelectedQuizId(list[0]._id);
          }
        }
      } catch (err) {
        console.warn('Error loading quizzes list:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Fetch full details of selected quiz (including questions with correct answers since admin is logged in)
  const fetchCurrentQuiz = async (quizId) => {
    if (!quizId) return;
    try {
      const res = await quizService.getQuiz(quizId);
      if (res.success) {
        setCurrentQuiz(res.data);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load quiz details.' });
    }
  };

  useEffect(() => {
    if (selectedQuizId) {
      fetchCurrentQuiz(selectedQuizId);
      setSearchParams({ quizId: selectedQuizId });
    }
  }, [selectedQuizId]);

  const handleOptionChange = (idx, text) => {
    setQuestionForm((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[idx] = { ...nextOptions[idx], text };
      return { ...prev, options: nextOptions };
    });
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm(initialQuestionState);
    setIsQuestionModalOpen(true);
    setAlert(null);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestionId(q._id);
    setQuestionForm({
      questionText: q.questionText,
      options: q.options || [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correctAnswer: q.correctAnswer || 'A',
      marks: q.marks || 5,
      explanation: q.explanation || '',
    });
    setIsQuestionModalOpen(true);
    setAlert(null);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    // Validation
    if (!questionForm.questionText.trim()) {
      setAlert({ type: 'error', message: 'Question text is required.' });
      setSaving(false);
      return;
    }

    const emptyOpt = questionForm.options.some((opt) => !opt.text.trim());
    if (emptyOpt) {
      setAlert({ type: 'error', message: 'Please provide text for all 4 options (A, B, C, D).' });
      setSaving(false);
      return;
    }

    try {
      if (editingQuestionId) {
        const res = await quizService.updateQuestion(selectedQuizId, editingQuestionId, questionForm);
        if (res.success) {
          setAlert({ type: 'success', message: 'Question updated successfully!' });
        }
      } else {
        // DYNAMIC ADDITION WITHOUT REFRESHING THE PAGE!
        const res = await quizService.addQuestion(selectedQuizId, questionForm);
        if (res.success) {
          setAlert({ type: 'success', message: 'Question added dynamically to quiz!' });
        }
      }
      setIsQuestionModalOpen(false);
      await fetchCurrentQuiz(selectedQuizId);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save question.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await quizService.deleteQuestion(selectedQuizId, qId);
      if (res.success) {
        setAlert({ type: 'success', message: 'Question deleted successfully.' });
        fetchCurrentQuiz(selectedQuizId);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete question.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading question management..." />;
  }

  const questions = currentQuiz?.questions || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manage Competition Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamically add multiple-choice questions with 4 options, designate correct answers, and set marks.
          </p>
        </div>

        {selectedQuizId && (
          <button
            onClick={handleOpenAddQuestion}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        )}
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Competition Selector Dropdown Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Competition
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="mt-1 font-bold text-slate-900 bg-transparent border-0 p-0 text-base focus:ring-0 cursor-pointer"
            >
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title} ({q.subject})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentQuiz && (
          <div className="flex items-center gap-4 text-xs">
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium">
              Questions: <strong>{questions.length}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold">
              Total Marks: {currentQuiz.totalMarks || 0}
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No questions added yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              This competition currently has zero questions. Add questions dynamically to open it for students.
            </p>
            <button
              onClick={handleOpenAddQuestion}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Question</span>
            </button>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    +{q.marks} Mark{q.marks > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditQuestion(q)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Question"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-slate-900 leading-relaxed mb-4">
                {q.questionText}
              </h3>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options?.map((opt) => {
                  const isCorrect = q.correctAnswer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-bold shrink-0">{opt.id}.</span>
                      <span className="flex-1 truncate">{opt.text}</span>
                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Add / Edit Question Dynamically */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestionId ? 'Edit Question' : 'Add New Question (Dynamic)'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={questionForm.questionText}
              onChange={(e) =>
                setQuestionForm((prev) => ({ ...prev, questionText: e.target.value }))
              }
              placeholder="e.g. Which hook executes DOM mutations synchronously in React?"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Multiple-Choice Options & Correct Answer Selection <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-400 -mt-1">
              Select the radio button next to the option that is the correct answer.
            </p>

            {questionForm.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={opt.id}
                    checked={questionForm.correctAnswer === opt.id}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({ ...prev, correctAnswer: e.target.value }))
                    }
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-700 w-5">({opt.id})</span>
                </label>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${opt.id} text...`}
                  required
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marks for Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={questionForm.marks}
                onChange={(e) =>
                  setQuestionForm((prev) => ({ ...prev, marks: Number(e.target.value) || 1 }))
                }
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Explanation (Optional for review)
              </label>
              <input
                type="text"
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))
                }
                placeholder="Why this answer is correct..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 rounded-xl shadow-xs"
            >
              {saving ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageQuestionsPage;
