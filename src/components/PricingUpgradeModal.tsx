import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { invokeEdgeFunction } from '../lib/api';
import { PRICING } from '../constants/pricing';

const stripePriceId = PRICING.STRIPE_PRICE_ID;

interface PricingUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  isProUser?: boolean;
}

export const PricingUpgradeModal: React.FC<PricingUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
  isProUser = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // IMP 4: Reset errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckoutError(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManageBilling = async () => {
    try {
      const { url } = await invokeEdgeFunction<{ url: string }>('stripe-portal', {
        method: 'POST',
      });
      window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  const handleCheckout = async () => {
    setCheckoutError(null);
    if (!stripePriceId) {
      setCheckoutError('Stripe is not configured. Please contact support.');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await invokeEdgeFunction<{ url: string }>('stripe-checkout', {
        body: { price_id: stripePriceId },
      });
      if (result.url) {
        window.location.href = result.url;
      } else {
        // BUG A: Reset processing state if no URL returned
        setCheckoutError('Failed to get checkout URL. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setCheckoutError('Checkout failed. Please try again or contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="pricing-modal-title">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950/60 hover:bg-zinc-800 transition z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-red-950 via-zinc-900 to-indigo-950 p-6 sm:p-8 md:p-10 border-b border-red-500/30 text-center space-y-3 relative text-white">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-red-300" aria-hidden="true" />
            <span>NO SUBSCRIPTION FATIGUE &bull; ONE-TIME PAYMENT</span>
          </div>
          <h2 id="pricing-modal-title" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">Backend Forge Pro Lifetime Pass</h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Claim lifetime access today for <strong className="text-emerald-400 font-mono text-base">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</strong> (Save 66% Off Standard Tier).
          </p>
          <div className="flex items-center justify-center space-x-4 pt-2 text-[10px] font-mono text-zinc-400">
            <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span>{PRICING.ENROLLMENT_COUNT} Engineers Enrolled</span></span>
            <span>&bull;</span>
            <span>4.9/5 Rating</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              ['All Enterprise Curriculum Tracks Unlocked', 'Node/TS, Rails 7+, Go/Rust Systems, AI-Native Agentic, Platform Engineering, Event-Driven CQRS, and Distributed Consensus.'],
              ['Unlimited Forger 1.0 AI Code Reviews', 'Instant automated feedback on database locking, idempotency keys, and security.'],
              ['Verified Certificate of Completion', 'Official, shareable, and printable Certificate with hash verification ID.'],
              ['1-on-1 Architecture Coaching Call', 'Book a 30-minute 1-on-1 technical or career coaching session with founder.'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex items-start space-x-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-sans">{title}</strong>
                  <span className="text-zinc-400">{desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-zinc-500 line-through text-sm font-mono">{PRICING.PRO_ORIGINAL_PRICE_DISPLAY}</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</span>
              <span className="text-xs text-zinc-400 font-mono">USD (One-Time)</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing || !stripePriceId}
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-extrabold py-4 rounded-2xl text-sm transition shadow-xl shadow-red-950/50 border border-red-500/30 font-sans flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isProcessing ? 'Redirecting to Stripe...' : `Unlock Lifetime Access Now — ${PRICING.PRO_LIFETIME_PRICE_DISPLAY}`}</span>
            </button>

            {checkoutError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <p className="text-red-300 text-xs font-mono">{checkoutError}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="text-[11px] font-mono font-bold text-red-400 hover:text-red-300 underline underline-offset-2"
                >
                  Try Again
                </button>
              </div>
            )}

            {isProUser && (
              <button
                onClick={handleManageBilling}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-2xl text-sm transition border border-zinc-700 font-sans"
              >
                Manage Subscription
              </button>
            )}

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
