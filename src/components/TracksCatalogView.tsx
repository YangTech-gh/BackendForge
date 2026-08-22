import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Zap,
  Code2,
  Search,
  Lightbulb,
  BookOpen,
  Code,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CourseTrack, CourseTier, UserState } from '../types';

const TIER_META: Record<CourseTier, { label: string; description: string; color: string }> = {
  fundamentals: { label: 'Tier 1: Fundamentals', description: 'Core backend principles - take these first', color: 'sky' },
  paradigm_stacks: { label: 'Tier 2: Paradigm Stacks', description: 'Pick your language and go deep', color: 'emerald' },
  architecture: { label: 'Tier 3: Architecture & Patterns', description: 'Apply across any stack', color: 'amber' },
  specialization: { label: 'Tier 4: Specialization', description: 'Deep expertise in niche domains', color: 'purple' },
};

interface TracksCatalogViewProps {
  userState: UserState;
  courses: CourseTrack[];
  onLaunchLab: (trackId: string, labId: string) => void;
  onOpenUpgradeModal: () => void;
  onOpenCertificateModal: (trackId?: string) => void;
  selectedTrackIdFromQuery?: string;
}

export const TracksCatalogView: React.FC<TracksCatalogViewProps> = ({
  userState,
  courses,
  onLaunchLab,
  onOpenUpgradeModal,
  onOpenCertificateModal,
  selectedTrackIdFromQuery,
}) => {
  const [selectedParadigm, setSelectedParadigm] = useState<string>('All');
  const [expandedTrackId, setExpandedTrackId] = useState<string>(selectedTrackIdFromQuery || 'track-2-node-ts');

  const paradigms = ['All', ...Array.from(new Set(courses.map(c => c.paradigm)))];

  const filteredTracks = courses.filter(track => {
    if (selectedParadigm === 'All') return true;
    return track.paradigm === selectedParadigm;
  });

  const tracksByTier = useMemo(() => {
    const grouped: Record<CourseTier, CourseTrack[]> = {
      fundamentals: [],
      paradigm_stacks: [],
      architecture: [],
      specialization: [],
    };
    filteredTracks.forEach(track => {
      const tier = track.tier || 'fundamentals';
      grouped[tier].push(track);
    });
    return grouped;
  }, [filteredTracks]);

  const tierOrder: CourseTier[] = ['fundamentals', 'paradigm_stacks', 'architecture', 'specialization'];
  const showTierGrouping = selectedParadigm === 'All';

  const renderTrackCard = (track: CourseTrack, idx: number) => {
    const isExpanded = expandedTrackId === track.id;

    return (
      <motion.div
        key={track.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: idx * 0.05 }}
        role="listitem"
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
              {isExpanded ? 'Collapse Details' : 'View Syllabus & Labs'}
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
                    {track.learningGoals.map((goal, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    SHIPPABLE PROJECT DELIVERABLE
                  </span>
                  <Code2 className="w-4 h-4 text-zinc-500" aria-hidden="true" />
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

              {/* Learning Path Progression Bar */}
              {track.labs.some(l => l.scaffolding?.stage) && (
                <div className="flex items-center gap-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-x-auto">
                  {(['Foundation', 'Building', 'Mastery'] as const).map((stage, i) => {
                    const stageLabs = track.labs.filter(l => l.scaffolding?.stage === stage);
                    const stageStyles = {
                      Foundation: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/15', numBg: 'bg-emerald-500/15', numText: 'text-emerald-400', labelText: 'text-emerald-400' },
                      Building: { bg: 'bg-amber-500/5', border: 'border-amber-500/15', numBg: 'bg-amber-500/15', numText: 'text-amber-400', labelText: 'text-amber-400' },
                      Mastery: { bg: 'bg-purple-500/5', border: 'border-purple-500/15', numBg: 'bg-purple-500/15', numText: 'text-purple-400', labelText: 'text-purple-400' },
                    };
                    const styles = stageStyles[stage];
                    const stageIcon = stage === 'Foundation' ? '01' : stage === 'Building' ? '02' : '03';
                    return (
                      <React.Fragment key={stage}>
                        {i > 0 && <div className="flex-shrink-0 w-8 h-px bg-zinc-700 mx-1" />}
                        <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl ${styles.bg} border ${styles.border}`}>
                          <div className={`w-7 h-7 rounded-lg ${styles.numBg} flex items-center justify-center text-[9px] font-mono font-bold ${styles.numText}`}>
                            {stageIcon}
                          </div>
                          <div>
                            <div className={`text-[10px] font-mono font-bold ${styles.labelText} uppercase`}>{stage}</div>
                            <div className="text-[9px] text-zinc-500">{stageLabs.length} lab{stageLabs.length !== 1 ? 's' : ''}</div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div className="flex-shrink-0 w-8 h-px bg-zinc-700 mx-1" />
                  <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/15">
                    <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-red-400 uppercase">Deliverable</div>
                      <div className="text-[9px] text-zinc-500">{track.deliverableProject.title.split(' ').slice(0, 3).join(' ')}...</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {track.labs?.map((lab) => {
                  const isLocked = lab.isPro && userState.tier === 'free';
                  const isCompleted = userState.completedLabs.includes(lab.id);

                  return (
                    <div
                      key={lab.id}
                      className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition ${
                        isCompleted ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
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
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span>{lab.durationMinutes} mins</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />}
                            <span>{lab.title}</span>
                          </span>
                          {isLocked && <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-label="Pro Tier Required" />}
                        </h4>

                        <p className="text-xs text-zinc-400 line-clamp-2">{lab.conceptSummary}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {lab.scaffolding?.stage && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${
                              lab.scaffolding.stage === 'Foundation' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              lab.scaffolding.stage === 'Building' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}>
                              <Layers className="w-3 h-3" aria-hidden="true" />
                              {lab.scaffolding.stage}
                            </span>
                          )}
                          {lab.tips && lab.tips.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Lightbulb className="w-3 h-3" aria-hidden="true" />
                              {lab.tips.length} tips
                            </span>
                          )}
                          {lab.lessons && lab.lessons.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <BookOpen className="w-3 h-3" aria-hidden="true" />
                              {lab.lessons.length} lessons
                            </span>
                          )}
                          {lab.exercises && lab.exercises.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Code className="w-3 h-3" aria-hidden="true" />
                              {lab.exercises.length} exercises
                            </span>
                          )}
                        </div>

                        {lab.scaffolding?.learningObjective && (
                          <p className="text-[10px] text-zinc-500 italic mt-1.5 leading-relaxed">
                            Goal: {lab.scaffolding.learningObjective}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {lab.testCases?.length || 0} Verification Tests
                        </span>
                        {isCompleted ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            <span>Completed</span>
                          </span>
                        ) : isLocked ? (
                          <button
                            onClick={onOpenUpgradeModal}
                            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                          >
                            <Zap className="w-3 h-3 fill-red-400" aria-hidden="true" />
                            <span>Unlock Pro Lab</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onLaunchLab(track.id, lab.id)}
                            className="flex items-center space-x-1 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition font-mono shadow-md shadow-red-600/25"
                          >
                            <Play className="w-3 h-3 fill-white" aria-hidden="true" />
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
  };

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Course Tracks Catalog">
      {/* Hidden SEO content block */}
      <div className="seo-hidden" aria-hidden="true">
        <h2>Backend Engineering Course Tracks - Enterprise Curriculum</h2>
        <p>
          Browse enterprise backend engineering tracks organized into 4 tiers: Fundamentals,
          Paradigm Stacks, Architecture and Patterns, and Specialization. Each track includes
          interactive labs with test verification, AI mentorship, and production-grade deliverables.
          Master TypeScript, Go, Rust, PostgreSQL, Redis, and distributed systems.
        </p>
      </div>
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
            <span>MODULAR CURRICULUM</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Backend Systems & Product Engineering Tracks
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {courses.length} tracks across 4 tiers. Mix and match modular tracks. Every track centers around building a production-grade, shippable backend engine with automated test verification.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-full border border-zinc-800 overflow-x-auto scrollbar-none" role="tablist" aria-label="Filter by paradigm">
          {paradigms.map(p => (
            <button
              key={p}
              onClick={() => setSelectedParadigm(p)}
              role="tab"
              aria-selected={selectedParadigm === p}
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
      </header>

      {/* Tracks */}
      <div className="space-y-8" role="list" aria-label="Course tracks">
        {filteredTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">
              {selectedParadigm === 'All' ? 'No tracks available yet' : 'No tracks match your filter'}
            </h3>
            <p className="text-zinc-500 text-sm max-w-md">
              {selectedParadigm === 'All'
                ? 'Enterprise curriculum tracks are being added soon.'
                : 'Try selecting a different paradigm filter.'}
            </p>
          </div>
        )}

        {showTierGrouping ? (
          tierOrder.map(tier => {
            const tierTracks = tracksByTier[tier];
            if (tierTracks.length === 0) return null;
            const meta = TIER_META[tier];
            return (
              <section key={tier} className="space-y-4">
                <div className={`border-l-2 pl-4 py-1 ${
                  tier === 'fundamentals' ? 'border-sky-500/40' :
                  tier === 'paradigm_stacks' ? 'border-emerald-500/40' :
                  tier === 'architecture' ? 'border-amber-500/40' :
                  'border-purple-500/40'
                }`}>
                  <h2 className={`text-sm font-mono font-bold uppercase tracking-wider ${
                    tier === 'fundamentals' ? 'text-sky-400' :
                    tier === 'paradigm_stacks' ? 'text-emerald-400' :
                    tier === 'architecture' ? 'text-amber-400' :
                    'text-purple-400'
                  }`}>
                    {meta.label}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{meta.description}</p>
                </div>
                <div className="space-y-4">
                  {tierTracks.map((track, idx) => renderTrackCard(track, idx))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="space-y-4">
            {filteredTracks.map((track, idx) => renderTrackCard(track, idx))}
          </div>
        )}
      </div>
    </div>
  );
};
