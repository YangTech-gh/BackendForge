import React from 'react';
import {
  ChevronDown, Check, Lock, Play, Sparkles, Award, Layers, BookOpen,
} from 'lucide-react';
import { CourseTrack, UserState } from '../../types';

interface LabHeaderProps {
  currentTrack: CourseTrack;
  activeLabId: string;
  userState: UserState;
  courses: CourseTrack[];
  isTrackFullyCompleted: boolean;
  trackCompletedCount: number;
  currentTrackLabIds: string[];
  isCurrentLabCompleted: boolean;
  isRunningTests: boolean;
  isAiEvaluating: boolean;
  onSelectTrackAndLab?: (trackId: string, labId: string) => void;
  onOpenCertificateModal: (trackId?: string) => void;
  onRequestAiReview: () => void;
  onRunTests: () => void;
}

export const LabHeader: React.FC<LabHeaderProps> = ({
  currentTrack, activeLabId, userState, courses,
  isTrackFullyCompleted, trackCompletedCount, currentTrackLabIds, isCurrentLabCompleted,
  isRunningTests, isAiEvaluating,
  onSelectTrackAndLab, onOpenCertificateModal, onRequestAiReview, onRunTests,
}) => {
  const activeLab = currentTrack.labs.find(l => l.id === activeLabId) || currentTrack.labs[0];

  return (
    <div className="card-elevated p-5 sm:p-6 space-y-4">
      {/* Track & Lab Navigation Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {onSelectTrackAndLab ? (
              <div className="relative inline-flex items-center group">
                <select
                  value={currentTrack.id}
                  onChange={(e) => {
                    const target = courses.find(t => t.id === e.target.value);
                    if (target?.labs?.[0]) onSelectTrackAndLab(target.id, target.labs[0].id);
                  }}
                  className={`appearance-none cursor-pointer pl-3.5 pr-8 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${currentTrack.badgeColor} bg-zinc-950/90`}
                >
                  {courses.map(t => (
                    <option key={t.id} value={t.id} className="bg-zinc-950 text-zinc-200">
                      T{t.trackNumber}: {t.paradigm} ({t.labs?.length || 0} Labs)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-zinc-400" />
              </div>
            ) : (
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentTrack.badgeColor}`}>
                T{currentTrack.trackNumber}: {currentTrack.paradigm}
              </span>
            )}

            {isCurrentLabCompleted ? (
              <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check className="w-3 h-3" /> COMPLETED +150 XP
              </span>
            ) : (
              <span className="badge bg-red-500/10 text-red-300 border border-red-500/20">IN PROGRESS</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">{activeLab?.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenCertificateModal(currentTrack.id)}
            className={`btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 ${
              isTrackFullyCompleted ? '!bg-emerald-600/20 !border-emerald-500/30 !text-emerald-300' : ''
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${isTrackFullyCompleted ? 'text-amber-400' : ''}`} />
            <span>Certificate ({trackCompletedCount}/{currentTrackLabIds.length})</span>
          </button>

          <button onClick={onRequestAiReview} disabled={isAiEvaluating} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 !text-red-300 !border-red-500/20">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>{isAiEvaluating ? 'Evaluating...' : 'AI Review'}</span>
          </button>

          <button onClick={onRunTests} disabled={isRunningTests} className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2">
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningTests ? 'Running...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Lab Pills */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-mono text-zinc-500 uppercase font-bold shrink-0 flex items-center gap-1">
          <Layers className="w-3 h-3 text-red-400" /> Labs:
        </span>
        {currentTrack.labs.map((lab, idx) => {
          const isSelected = lab.id === activeLabId;
          const isDone = userState.completedLabs.includes(lab.id);
          return (
            <button
              key={lab.id}
              onClick={() => onSelectTrackAndLab?.(currentTrack.id, lab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 shrink-0 ${
                isSelected ? 'bg-red-500/15 text-red-200 border border-red-500/30 font-bold' : 'bg-zinc-800/60 text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <span>{currentTrack.trackNumber}.{idx + 1}</span>
              {isDone && <Check className="w-3 h-3 text-emerald-400" />}
              {lab.isPro ? (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 flex items-center gap-0.5">
                  <Lock className="w-2 h-2" /> PRO
                </span>
              ) : (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">FREE</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Guided Workflow Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${
            activeLab?.scaffolding?.stage === 'Foundation' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            activeLab?.scaffolding?.stage === 'Building' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-purple-500/10 text-purple-400 border-purple-500/20'
          }`}>
            {activeLab?.scaffolding?.stage === 'Foundation' ? '01' : activeLab?.scaffolding?.stage === 'Building' ? '02' : '03'}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{activeLab?.scaffolding?.stage || 'Stage'} Phase</div>
            <p className="text-[10px] text-zinc-400">
              {activeLab?.scaffolding?.stage === 'Foundation' && 'Build core concepts'}
              {activeLab?.scaffolding?.stage === 'Building' && 'Apply to real scenarios'}
              {activeLab?.scaffolding?.stage === 'Mastery' && 'Master production patterns'}
              {!activeLab?.scaffolding?.stage && 'Complete this lab'}
            </p>
          </div>
        </div>
        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-500/20">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Learning Goal</div>
            <p className="text-[10px] text-zinc-400 line-clamp-2">{activeLab?.scaffolding?.learningObjective || activeLab?.conceptSummary}</p>
          </div>
        </div>
        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-purple-500/20">
            <Play className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Run & Verify</div>
            <p className="text-[10px] text-zinc-400">
              {activeLab?.scaffolding?.buildsToward ? `Builds toward: ${activeLab.scaffolding.buildsToward}` : 'Run tests to verify'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
