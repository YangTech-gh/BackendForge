import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Flame, 
  Cpu, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Play, 
  BookOpen, 
  Clock, 
  Zap,
  Code2
} from 'lucide-react';
import { motion } from 'motion/react';
import { COURSE_TRACKS } from '../data/coursesData';
import { CourseTrack, UserState } from '../types';

interface TracksCatalogViewProps {
  userState: UserState;
  onLaunchLab: (trackId: string, labId: string) => void;
  onOpenUpgradeModal: () => void;
  onOpenCertificateModal: (trackId?: string) => void;
  selectedTrackIdFromQuery?: string;
}

export const TracksCatalogView: React.FC<TracksCatalogViewProps> = ({
  userState,
  onLaunchLab,
  onOpenUpgradeModal,
  onOpenCertificateModal,
  selectedTrackIdFromQuery,
}) => {
  const [selectedParadigm, setSelectedParadigm] = useState<string>('All');
  const [expandedTrackId, setExpandedTrackId] = useState<string>(selectedTrackIdFromQuery || 'track-1-node-ts');

  const paradigms = ['All', 'Node.js & TypeScript', 'Ruby on Rails 7+', 'Rust & Go', 'AI-Native Engineering', 'Platform & Systems Architecture'];

  const filteredTracks = COURSE_TRACKS.filter(track => {
    if (selectedParadigm === 'All') return true;
    return track.paradigm === selectedParadigm;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>MODULAR CURRICULUM</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Backend Systems & Product Engineering Tracks
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Mix and match modular tracks across high-leverage paradigms. Every track centers around building a production-grade, shippable backend engine with automated test verification.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-full border border-zinc-800">
          {paradigms.map(p => (
            <button
              key={p}
              onClick={() => setSelectedParadigm(p)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition ${
                selectedParadigm === p
                  ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Accordion / Detailed List */}
      <div className="space-y-6">
        {filteredTracks.map((track, idx) => {
          const isExpanded = expandedTrackId === track.id;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className={`bg-zinc-900 border transition-all rounded-3xl overflow-hidden shadow-xl ${
                isExpanded ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Track Summary Bar */}
              <div
                onClick={() => setExpandedTrackId(isExpanded ? '' : track.id)}
                className="p-6 sm:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 hover:bg-zinc-800/60 transition"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center font-mono text-lg font-bold text-red-400 shrink-0 shadow-inner">
                    T{track.trackNumber}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${track.badgeColor}`}>
                        {track.paradigm}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {track.labs.length} Interactive Labs
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                      <span>{track.title}</span>
                    </h2>
                    <p className="text-xs text-zinc-400">{track.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                  <span className="text-xs font-mono font-bold text-red-400">
                    {isExpanded ? 'Collapse Details ▲' : 'View Syllabus & Labs ▼'}
                  </span>
                </div>
              </div>

              {/* Expanded Syllabus & Deliverable Details */}
              {isExpanded && (
                <div className="border-t border-zinc-800 p-6 sm:p-8 bg-zinc-950/80 space-y-6 animate-in fade-in duration-200">
                  
                  {/* Track Overview & Learning Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                        Track Philosophy & Scope
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {track.description}
                      </p>

                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-white">Core Systems Concepts:</div>
                        <ul className="space-y-1.5">
                          {track.learningGoals.map((goal, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Shippable Project Box */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                          SHIPPABLE PROJECT DELIVERABLE
                        </span>
                        <Code2 className="w-4 h-4 text-zinc-500" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{track.deliverableProject.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{track.deliverableProject.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {track.deliverableProject.techStack.map((tech, i) => (
                          <span key={i} className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Labs List */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                      Interactive Hands-On Labs ({track.labs.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {track.labs.map((lab) => {
                        const isLocked = lab.isPro && userState.tier === 'free';

                        return (
                          <div
                            key={lab.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full ${
                                    lab.difficulty === 'Staff' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold' :
                                    lab.difficulty === 'Advanced' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold' :
                                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                                  }`}>
                                    {lab.difficulty}
                                  </span>

                                  {!lab.isPro ? (
                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                                      FREE PREVIEW
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                                      PRO EXTENSION
                                    </span>
                                  )}
                                </div>

                                <span className="text-[10px] font-mono text-zinc-500 flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lab.durationMinutes} mins</span>
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                                <span>{lab.title}</span>
                                {isLocked && <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" title="Pro Tier Required" />}
                              </h4>

                              <p className="text-xs text-zinc-400 line-clamp-2">{lab.conceptSummary}</p>
                            </div>

                            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-500">
                                {lab.testCases.length} Verification Tests
                              </span>

                               {isLocked ? (
                                <button
                                  onClick={onOpenUpgradeModal}
                                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                                >
                                  <Zap className="w-3 h-3 fill-red-400" />
                                  <span>Unlock Pro Lab</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => onLaunchLab(track.id, lab.id)}
                                  className="flex items-center space-x-1 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition font-mono shadow-md shadow-red-600/25"
                                >
                                  <Play className="w-3 h-3 fill-white" />
                                  <span>Launch Lab</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
