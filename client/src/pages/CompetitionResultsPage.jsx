import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Eye,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import adminService from '../services/adminService';
import attemptService from '../services/attemptService';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate, formatSeconds } from '../utils/formatters';

export const CompetitionResultsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal inspection of individual attempt
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const res = await quizService.getQuizzes({ limit: 100 });
        if (res.success) {
          setCompetitions(res.data || []);
        }
      } catch (err) {
        console.warn('Error loading competitions:', err.message);
      }
    };

    fetchCompetitions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSubmissions({
        quizId: selectedQuizId !== 'All' ? selectedQuizId : undefined,
        limit: 50,
      });
      if (res.success) {
        setSubmissions(res.data || []);
      }
    } catch (err) {
      console.warn('Submissions error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedQuizId]);

  const handleInspectAttempt = async (attemptId) => {
    setIsModalOpen(true);
    setInspectLoading(true);
    try {
      const res = await attemptService.getAttemptResult(attemptId);
      if (res.success) {
        setSelectedAttempt(res.data);
      }
    } catch (err) {
      console.warn('Inspection load error:', err.message);
    } finally {
      setInspectLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Competition Submissions & Results
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect student attempts, verify score calculations, and review evaluation records.
        </p>
      </div>

      {/* Filter Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Filter by Competition:
          </span>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="flex-1 sm:flex-none text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="All">All Competitions ({competitions.length})</option>
            {competitions.map((q) => (
              <option key={q._id} value={q._id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Total Submissions: {submissions.length}
        </span>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving student submissions..." />
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No submissions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No completed attempts exist for the selected competition filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold">Competition</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Percentage</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Time Taken</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted At</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            sub.studentId?.profileImage ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${sub.studentId?.username}`
                          }
                          alt={sub.studentId?.name}
                          className="w-9 h-9 rounded-xl bg-indigo-50 border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {sub.studentId?.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{sub.studentId?.username || 'user'} • {sub.studentId?.institution || 'Independent'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-800">
                      <p className="line-clamp-1">{sub.quizId?.title || 'Quiz Competition'}</p>
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        {sub.quizId?.subject}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-indigo-600">
                      {sub.score}{' '}
                      <span className="text-xs text-slate-400 font-normal">
                        / {sub.quizId?.totalMarks || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          sub.percentage >= 50
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-center font-mono text-slate-600">
                      {formatSeconds(sub.timeTaken)}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {formatDate(sub.submittedAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleInspectAttempt(sub._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Inspection of Attempt */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Evaluation Breakdown"
        maxWidth="max-w-3xl"
      >
        {inspectLoading ? (
          <LoadingSpinner text="Loading answers..." />
        ) : selectedAttempt ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Student</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                  {selectedAttempt.student?.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Score</p>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">
                  {selectedAttempt.score} / {selectedAttempt.totalMarks}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Percentage</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">
                  {selectedAttempt.percentage}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Time Taken</p>
                <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                  {formatSeconds(selectedAttempt.timeTaken)}
                </p>
              </div>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {(selectedAttempt.questionReviews || []).map((q, idx) => {
                const isCorrect = q.isCorrect;
                return (
                  <div
                    key={q.questionId || idx}
                    className={`p-4 rounded-2xl border text-xs ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/30 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700">Question {idx + 1}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? `+${q.marksAwarded} Marks` : '0 Marks'}
                      </span>
                    </div>

                    <p className="font-medium text-slate-900 mb-3">{q.questionText}</p>

                    <div className="space-y-1.5">
                      {q.options?.map((opt) => {
                        const isStudent = q.selectedOption === opt.id;
                        const isRight = q.correctAnswer === opt.id;

                        let optClass = 'bg-white border-slate-200 text-slate-600';
                        if (isRight) {
                          optClass = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isStudent && !isCorrect) {
                          optClass = 'bg-rose-100 border-rose-300 text-rose-900 font-semibold';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${optClass}`}
                          >
                            <span>
                              <strong>{opt.id}.</strong> {opt.text}
                            </span>
                            {isRight && <span className="text-[10px] font-bold">✓ Correct</span>}
                            {isStudent && !isCorrect && (
                              <span className="text-[10px] font-bold">✗ Selected</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CompetitionResultsPage;
