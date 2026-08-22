import React, { useState } from 'react';
import {
  BookOpen, Lightbulb, Code, ChevronDown, CheckCircle2, XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLab } from '../../types';

interface InstructionsPaneProps {
  activeLab: CourseLab;
  testResults: { id: string; passed: boolean; output: string }[] | null;
}

export const InstructionsPane: React.FC<InstructionsPaneProps> = ({ activeLab, testResults }) => {
  const [showHint, setShowHint] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [showExercises, setShowExercises] = useState(false);

  return (
    <div className="space-y-4">
      <div className="card-elevated p-5 space-y-5 max-h-[720px] overflow-y-auto">
        {/* Concept Brief */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-red-400 font-bold tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> CONCEPT BRIEF
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">{activeLab.conceptSummary}</p>
        </div>

        {/* Instructions Checklist */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">Requirements</h3>
          <ol className="space-y-2">
            {activeLab.instructions.map((inst, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-red-500/20">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{inst}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Collapsible Sections */}
        {activeLab.tips?.length > 0 && (
          <CollapsibleSection
            title={`Pro Tips (${activeLab.tips.length})`}
            icon={<Lightbulb className="w-4 h-4 text-amber-400" />}
            color="amber"
            isOpen={showTips}
            onToggle={() => setShowTips(!showTips)}
          >
            <ul className="space-y-1.5">
              {activeLab.tips.map((tip, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">&bull;</span><span>{tip}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {activeLab.lessons?.length > 0 && (
          <CollapsibleSection
            title={`Key Lessons (${activeLab.lessons.length})`}
            icon={<BookOpen className="w-4 h-4 text-emerald-400" />}
            color="emerald"
            isOpen={showLessons}
            onToggle={() => setShowLessons(!showLessons)}
          >
            <ul className="space-y-1.5">
              {activeLab.lessons.map((lesson, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&bull;</span><span>{lesson}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {activeLab.exercises?.length > 0 && (
          <CollapsibleSection
            title={`Exercises (${activeLab.exercises.length})`}
            icon={<Code className="w-4 h-4 text-purple-400" />}
            color="purple"
            isOpen={showExercises}
            onToggle={() => setShowExercises(!showExercises)}
          >
            <ul className="space-y-1.5">
              {activeLab.exercises.map((ex, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">{i + 1}.</span><span>{ex}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Hint Toggle */}
        <div className="pt-2 border-t border-zinc-800/60 space-y-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 text-amber-300 text-xs font-mono font-bold border border-amber-500/20 hover:border-amber-500/40 transition"
          >
            <span className="flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /><span>Need a Hint?</span></span>
            <span className="text-[10px]">{showHint ? 'Hide' : 'Show'}</span>
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/20 text-xs text-amber-200/90 font-mono leading-relaxed"
              >
                <div className="font-bold text-amber-300 mb-1">Systems Hint:</div>
                <p className="text-[11px] font-sans">{activeLab?.conceptSummary || 'Focus on the core concepts.'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Test Cases */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/60">
          <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
            Test Verification ({activeLab.testCases.length})
          </h3>
          <div className="space-y-2">
            {activeLab.testCases.map((tc) => {
              const result = testResults?.find(r => r.id === tc.id);
              return (
                <div key={tc.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">{tc.name}</span>
                    {result ? (
                      result.passed ? (
                        <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> PASSED
                        </span>
                      ) : (
                        <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                          <XCircle className="w-3 h-3" /> FAILED
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">PENDING</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">{tc.expectedOutcome}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function CollapsibleSection({ title, icon, color, isOpen, onToggle, children }: {
  title: string; icon: React.ReactNode; color: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-400 hover:text-amber-300',
    emerald: 'text-emerald-400 hover:text-emerald-300',
    purple: 'text-purple-400 hover:text-purple-300',
  };
  return (
    <div className="mt-3">
      <button onClick={onToggle} className={`flex items-center gap-2 text-sm font-medium w-full ${colorMap[color] || ''}`}>
        {icon}<span>{title}</span>
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}
