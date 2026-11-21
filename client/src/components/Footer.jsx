import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, MapPin, Phone, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">QUIZARD</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              The premier online quiz competition and ranking platform designed for ambitious students and academic institutions worldwide.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="https://github.com/sumanpanja2005" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://x.com/panjasuman2005" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/u/suman-panja-934694314" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Competitions</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/competitions" className="hover:text-indigo-400 transition-colors">
                  All Competitions
                </Link>
              </li>
              <li>
                <Link to="/competitions?subject=Computer+Science" className="hover:text-indigo-400 transition-colors">
                  Computer Science
                </Link>
              </li>
              <li>
                <Link to="/competitions?subject=Web+Development" className="hover:text-indigo-400 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/competitions?subject=Mathematics" className="hover:text-indigo-400 transition-colors">
                  Mathematics & Logic
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-indigo-400 transition-colors">
                  Global Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-400 transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-indigo-400 transition-colors">
                  Administrator Portal
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>support@quizard.edu</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+1 6846546565</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Tech Innovation Hub</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QUIZARD Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors">
              Terms of Competition
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors">
              Code of Academic Integrity
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
