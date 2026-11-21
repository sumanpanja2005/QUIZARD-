import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  School,
  Lock,
  Save,
  Trophy,
  Award,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import studentService from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import StatCard from '../components/StatCard';
import { formatDate } from '../utils/formatters';

export const StudentProfilePage = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentService.getProfile();
        if (res.success) {
          setProfile(res.data);
          setFormData({
            name: res.data.name || '',
            institution: res.data.institution || '',
            bio: res.data.bio || '',
            currentPassword: '',
            newPassword: '',
          });
        }
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const payload = {
        name: formData.name,
        institution: formData.institution,
        bio: formData.bio,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await studentService.updateProfile(payload);
      if (res.success) {
        updateUser(res.user);
        setProfile((prev) => ({ ...prev, ...res.user }));
        setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        setAlert({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading student profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={
            profile?.profileImage ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username}`
          }
          alt={profile?.name}
          className="w-24 h-24 rounded-3xl bg-indigo-50 border-2 border-indigo-100 object-cover shadow-sm"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{profile?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold capitalize">
              {profile?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">@{profile?.username} • {profile?.email}</p>
          <p className="text-xs text-slate-600 mt-2 max-w-lg">
            {profile?.bio || 'Passionate student participating in online academic competitions.'}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Member since {formatDate(profile?.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={Trophy}
          label="Current Global Rank"
          value={profile?.stats?.rank ? `#${profile.stats.rank}` : 'Unranked'}
          subtext="Leaderboard placement"
          color="amber"
        />
        <StatCard
          icon={Award}
          label="Total Points"
          value={profile?.stats?.totalPoints || 0}
          subtext="Cumulative competition score"
          color="indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label="Quizzes Completed"
          value={profile?.stats?.quizzesAttempted || 0}
          subtext="Finished examination sessions"
          color="emerald"
        />
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          <span>Edit Profile Information</span>
        </h2>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            className="mb-6"
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution / School</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="e.g. Stanford University"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / About Me</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about your academic focus or hobbies..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Change Password Sub-section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Change Password (Leave blank to keep existing)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
