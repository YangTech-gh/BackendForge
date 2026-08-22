import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Users, 
  Calendar, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface PricingUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const PricingUpgradeModal: React.FC<PricingUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess();
      onClose();
      alert('🎉 CONGRATULATIONS! You are now a Backend Forge PRO LIFETIME Member! All 8 Enterprise Tracks, AI Code Reviews, and Coaching Calls are now unlocked.');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950/60 hover:bg-zinc-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Hero */}
        <div className="bg-gradient-to-br from-red-950 via-zinc-900 to-indigo-950 p-8 sm:p-10 border-b border-red-500/30 text-center space-y-3 relative text-white">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-red-300" />
            <span>NO SUBSCRIPTION FATIGUE • ONE-TIME PAYMENT</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Backend Forge Pro Lifetime Pass
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Claim lifetime access today for <strong className="text-emerald-400 font-mono text-base">$199</strong> (Save 66% Off $599 Standard Tier).
          </p>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Perks Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-sans">All 8 Enterprise Curriculum Tracks Unlocked</strong>
                <span className="text-zinc-400">Node/TS, Rails 7+, Go/Rust Systems, AI-Native Agentic, Platform Engineering, Event-Driven CQRS, Distributed Consensus, and FinTech Core Banking.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-sans">Unlimited Forger 1.0 AI Code Reviews</strong>
                <span className="text-zinc-400">Instant automated feedback on database locking, idempotency keys, and security.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-sans">Verified Certificate of Completion</strong>
                <span className="text-zinc-400">Official, shareable, and printable Certificate with hash verification ID.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-sans">1-on-1 Architecture Coaching Call</strong>
                <span className="text-zinc-400">Book a 30-minute 1-on-1 technical or career coaching session with founder.</span>
              </div>
            </div>

          </div>

          {/* Pricing Box & Guarantee */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-zinc-500 line-through text-sm font-mono">$599</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">$199</span>
              <span className="text-xs text-zinc-400 font-mono">USD (One-Time)</span>
            </div>

            <button
              onClick={handleSimulateCheckout}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-extrabold py-4 rounded-2xl text-sm transition shadow-xl shadow-red-950/50 border border-red-500/30 font-sans flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isProcessing ? 'Activating Pro Lifetime...' : 'Unlock Lifetime Access Now — $199'}</span>
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>14-Day No-Questions-Asked Money-Back Guarantee</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
