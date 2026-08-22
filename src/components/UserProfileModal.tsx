import React, { useState } from 'react';
import { 
  X, User, Mail, Award, BookOpen, Save, Loader2, 
  CreditCard, AlertTriangle, CheckCircle2, 
  ChevronRight, Shield, Sparkles, LogOut, Palette
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { invokeEdgeFunction } from '../lib/api';
import { UserState, CourseTrack } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
  courses: CourseTrack[];
}

type ProfileTab = 'overview' | 'payments' | 'settings';

const AVATAR_COLORS = [
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-indigo-600',
  'from-red-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-fuchsia-600',
];

export function UserProfileModal({ isOpen, onClose, userState, courses }: UserProfileModalProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarColor, setAvatarColor] = useState(user?.user_metadata?.avatar_color || AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Refund state
  const [refundReason, setRefundReason] = useState('');
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [refundResult, setRefundResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  if (!isOpen) return null;

  const completedCount = userState?.completedLabs?.length || 0;
  const totalLabs = courses.reduce((sum, t) => sum + (t.labs?.length || 0), 0);
  const completedTracks = courses.filter(t => {
    const labIds = t.labs.map(l => l.id);
    return labIds.length > 0 && labIds.every(id => userState.completedLabs.includes(id));
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_color: avatarColor }
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestRefund = async () => {
    setIsRequestingRefund(true);
    setRefundResult(null);
    try {
      const result = await invokeEdgeFunction<{ success: boolean; message: string }>('request-refund', {
        method: 'POST',
        body: { reason: refundReason },
      });
      setRefundResult({ success: true, message: result.message });
      setShowRefundConfirm(false);
    } catch (err: any) {
      setRefundResult({ success: false, message: err.message || 'Refund request failed' });
    } finally {
      setIsRequestingRefund(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-lg font-bold text-white">Profile & Settings</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 shrink-0">
          {([
            { id: 'overview' as const, label: 'Overview', icon: User },
            { id: 'payments' as const, label: 'Payments', icon: CreditCard },
            { id: 'settings' as const, label: 'Settings', icon: Palette },
          ]).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-red-500 bg-zinc-800/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg`}>
                  {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-zinc-500 mb-1 block">Display Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 min-w-0"
                      placeholder="Your name"
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || (fullName === (user?.user_metadata?.full_name || '') && avatarColor === (user?.user_metadata?.avatar_color || AVATAR_COLORS[0]))}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-sm text-zinc-300 truncate">{user?.email}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                  <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{userState?.xpPoints || 0}</div>
                  <div className="text-xs text-zinc-500">XP Points</div>
                </div>
                <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{completedCount}/{totalLabs}</div>
                  <div className="text-xs text-zinc-500">Labs Done</div>
                </div>
                <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white capitalize">{userState?.tier || 'free'}</div>
                  <div className="text-xs text-zinc-500">Tier</div>
                </div>
              </div>

              {/* Completed Tracks */}
              {completedTracks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">Completed Tracks</h3>
                  <div className="space-y-1.5">
                    {completedTracks.map(track => (
                      <div key={track.id} className="flex items-center gap-2 p-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-emerald-300 font-medium">{track.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Benefits */}
              {userState?.tier === 'pro' && (
                <div className="p-4 bg-gradient-to-r from-amber-950/30 to-zinc-900 border border-amber-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">Pro Lifetime Benefits</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-zinc-400">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> Access to all 20+ Pro labs</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> AI-powered code reviews</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {userState.coachingCallsRemaining} coaching sessions remaining</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <>
              {/* Current Plan */}
              <div className={`p-4 rounded-xl border ${
                userState?.tier === 'pro' 
                  ? 'bg-amber-950/20 border-amber-500/20' 
                  : 'bg-zinc-800/50 border-zinc-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {userState?.tier === 'pro' ? 'Pro Lifetime Access' : 'Free Tier'}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {userState?.tier === 'pro' ? '$199 one-time payment' : 'Upgrade to unlock all labs'}
                    </div>
                  </div>
                  {userState?.tier === 'pro' && (
                    <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Section (Pro users only) */}
              {userState?.tier === 'pro' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">Refund Policy</h3>
                  
                  {refundResult ? (
                    <div className={`p-4 rounded-xl border ${
                      refundResult.success 
                        ? 'bg-emerald-950/30 border-emerald-500/20' 
                        : 'bg-red-950/30 border-red-500/20'
                    }`}>
                      <div className="flex items-start gap-2">
                        {refundResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${refundResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                            {refundResult.success ? 'Refund Processed' : 'Refund Failed'}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">{refundResult.message}</p>
                        </div>
                      </div>
                    </div>
                  ) : showRefundConfirm ? (
                    <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-300">Request Full Refund</p>
                          <p className="text-xs text-zinc-400 mt-1">
                            Your Pro access will be immediately revoked and your account downgraded to Free tier. 
                            This action cannot be undone.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Reason (optional)</label>
                        <textarea
                          value={refundReason}
                          onChange={e => setRefundReason(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                          rows={2}
                          placeholder="Tell us why you'd like a refund..."
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowRefundConfirm(false); setRefundReason(''); }}
                          className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRequestRefund}
                          disabled={isRequestingRefund}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          {isRequestingRefund ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                          ) : (
                            <>Confirm Refund</>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRefundConfirm(true)}
                      className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-left hover:border-amber-500/30 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition" />
                          <span className="text-xs text-zinc-300 group-hover:text-white transition">Request a Refund</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 ml-6">
                        Full refund within 30 days of purchase. Access will be revoked.
                      </p>
                    </button>
                  )}
                </div>
              )}

              {/* Upgrade CTA for free users */}
              {userState?.tier === 'free' && (
                <div className="p-4 bg-gradient-to-r from-red-950/30 to-zinc-900 border border-red-500/20 rounded-xl text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-red-400 mx-auto" />
                  <p className="text-sm font-bold text-white">Unlock Pro Lifetime</p>
                  <p className="text-xs text-zinc-400">Get access to all labs, AI reviews, and coaching sessions</p>
                </div>
              )}
            </>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <>
              {/* Avatar Color Customization */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">Avatar Color</h3>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setAvatarColor(color)}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} transition-all ${
                        avatarColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">Display Name</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    placeholder="Your display name"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || (fullName === (user?.user_metadata?.full_name || '') && avatarColor === (user?.user_metadata?.avatar_color || AVATAR_COLORS[0]))}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved</> : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">Account</h3>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-left hover:border-red-500/30 hover:bg-red-950/20 transition group"
                >
                  <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition" />
                  <span className="text-xs text-zinc-300 group-hover:text-red-300 transition">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
