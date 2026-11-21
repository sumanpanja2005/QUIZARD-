import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  HelpCircle,
  Clock,
  Calendar,
  Award,
  CheckCircle,
  Eye,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { formatDate, formatDuration, getDifficultyColor } from '../utils/formatters';

const SUBJECT_OPTIONS = [
  'Web Development',
  'Computer Science',
  'Mathematics',
  'Science',
  'General Knowledge',
  'History',
  'Literature',
];

export const CreateQuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Edit / Create modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  const initialForm = {
    title: '',
    subject: 'Web Development',
    description: '',
    duration: 15,
    difficulty: 'Medium',
    status: 'published',
    allowRetakes: false,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchQuizzes = async () => {
    try {
      const res = await quizService.getQuizzes({ limit: 50 });
      if (res.success) {
        setQuizzes(res.data || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load quizzes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingQuizId(null);
    setFormData(initialForm);
    setIsEditModalOpen(true);
    setAlert(null);
  };

  const handleOpenEdit = (quiz) => {
    setEditingQuizId(quiz._id);
    setFormData({
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description || '',
      duration: quiz.duration,
      difficulty: quiz.difficulty || 'Medium',
      status: quiz.status || 'draft',
      allowRetakes: !!quiz.allowRetakes,
      startDate: new Date(quiz.startDate).toISOString().slice(0, 16),
      endDate: new Date(quiz.endDate).toISOString().slice(0, 16),
    });
    setIsEditModalOpen(true);
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      if (editingQuizId) {
        const res = await quizService.updateQuiz(editingQuizId, formData);
        if (res.success) {
          setAlert({ type: 'success', message: 'Quiz competition updated successfully!' });
        }
      } else {
        const res = await quizService.createQuiz(formData);
        if (res.success) {
          setAlert({ type: 'success', message: 'New quiz competition created successfully!' });
        }
      }
      setIsEditModalOpen(false);
      await fetchQuizzes();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save quiz competition.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" and all its questions and submissions?`)) {
      return;
    }
    try {
      const res = await quizService.deleteQuiz(quizId);
      if (res.success) {
        setAlert({ type: 'success', message: 'Quiz deleted successfully.' });
        fetchQuizzes();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete quiz.',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Competition Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, configure timing, publish/unpublish, and manage student competitions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Competition</span>
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Competitions Table */}
      {loading ? (
        <LoadingSpinner text="Loading competitions list..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>All Configured Competitions ({quizzes.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Title & Subject</th>
                  <th className="py-3.5 px-4 font-semibold">Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Marks</th>
                  <th className="py-3.5 px-4 font-semibold">Questions</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">End Date</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900 leading-tight">{quiz.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-indigo-600 font-medium">{quiz.subject}</span>
                        <span className="text-slate-300">•</span>
                        <Badge variant={getDifficultyColor(quiz.difficulty)} size="xs">
                          {quiz.difficulty}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 font-mono">
                      {formatDuration(quiz.duration)}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-indigo-600">
                      {quiz.totalMarks} pts
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <Link
                        to={`/admin/questions?quizId=${quiz._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{quiz.questionCount || 0} Questions</span>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <Badge variant={quiz.status === 'published' ? 'success' : 'default'}>
                        {quiz.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {formatDate(quiz.endDate)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(quiz)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id, quiz.title)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Quiz */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingQuizId ? 'Edit Quiz Competition' : 'Create New Quiz Competition'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Competition Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Full-Stack Web Development Championship 2026"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Area <span className="text-rose-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Objectives
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide context and subject topics covered in this competition..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (in minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                min={1}
                max={300}
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publication Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                <option value="draft">Draft (Hidden from students)</option>
                <option value="published">Published (Visible & open)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                name="allowRetakes"
                checked={formData.allowRetakes}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-800">
                Allow student retakes (If unchecked, students can only submit once)
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 rounded-xl shadow-xs"
            >
              {saving ? 'Saving...' : editingQuizId ? 'Update Competition' : 'Create Competition'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CreateQuizPage;
