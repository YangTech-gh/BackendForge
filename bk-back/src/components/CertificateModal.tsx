import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  Download, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { UserState } from '../types';
import { COURSE_TRACKS } from '../data/coursesData';

interface CertificateModalProps {
  isOpen: boolean;
  userState?: UserState;
  onClose: () => void;
  onOpenUpgradeModal?: () => void;
  completedTrackId?: string;
  studentName?: string;
  trackTitle?: string;
  completionDate?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  userState,
  onClose,
  onOpenUpgradeModal,
  completedTrackId = 'track-1-node-ts',
  studentName: propStudentName,
  trackTitle: propTrackTitle,
}) => {
  if (!isOpen) return null;

  const [studentName, setStudentName] = useState(propStudentName || 'Alex Vance, Senior Engineer');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if user is Pro
  const isPro = userState?.tier === 'pro';

  // Find track or default
  const track = COURSE_TRACKS.find(t => t.id === completedTrackId) || COURSE_TRACKS[0];
  const certTitle = propTrackTitle || `Mastery Certificate: ${track.title}`;

  // Check completion: all labs in track must be in userState.completedLabs
  const trackLabIds = track.labs.map(l => l.id);
  const completedCount = userState?.completedLabs?.filter(id => trackLabIds.includes(id)).length || 0;
  const isTrackComplete = trackLabIds.length > 0 && completedCount === trackLabIds.length;

  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const certHash = `BF-CERT-2026-${Math.abs(
    (completedTrackId || 'FULL').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 8923
  ).toString(16).toUpperCase().padStart(8, '0')}`;

  // Launch confetti explosion on mount ONLY if track is completed
  useEffect(() => {
    if (isTrackComplete) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ec4899']
        });
      } catch (e) {
        console.log('Confetti effect triggered');
      }
    }
  }, [isTrackComplete]);

  const handleCopyVerification = () => {
    const text = `Verified Certificate of Completion: "${certTitle}" issued to ${studentName} by Backend Forge. Verification ID: ${certHash}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-6"
        >
          {/* Header Controls */}
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between print:hidden">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                OFFICIAL BACKEND FORGE CERTIFICATE OF MASTERY
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyVerification}
                className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-full text-xs transition font-mono"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{copiedLink ? 'Copied Verification' : 'Copy Share Text'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-full text-xs transition font-mono shadow-md shadow-indigo-600/30"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CERTIFICATE CONTENT OR LOCKED PROGRESS STATE */}
          {!isTrackComplete ? (
            <div className="p-8 sm:p-12 bg-zinc-950 text-white space-y-6">
              <div className="text-center space-y-3 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                  <Award className="w-8 h-8" />
                </div>
                
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
                  CERTIFICATE LOCKED • {completedCount}/{trackLabIds.length} LABS COMPLETED
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {track.title}
                </h2>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Official verified certificates are issued upon passing all required interactive labs and automated test suites in this curriculum track.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Track Progress:</span>
                  <span className="text-emerald-400 font-bold">{Math.round((completedCount / trackLabIds.length) * 100)}%</span>
                </div>
                <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, Math.round((completedCount / trackLabIds.length) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Module Checklist */}
              <div className="max-w-md mx-auto space-y-2.5 pt-2">
                <div className="text-xs font-mono uppercase text-zinc-500 font-bold">
                  Required Track Modules:
                </div>
                {track.labs.map((lab, idx) => {
                  const isDone = userState?.completedLabs?.includes(lab.id);
                  return (
                    <div 
                      key={lab.id} 
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono transition ${
                        isDone 
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-sans font-semibold text-white">{lab.title}</span>
                      </div>

                      {isDone ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASSED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          PENDING
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl text-xs transition font-mono shadow-lg shadow-indigo-600/30"
                >
                  Resume Interactive Labs & Complete Modules
                </button>
              </div>
            </div>
          ) : (
            /* PRINTABLE CERTIFICATE CANVAS */
            <div id="certificate-print-area" className="p-8 sm:p-12 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden border-8 border-zinc-900 text-white select-none">
              
              {/* FREE TIER WATERMARK OVERLAY */}
              {!isPro && (
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center rotate-[-25deg] opacity-15 select-none">
                  <div className="text-5xl sm:text-7xl font-black font-mono tracking-widest text-red-500 border-8 border-red-500 px-8 py-4 rounded-3xl uppercase text-center">
                    UNVERIFIED SAMPLE<br/>
                    PRO PASS REQUIRED
                  </div>
                </div>
              )}

              {/* Free Tier Callout Banner at top of canvas if not Pro */}
              {!isPro && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-900 to-indigo-950/80 border border-red-500/40 text-center space-y-2 relative z-30 print:hidden shadow-lg">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono font-bold border border-red-500/30">
                    <Sparkles className="w-3 h-3 text-red-400" />
                    <span>UNVERIFIED DRAFT PREVIEW</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans">
                    Official shareable PDF exports, LinkedIn credentials, and authenticated verification hashes are reserved for <strong className="text-white">Pro Lifetime Pass</strong> members.
                  </p>
                  {onOpenUpgradeModal && (
                    <button
                      onClick={onOpenUpgradeModal}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition font-mono shadow-md border border-red-500/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      <span>Unlock Verified Pro Certificate — $199</span>
                    </button>
                  )}
                </div>
              )}

              {/* Elegant Background Watermark & Corner Ornaments */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/40 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/40 rounded-br-xl" />

              <div className="relative z-10 text-center space-y-6 max-w-3xl mx-auto py-4">
                
                {/* Seal / Emblem */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/40 ring-4 ring-indigo-500/30">
                    BF
                  </div>
                </div>

                <div>
                  <span className={`text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isPro 
                      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {isPro ? 'BACKEND FORGE • VERIFIED ACADEMIC CREDENTIAL' : 'UNVERIFIED SAMPLE PREVIEW'}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-sans mt-3 tracking-tight">
                    Certificate of Completion
                  </h1>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Issued by the Backend Forge Academic Committee
                  </p>
                </div>

                {/* Recipient Name Section */}
                <div className="py-2">
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono">THIS CERTIFIES THAT</p>
                  {isEditingName ? (
                    <div className="flex items-center justify-center space-x-2 my-2">
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                        className="bg-zinc-800 border border-indigo-500 text-2xl sm:text-3xl font-extrabold text-center text-white rounded-xl px-4 py-1 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => setIsEditingName(false)}
                        className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h2 
                      onClick={() => setIsEditingName(true)}
                      className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-indigo-200 cursor-pointer hover:opacity-80 transition py-1"
                      title="Click to customize your student name"
                    >
                      {studentName} ✎
                    </h2>
                  )}
                  <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed mt-2 font-sans">
                    has successfully completed all hands-on code laboratories, technical RFC specifications, and automated test suite verifications for:
                  </p>
                </div>

                {/* Title & Competencies */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-center space-y-3 shadow-inner">
                  <h3 className="text-xl sm:text-2xl font-bold text-indigo-400 font-sans">
                    {certTitle}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                      Distributed Locking & Idempotency
                    </span>
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                      PostgreSQL MVCC & Isolation
                    </span>
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                      AI Agentic Tool Calling & pgvector
                    </span>
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">
                      High-Concurrency Systems
                    </span>
                  </div>
                </div>

                {/* Footer Meta Details */}
                <div className="pt-6 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left font-mono text-xs text-zinc-400">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">DATE ISSUED</div>
                    <div className="text-white font-semibold">{issueDate}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">VERIFICATION HASH</div>
                    <div className="text-indigo-400 font-bold tracking-wider">{certHash}</div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 text-right">
                    <div className="text-[10px] text-zinc-500 uppercase">VERIFIED STATUS</div>
                    <div className="text-emerald-400 font-bold flex items-center justify-end space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>AUTHENTICATED</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Footer Callout */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center text-xs font-mono text-zinc-500 print:hidden flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Tip: Click on your name on the certificate to edit it before printing.</span>
            <span className="text-indigo-400 font-bold">Backend Forge Academic Verification System</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
