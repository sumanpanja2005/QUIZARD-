import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LayoutDashboard, Award, User, BookOpen } from 'lucide-react';

export const StudentLayout = () => {
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      {/* Sub-header navigation bar for student portal */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto">
            <NavLink to="/student/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/competitions" className={navLinkClass}>
              <BookOpen className="w-4 h-4" />
              <span>Competitions</span>
            </NavLink>
            <NavLink to="/leaderboard" className={navLinkClass}>
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </NavLink>
            <NavLink to="/student/profile" className={navLinkClass}>
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </NavLink>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentLayout;
