import React from 'react';
import { Check, X, Zap, Sparkles, Trophy } from 'lucide-react';
import { PRICING } from '../constants/pricing';

interface PricingViewProps {
  onOpenUpgradeModal: () => void;
}

const FREE_FEATURES = [
  { label: '21 Learning Tracks', included: true },
  { label: '40+ Free Labs', included: true },
  { label: 'Community Discord', included: true },
  { label: 'Starter Kit Templates', included: true },
  { label: 'Architecture Teardowns', included: true },
  { label: 'AI Mentor (5 questions/day)', included: true },
  { label: 'Pro Labs (8 labs)', included: false },
  { label: 'Unlimited AI Mentor', included: false },
  { label: 'Certificate PDF Export', included: false },
  { label: '1-on-1 Coaching Calls', included: false },
  { label: 'Priority Support', included: false },
];

const PRO_FEATURES = [
  { label: 'Everything in Free', included: true },
  { label: 'All 48 Labs (Full Access)', included: true },
  { label: 'Unlimited AI Mentor', included: true },
  { label: 'Certificate PDF Export', included: true },
  { label: '2x 1-on-1 Coaching Calls', included: true },
  { label: 'Priority Discord Support', included: true },
  { label: 'Early Access to New Tracks', included: true },
  { label: 'Lifetime Updates', included: true },
];

export const PricingView: React.FC<PricingViewProps> = ({ onOpenUpgradeModal }) => {
  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Pricing">
      <header className="border-b border-zinc-800 pb-6 text-center">
        <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>PRICING</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Invest in Your Backend Career</h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl mx-auto">
          One-time payment. Lifetime access. No subscriptions. No hidden fees.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Tier */}
        <div className="liquid-glass border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Free</h2>
            <p className="text-3xl font-extrabold text-zinc-300">$0</p>
            <p className="text-xs text-zinc-500">Forever free</p>
          </div>
          <ul className="space-y-3">
            {FREE_FEATURES.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                {feature.included ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
                <span className={`text-sm ${feature.included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">Perfect for getting started</p>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="liquid-glass-red border border-red-500/30 rounded-3xl p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
            MOST POPULAR
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Pro Lifetime</span>
              <Sparkles className="w-5 h-5 text-red-400" />
            </h2>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-extrabold text-white">{PRICING.PRO_LIFETIME_PRICE_DISPLAY}</p>
              <p className="text-sm text-zinc-500 line-through">{PRICING.PRO_ORIGINAL_PRICE_DISPLAY}</p>
            </div>
            <p className="text-xs text-emerald-400 font-bold">One-time payment, lifetime access</p>
          </div>
          <ul className="space-y-3">
            {PRO_FEATURES.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-zinc-300">{feature.label}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onOpenUpgradeModal}
            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Upgrade to Pro</span>
          </button>
        </div>
      </div>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-white text-center">Frequently Asked Questions</h2>
        {[
          { q: 'Is it really a one-time payment?', a: 'Yes. You pay once and get lifetime access to all current and future content. No recurring charges.' },
          { q: 'What happens to my progress if I stay on Free?', a: 'Your progress is preserved. When you upgrade, all completed labs and XP carry over instantly.' },
          { q: 'Can I get a refund?', a: 'Yes, within 30 days if you have completed fewer than 3 labs. Contact support for a full refund.' },
          { q: 'Do coaching calls expire?', a: 'Coaching calls are valid for 12 months after purchase. Schedule them anytime within that window.' },
        ].map((faq, idx) => (
          <div key={idx} className="liquid-glass border border-zinc-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">{faq.q}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </section>

      {/* Social Proof */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-1 text-amber-400">
          {[...Array(5)].map((_, i) => <Trophy key={i} className="w-4 h-4" />)}
        </div>
        <p className="text-xs text-zinc-500">
          Trusted by <span className="text-zinc-300 font-bold">{PRICING.ENROLLMENT_COUNT}</span> backend engineers worldwide
        </p>
      </div>
    </div>
  );
};
