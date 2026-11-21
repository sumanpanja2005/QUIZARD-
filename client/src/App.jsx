import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public & Student Pages
import HomePage from './pages/HomePage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentLoginPage from './pages/StudentLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AvailableCompetitionsPage from './pages/AvailableCompetitionsPage';
import QuizInstructionsPage from './pages/QuizInstructionsPage';
import LiveQuizPage from './pages/LiveQuizPage';
import QuizResultPage from './pages/QuizResultPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateQuizPage from './pages/CreateQuizPage';
import ManageQuestionsPage from './pages/ManageQuestionsPage';
import ManageStudentsPage from './pages/ManageStudentsPage';
import CompetitionResultsPage from './pages/CompetitionResultsPage';

function App() {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<StudentRegisterPage />} />
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/competitions" element={<AvailableCompetitionsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/leaderboard/:quizId" element={<LeaderboardPage />} />
      </Route>

      {/* Quiz Attempt Flow (Protected for Students) */}
      <Route
        path="/quiz/:id/instructions"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizInstructionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id/live"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <LiveQuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/result/:id"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />

      {/* Student Portal (Protected for Students) wrapped in StudentLayout */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Admin Portal (Protected for Admins) wrapped in AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="create-quiz" element={<CreateQuizPage />} />
        <Route path="questions" element={<ManageQuestionsPage />} />
        <Route path="students" element={<ManageStudentsPage />} />
        <Route path="submissions" element={<CompetitionResultsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
