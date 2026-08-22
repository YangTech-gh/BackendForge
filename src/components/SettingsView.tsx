import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Trash2, 
  Save, 
  AlertTriangle,
  CheckCircle2,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserState } from '../types';

interface SettingsViewProps {
  userState: UserState;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userState }) => {
  const { user, updateProfile, updatePassword, deleteAccount, signOut } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await updateProfile({ fullName });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Profile updated successfully.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await updatePassword(newPassword);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const result = await deleteAccount();
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-2xl" role="main" aria-label="Account Settings">
      
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6">
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>ACCOUNT SETTINGS</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Manage your profile, password, and account preferences.
        </p>
      </header>

      {/* Status Messages */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Section */}
      <section className="liquid-glass border border-zinc-800 rounded-2xl p-6 space-y-4" aria-labelledby="profile-heading">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-zinc-400" />
          <h2 id="profile-heading" className="text-lg font-bold text-white">Profile</h2>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-mono text-zinc-400">Email</label>
            <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-300">{user?.email}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-xs font-mono text-zinc-400">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              placeholder="Your full name"
            />
          </div>

          <div className="flex items-center space-x-4 text-xs text-zinc-500">
            <span>Tier: <span className={`font-bold ${userState.tier === 'pro' ? 'text-emerald-400' : 'text-zinc-300'}`}>{userState.tier.toUpperCase()}</span></span>
            <span>XP: <span className="font-bold text-amber-400">{userState.xpPoints}</span></span>
            <span>Labs Completed: <span className="font-bold text-zinc-300">{userState.completedLabs.length}</span></span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </section>

      {/* Password Section */}
      <section className="liquid-glass border border-zinc-800 rounded-2xl p-6 space-y-4" aria-labelledby="password-heading">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-zinc-400" />
          <h2 id="password-heading" className="text-lg font-bold text-white">Change Password</h2>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-xs font-mono text-zinc-400">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-mono text-zinc-400">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              placeholder="Repeat your password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </section>

      {/* Account Actions */}
      <section className="liquid-glass border border-zinc-800 rounded-2xl p-6 space-y-4" aria-labelledby="account-heading">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-zinc-400" />
          <h2 id="account-heading" className="text-lg font-bold text-white">Account Actions</h2>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-3 rounded-xl text-sm transition"
          >
            <span>Sign Out</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-4 py-3 rounded-xl text-sm transition border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
              <p className="text-xs text-red-300 font-bold">Are you sure? This action cannot be undone.</p>
              <p className="text-xs text-red-400/80">All your data, progress, and certificates will be permanently deleted.</p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
